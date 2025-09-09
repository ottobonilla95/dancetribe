import connectMongo from "../libs/mongoose";
import User from "../models/User";

async function updateUsersFields() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await connectMongo();

    console.log("🔄 Adding city and danceStyles fields to users...");
    const result = await User.updateMany(
      {}, // Empty filter = all documents
      {
        $set: { 
          city: null, // No city assigned yet
          danceStyles: [] // Empty dance styles array
        }
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} users`);
    console.log(`📊 Matched ${result.matchedCount} documents`);
    
    // Verify the update
    const sampleUsers = await User.find({}).limit(3).select("name email city danceStyles");
    console.log("📋 Sample users after update:", sampleUsers);

  } catch (error) {
    console.error("❌ Error updating users:", error);
  } finally {
    process.exit(0);
  }
}

// Run the script
updateUsersFields(); 