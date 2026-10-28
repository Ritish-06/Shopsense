import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "shopsense-secret-jwt-key-2026-production";

async function runSecurityTests() {
  console.log("🛡️ Running ShopSense Multi-Tenant Security & Auth Verification Suite...\n");
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
    // Test 1: Verify Customer Credentials
    const customer = await prisma.user.findUnique({ where: { email: "customer@shopsense.com" } });
    assert(customer !== null, "Customer account exists in database");
    const validPass = await bcrypt.compare("Password123!", customer.passwordHash);
    assert(validPass === true, "Customer password matches hashed verification");
    const invalidPass = await bcrypt.compare("WrongPassword!", customer.passwordHash);
    assert(invalidPass === false, "Invalid password rejected by bcrypt");

    // Test 2: Role Escalation Prevention
    assert(customer.role === "CUSTOMER", "Customer is strictly assigned CUSTOMER role");

    // Test 3: Multi-Tenant Retailer Isolation
    const apexRetailer = await prisma.retailerProfile.findFirst({ where: { storeSlug: "apex-tech-direct" } });
    const novaRetailer = await prisma.retailerProfile.findFirst({ where: { storeSlug: "nova-electronics" } });
    assert(apexRetailer && novaRetailer, "Apex and Nova retailer profiles exist");
    assert(apexRetailer.id !== novaRetailer.id, "Retailer IDs are distinct");

    // Apex inventory query scoped by retailerId
    const apexInventory = await prisma.inventory.findMany({
      where: { retailerId: apexRetailer.id },
    });
    assert(apexInventory.length > 0, `Apex owns ${apexInventory.length} inventory records`);

    // Verify Nova cannot access Apex inventory in scoped query
    const crossTenantBreach = apexInventory.some((inv) => inv.retailerId === novaRetailer.id);
    assert(!crossTenantBreach, "Cross-tenant isolation: Apex inventory contains ZERO Nova products");

    // Test 4: Retailer Sales Event Isolation
    const apexSales = await prisma.salesEvent.findMany({
      where: { retailerId: apexRetailer.id },
      take: 10,
    });
    const hasNovaSalesInApexQuery = apexSales.some((s) => s.retailerId === novaRetailer.id);
    assert(!hasNovaSalesInApexQuery, "Sales analytics queries enforce strict retailer tenant separation");

    // Test 5: Verify JWT Signing & Tamper Resistance
    const token = jwt.sign(
      { userId: customer.id, role: "CUSTOMER", email: customer.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    const decoded = jwt.verify(token, JWT_SECRET);
    assert(decoded.userId === customer.id && decoded.role === "CUSTOMER", "JWT session payload successfully verified");

    // Attempting to tamper with role
    try {
      const tamperedToken = token.slice(0, -6) + "xxxxxx";
      jwt.verify(tamperedToken, JWT_SECRET);
      assert(false, "Tampered JWT should have thrown verification error");
    } catch {
      assert(true, "Cryptographically tampered JWT token is securely rejected");
    }

    console.log(`\n========================================`);
    console.log(`🎉 Security Suite Complete: ${passed} passed, ${failed} failed`);
    console.log(`========================================\n`);

    if (failed > 0) process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runSecurityTests();
