import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Papa from "papaparse";
import { z } from "zod";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    let retailerId = session?.retailerProfileId;

    if (!retailerId) {
      const apex = await prisma.retailerProfile.findFirst({
        where: { storeSlug: "apex-tech-direct" },
      });
      retailerId = apex?.id;
    }

    if (!retailerId) {
      return NextResponse.json({ error: "Retailer profile required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "30", 10);
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const salesEvents = await prisma.salesEvent.findMany({
      where: {
        retailerId,
        eventDate: { gte: cutoff },
      },
      orderBy: { eventDate: "asc" },
      include: {
        product: {
          select: {
            title: true,
            brand: true,
            category: { select: { name: true } },
          },
        },
      },
    });

    // Group by category
    const categoryTotals = new Map<string, { units: number; revenue: number; profit: number }>();
    salesEvents.forEach((se) => {
      const cat = se.product?.category?.name || "General Tech";
      const cur = categoryTotals.get(cat) || { units: 0, revenue: 0, profit: 0 };
      cur.units += se.units;
      cur.revenue += se.revenue;
      cur.profit += se.profit;
      categoryTotals.set(cat, cur);
    });

    const categoryBreakdown = Array.from(categoryTotals.entries()).map(([name, data]) => ({
      name,
      units: data.units,
      revenue: Math.round(data.revenue),
      profit: Math.round(data.profit),
      margin: data.revenue > 0 ? parseFloat(((data.profit / data.revenue) * 100).toFixed(1)) : 0,
    }));

    return NextResponse.json({
      totalEvents: salesEvents.length,
      categoryBreakdown,
      recentSales: salesEvents.slice(-20).map((s) => ({
        id: s.id,
        date: s.eventDate,
        productTitle: s.product.title,
        brand: s.product.brand,
        units: s.units,
        revenue: s.revenue,
        profit: s.profit,
      })),
    });
  } catch (error) {
    console.error("Retailer sales GET error:", error);
    return NextResponse.json({ error: "Failed to load sales analytics" }, { status: 500 });
  }
}

// POST: Parse & Validate CSV Sales Import
export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    let retailerId = session?.retailerProfileId;

    if (!retailerId) {
      const apex = await prisma.retailerProfile.findFirst({
        where: { storeSlug: "apex-tech-direct" },
      });
      retailerId = apex?.id;
    }

    if (!retailerId) {
      return NextResponse.json({ error: "Retailer profile required" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const confirmCommit = formData.get("commit") === "true";

    if (!file) {
      return NextResponse.json({ error: "CSV file is required" }, { status: 400 });
    }

    const csvText = await file.text();
    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    const rows = parsed.data as any[];
    if (rows.length === 0) {
      return NextResponse.json({ error: "Uploaded CSV contains no valid data rows" }, { status: 400 });
    }

    // Required columns
    const requiredCols = ["date", "sku", "product_name", "units_sold", "unit_price", "unit_cost"];
    const fileHeaders = parsed.meta.fields || [];
    const missingHeaders = requiredCols.filter((col) => !fileHeaders.includes(col));

    if (missingHeaders.length > 0) {
      return NextResponse.json(
        {
          error: `Missing required column headers: ${missingHeaders.join(", ")}`,
          expectedColumns: requiredCols,
        },
        { status: 400 }
      );
    }

    // Row-by-row validation
    const validRows: any[] = [];
    const validationErrors: Array<{ row: number; error: string }> = [];

    // Get retailer products map by title or SKU
    const retailerProducts = await prisma.product.findMany({
      where: { inventory: { some: { retailerId } } },
      select: { id: true, title: true },
    });
    const defaultProductId = retailerProducts[0]?.id;

    rows.forEach((row, idx) => {
      const rowNum = idx + 2; // header is row 1
      const units = parseInt(row.units_sold, 10);
      const price = parseFloat(row.unit_price);
      const cost = parseFloat(row.unit_cost);
      const date = new Date(row.date);

      if (isNaN(date.getTime())) {
        validationErrors.push({ row: rowNum, error: `Invalid date format: "${row.date}"` });
        return;
      }
      if (isNaN(units) || units <= 0) {
        validationErrors.push({ row: rowNum, error: `units_sold must be a positive integer, got: "${row.units_sold}"` });
        return;
      }
      if (isNaN(price) || price < 0) {
        validationErrors.push({ row: rowNum, error: `unit_price must be a positive number, got: "${row.unit_price}"` });
        return;
      }
      if (isNaN(cost) || cost < 0) {
        validationErrors.push({ row: rowNum, error: `unit_cost must be a positive number, got: "${row.unit_cost}"` });
        return;
      }

      const revenue = units * price;
      const totalCost = units * cost;
      const profit = revenue - totalCost;

      // Find matching product or fallback to default
      const matched = retailerProducts.find((p) => p.title.toLowerCase().includes(row.product_name.toLowerCase())) || { id: defaultProductId };

      validRows.push({
        retailerId,
        productId: matched.id,
        units,
        revenue,
        cost: totalCost,
        profit,
        eventDate: date,
        sku: row.sku,
        productName: row.product_name,
      });
    });

    // If preview only (not commit)
    if (!confirmCommit) {
      return NextResponse.json({
        isPreview: true,
        totalRows: rows.length,
        validCount: validRows.length,
        errorCount: validationErrors.length,
        validationErrors: validationErrors.slice(0, 10),
        previewRows: validRows.slice(0, 5),
      });
    }

    // Commit valid records transactionally
    if (validRows.length === 0) {
      return NextResponse.json({ error: "No valid rows found to import." }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      for (const row of validRows) {
        await tx.salesEvent.create({
          data: {
            retailerId: row.retailerId,
            productId: row.productId,
            units: row.units,
            revenue: row.revenue,
            cost: row.cost,
            profit: row.profit,
            eventDate: row.eventDate,
          },
        });
      }

      await tx.notification.create({
        data: {
          retailerId,
          title: "Sales CSV Import Successful",
          message: `Successfully imported ${validRows.length} sales events into your live analytics ledger.`,
          type: "IMPORT_SUCCESS",
          link: "/retailer/sales",
        },
      });

      await tx.auditLog.create({
        data: {
          retailerId,
          action: "IMPORT_SALES_CSV",
          entityType: "SalesEvent",
          detailsJson: JSON.stringify({ importedCount: validRows.length, filename: file.name }),
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${validRows.length} historical sales records.`,
      importedCount: validRows.length,
    });
  } catch (error: any) {
    console.error("Sales CSV import error:", error);
    return NextResponse.json({ error: error.message || "Failed to process CSV file" }, { status: 500 });
  }
}
