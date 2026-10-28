import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function runConcurrencyTests() {
  console.log("🔒 Running ShopSense Concurrency & Transactional Inventory Stress Tests...\n");
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Setup a test product with exactly 5 units in stock
    const testProduct = await prisma.product.findFirst();
    assert(testProduct !== null, "Found test catalog product");

    const retailer = await prisma.retailerProfile.findFirst();
    assert(retailer !== null, "Found retailer profile");

    const inventory = await prisma.inventory.findFirst({
      where: { retailerId: retailer.id, productId: testProduct.id },
    });

    // Reset stock to exactly 5 units
    await prisma.inventory.update({
      where: { id: inventory.id },
      data: { quantity: 5 },
    });

    const initialStock = (await prisma.inventory.findUnique({ where: { id: inventory.id } })).quantity;
    assert(initialStock === 5, "Set initial stock to exactly 5 units");

    // 2. Concurrency Simulation: 5 simultaneous purchases of 2 units each (Total demanded = 10 units)
    // Only 2 purchases can succeed (2 * 2 = 4 units deducted, 1 remaining). 3 must fail due to insufficient stock.
    console.log("  ⚡ Firing 5 concurrent purchasing transactions of 2 units each (Available: 5 units)...");

    let successfulPurchases = 0;
    let failedPurchases = 0;

    const purchaseAttempts = Array.from({ length: 5 }).map(async (_, idx) => {
      try {
        await prisma.$transaction(async (tx) => {
          // Read authoritative stock inside transaction
          const inv = await tx.inventory.findUnique({
            where: { id: inventory.id },
          });

          if (!inv || inv.quantity < 2) {
            throw new Error(`Insufficient stock. Available: ${inv ? inv.quantity : 0}`);
          }

          // Atomic deduction
          const newQty = inv.quantity - 2;
          await tx.inventory.update({
            where: { id: inventory.id },
            data: { quantity: newQty },
          });

          // Record movement
          await tx.inventoryMovement.create({
            data: {
              inventoryId: inventory.id,
              changeQuantity: -2,
              previousQuantity: inv.quantity,
              newQuantity: newQty,
              reason: "SALE",
              referenceId: `TEST-CONCURRENCY-${idx}`,
            },
          });
        });

        successfulPurchases++;
      } catch (err) {
        failedPurchases++;
      }
    });

    await Promise.all(purchaseAttempts);

    assert(successfulPurchases === 2, `Exactly 2 transactions succeeded (Purchased 4 units)`);
    assert(failedPurchases === 3, `3 transactions safely aborted due to insufficient stock`);

    // Verify final stock is non-negative and equals exactly 1
    const finalStock = (await prisma.inventory.findUnique({ where: { id: inventory.id } })).quantity;
    assert(finalStock === 1, `Final inventory is exactly 1 unit (Never oversold or negative: ${finalStock})`);
    assert(finalStock >= 0, `Inventory strictly non-negative`);

    // 3. Verify Auditable Movement Ledger
    const movements = await prisma.inventoryMovement.findMany({
      where: {
        inventoryId: inventory.id,
        reason: "SALE",
        referenceId: { startsWith: "TEST-CONCURRENCY" },
      },
    });
    assert(movements.length === 2, `Auditable ledger recorded exactly 2 movement logs`);

    // Restore stock to healthy 50 units for continued use
    await prisma.inventory.update({
      where: { id: inventory.id },
      data: { quantity: 50 },
    });

    console.log("\n==========================================================================");
    console.log(`🎉 Concurrency Test Suite Complete: ${passed} passed, ${failed} failed`);
    console.log("==========================================================================\n");

    if (failed > 0) process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runConcurrencyTests();
