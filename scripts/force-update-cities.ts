import connectMongo from "../libs/mongoose";
import mongoose from "mongoose";

async function forceUpdateCities() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await connectMongo();

    // Direct MongoDB operation
    const db = mongoose.connection.db;
    const result = await db.collection('cities').updateMany(
      {}, // All documents
      {
        $set: {
          totalDancers: 0,
          danceStyles: []
        }
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} cities`);
    console.log(`📊 Matched ${result.matchedCount} documents`);
    
    // Verify with direct query
    const city = await db.collection('cities').findOne({});
    console.log("📋 City after update:", city);

  } catch (error) {
    console.error("❌ Error updating cities:", error);
  } finally {
    process.exit(0);
  }
}

forceUpdateCities(); 