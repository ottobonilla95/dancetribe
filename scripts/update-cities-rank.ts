import connectMongo from "../libs/mongoose";
import City from "../models/City";

async function updateCitiesFields() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await connectMongo();

    console.log("🔄 Updating cities fields...");
    const result = await City.updateMany(
      {}, // Empty filter = all documents
      {
        $set: { 
          totalDancers: 0, // Add total dancers count (starts at 0)
          danceStyles: [] // Add empty dance styles array
        }
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} cities`);
    console.log(`📊 Matched ${result.matchedCount} documents`);
    
    // Verify the update
    const sampleCities = await City.find({}).limit(3).select("name totalDancers danceStyles population");
    console.log("📋 Sample cities after update:", sampleCities);

  } catch (error) {
    console.error("❌ Error updating cities:", error);
  } finally {
    process.exit(0);
  }
}

// Run the script
updateCitiesFields(); 