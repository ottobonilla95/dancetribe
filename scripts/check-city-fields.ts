import connectMongo from "../libs/mongoose";
import City from "../models/City";

async function checkCityFields() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await connectMongo();

    const city = await City.findOne({}).lean();
    console.log("📋 Full city document:");
    console.log(JSON.stringify(city, null, 2));

    // Check specific fields
    const citiesWithNewFields = await City.find({
      totalDancers: { $exists: true },
      danceStyles: { $exists: true }
    }).countDocuments();
    
    console.log(`📊 Cities with new fields: ${citiesWithNewFields}`);

  } catch (error) {
    console.error("❌ Error checking cities:", error);
  } finally {
    process.exit(0);
  }
}

checkCityFields(); 