// Load environment variables from .env.local
import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(__dirname, "../.env.local") });

import connectMongo from "../libs/mongoose";
import User from "../models/User";
import readline from "readline";

/**
 * Migration Script: Set activeCity to match city for all users
 * 
 * This script updates all users who have a city but no activeCity set,
 * copying their home city to activeCity as the default.
 */

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Promisify question
function askQuestion(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer);
    });
  });
}

async function migrateActiveCity(dryRun: boolean = false) {
  try {
    console.log("\n" + "=".repeat(60));
    console.log("  MIGRATION: Set activeCity = city for all users");
    console.log("=".repeat(60) + "\n");

    // Connect to MongoDB
    console.log("📡 Connecting to MongoDB...");
    await connectMongo();
    console.log("✅ Connected to MongoDB\n");

    // Find users that need migration
    console.log("🔍 Finding users to migrate...");
    const usersToMigrate = await User.find({
      city: { $exists: true, $ne: null },
      $or: [
        { activeCity: { $exists: false } },
        { activeCity: null }
      ]
    }).select("name email city activeCity");

    console.log(`\n📊 Found ${usersToMigrate.length} users to migrate\n`);

    if (usersToMigrate.length === 0) {
      console.log("✨ No users need migration. All done!");
      return;
    }

    // Show sample users
    console.log("📋 Sample users (first 5):");
    console.log("-".repeat(60));
    usersToMigrate.slice(0, 5).forEach((user, index) => {
      console.log(`${index + 1}. ${user.name || 'N/A'} (${user.email})`);
      console.log(`   City: ${user.city}`);
      console.log(`   Active City: ${user.activeCity || 'Not set'}`);
      console.log("-".repeat(60));
    });

    if (usersToMigrate.length > 5) {
      console.log(`... and ${usersToMigrate.length - 5} more\n`);
    }

    if (dryRun) {
      console.log("\n🔍 DRY RUN MODE - No changes will be made");
      console.log("\nMigration plan:");
      console.log(`- Will update ${usersToMigrate.length} users`);
      console.log("- Will set activeCity = city for each user");
      console.log("\nRun without --dry-run flag to apply changes\n");
      return;
    }

    // Ask for confirmation
    console.log("\n⚠️  WARNING: This will update the database!");
    console.log(`This will set activeCity = city for ${usersToMigrate.length} users.\n`);
    
    const answer = await askQuestion("Do you want to proceed? (yes/no): ");
    
    if (answer.toLowerCase() !== 'yes') {
      console.log("\n❌ Migration cancelled by user\n");
      return;
    }

    // Perform migration
    console.log("\n🚀 Starting migration...\n");
    let successCount = 0;
    let errorCount = 0;

    for (const user of usersToMigrate) {
      try {
        await User.updateOne(
          { _id: user._id },
          { $set: { activeCity: user.city } }
        );
        successCount++;
        
        if (successCount % 10 === 0) {
          process.stdout.write(`\r✅ Migrated: ${successCount}/${usersToMigrate.length}`);
        }
      } catch (error) {
        errorCount++;
        console.error(`\n❌ Error migrating user ${user.email}:`, error);
      }
    }

    console.log("\n\n" + "=".repeat(60));
    console.log("  MIGRATION COMPLETE");
    console.log("=".repeat(60));
    console.log(`✅ Successfully migrated: ${successCount} users`);
    if (errorCount > 0) {
      console.log(`❌ Errors: ${errorCount} users`);
    }
    console.log("=".repeat(60) + "\n");

    // Verify migration
    console.log("🔍 Verifying migration...");
    const remainingUsers = await User.countDocuments({
      city: { $exists: true, $ne: null },
      $or: [
        { activeCity: { $exists: false } },
        { activeCity: null }
      ]
    });

    if (remainingUsers === 0) {
      console.log("✅ Verification passed: All users have activeCity set\n");
    } else {
      console.log(`⚠️  Warning: ${remainingUsers} users still need migration\n`);
    }

  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    throw error;
  }
}

// Main execution
async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  
  try {
    await migrateActiveCity(isDryRun);
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  } finally {
    rl.close();
    process.exit(0);
  }
}

// Run the script
main();

