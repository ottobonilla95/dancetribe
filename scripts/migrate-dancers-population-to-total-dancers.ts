import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from .env.local
config({ path: resolve(__dirname, "../.env.local") });

import connectMongo from "../libs/mongoose";
import City from "../models/City";

async function migrateDancersPopulationToTotalDancers() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await connectMongo();

    console.log("🔄 Checking current field status...");
    
    // Check how many cities have the old field
    const citiesWithOldField = await City.find({
      dancersPopulation: { $exists: true }
    }).countDocuments();
    
    // Check how many cities already have the new field
    const citiesWithNewField = await City.find({
      totalDancers: { $exists: true }
    }).countDocuments();

    console.log(`📊 Cities with 'dancersPopulation' field: ${citiesWithOldField}`);
    console.log(`📊 Cities with 'totalDancers' field: ${citiesWithNewField}`);

    if (citiesWithOldField === 0) {
      console.log("✅ No cities with 'dancersPopulation' field found. Migration not needed.");
      return;
    }

    console.log("🔄 Migrating 'dancersPopulation' to 'totalDancers'...");
    
    // Step 1: Copy dancersPopulation to totalDancers for cities that don't have totalDancers
    const copyResult = await City.updateMany(
      { 
        dancersPopulation: { $exists: true },
        totalDancers: { $exists: false }
      },
      [
        {
          $set: {
            totalDancers: { $ifNull: ["$dancersPopulation", 0] }
          }
        }
      ]
    );

    console.log(`✅ Copied dancersPopulation to totalDancers for ${copyResult.modifiedCount} cities`);

    // Step 2: For cities that have both fields, use the max value
    const maxValueResult = await City.updateMany(
      { 
        dancersPopulation: { $exists: true },
        totalDancers: { $exists: true }
      },
      [
        {
          $set: {
            totalDancers: { 
              $max: [
                { $ifNull: ["$dancersPopulation", 0] },
                { $ifNull: ["$totalDancers", 0] }
              ]
            }
          }
        }
      ]
    );

    console.log(`✅ Updated totalDancers with max value for ${maxValueResult.modifiedCount} cities`);

    // Step 3: Remove the old dancersPopulation field
    const removeResult = await City.updateMany(
      { dancersPopulation: { $exists: true } },
      { $unset: { dancersPopulation: "" } }
    );

    console.log(`✅ Removed 'dancersPopulation' field from ${removeResult.modifiedCount} cities`);

    // Verify the migration
    const finalCheck = await City.find({}).limit(5).select("name totalDancers");
    console.log("📋 Sample cities after migration:", finalCheck);

    // Final counts
    const finalOldCount = await City.find({ dancersPopulation: { $exists: true } }).countDocuments();
    const finalNewCount = await City.find({ totalDancers: { $exists: true } }).countDocuments();
    
    console.log(`📊 Final: Cities with 'dancersPopulation': ${finalOldCount}`);
    console.log(`📊 Final: Cities with 'totalDancers': ${finalNewCount}`);
    
    if (finalOldCount === 0) {
      console.log("🎉 Migration completed successfully!");
    } else {
      console.log("⚠️  Migration may not be complete. Some cities still have 'dancersPopulation' field.");
    }

  } catch (error) {
    console.error("❌ Error during migration:", error);
  } finally {
    process.exit(0);
  }
}

// Run the migration
migrateDancersPopulationToTotalDancers(); 