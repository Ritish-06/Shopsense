import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function runForecastEvaluation() {
  console.log("📈 Running ShopSense Demand Forecasting Evaluation Suite (No Data Leakage)...\n");

  const retailer = await prisma.retailerProfile.findFirst({
    where: { storeSlug: "apex-tech-direct" },
  });

  if (!retailer) {
    console.error("Retailer Apex Tech Direct not found");
    process.exit(1);
  }

  // Get top 5 products with extensive sales history
  const products = await prisma.product.findMany({
    where: {
      salesEvents: { some: { retailerId: retailer.id } },
    },
    take: 5,
    include: {
      salesEvents: {
        where: { retailerId: retailer.id },
        orderBy: { eventDate: "asc" },
      },
    },
  });

  const evaluationTable = [];

  for (const prod of products) {
    const dailyUnits = prod.salesEvents.map((s) => s.units);
    if (dailyUnits.length < 20) continue;

    // Time-based split: First 80% train, last 20% validation
    const splitIndex = Math.floor(dailyUnits.length * 0.8);
    const train = dailyUnits.slice(0, splitIndex);
    const test = dailyUnits.slice(splitIndex);

    // 1. Baseline 1: Historical Mean
    const meanTrain = train.reduce((a, b) => a + b, 0) / train.length;
    let maeMean = 0;
    test.forEach((actual) => {
      maeMean += Math.abs(actual - meanTrain);
    });
    maeMean = maeMean / test.length;

    // 2. Baseline 2: 7-Day Simple Moving Average (SMA)
    const smaWindow = 7;
    let currentSma = train.slice(-smaWindow).reduce((a, b) => a + b, 0) / smaWindow;
    let maeSma = 0;
    test.forEach((actual) => {
      maeSma += Math.abs(actual - currentSma);
      // Roll forward
      currentSma = (currentSma * (smaWindow - 1) + actual) / smaWindow;
    });
    maeSma = maeSma / test.length;

    // 3. Model: Exponential Smoothing (alpha = 0.3)
    const alpha = 0.3;
    let expS = train[0];
    for (let i = 1; i < train.length; i++) {
      expS = alpha * train[i] + (1 - alpha) * expS;
    }

    let maeExp = 0;
    test.forEach((actual) => {
      maeExp += Math.abs(actual - expS);
      expS = alpha * actual + (1 - alpha) * expS;
    });
    maeExp = maeExp / test.length;

    const improvementVsMean = (((maeMean - maeExp) / maeMean) * 100).toFixed(1) + "%";

    evaluationTable.push({
      Product: prod.title.slice(0, 28),
      TestDays: test.length,
      "Baseline Mean MAE": maeMean.toFixed(2),
      "7-Day SMA MAE": maeSma.toFixed(2),
      "Exp Smoothing MAE": maeExp.toFixed(2),
      Improvement: improvementVsMean,
    });
  }

  console.log("==========================================================================================");
  console.log("📊 Time-Series Demand Forecasting Evaluation Comparison:");
  console.log("   Split method: Chronological 80/20 train/test split (Zero chronological data leakage)");
  console.log("==========================================================================================");
  console.table(evaluationTable);
  console.log("==========================================================================================\n");

  await prisma.$disconnect();
}

runForecastEvaluation().catch((e) => {
  console.error("Evaluation error:", e);
  process.exit(1);
});
