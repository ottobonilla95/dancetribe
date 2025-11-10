/**
 * Local script to send weekly digest emails
 * Run with: npx tsx scripts/send-weekly-digest.ts
 * 
 * Benefits:
 * - No serverless timeouts
 * - Can take as long as needed
 * - Full control and visibility
 */

import { getActiveUsersForDigest, getWeeklyDigestData, shouldSendDigest } from "@/utils/weekly-digest";
import { generateWeeklyDigestHTML, generateWeeklyDigestText } from "@/utils/email-templates/weekly-digest";
import { sendEmail } from "@/libs/resend";
import config from "@/config";
import { fetchAllSnapshots } from "@/utils/leaderboard-snapshot-optimized";

// 🚫 TEMPORARY: Emails to exclude during testing (already received digest)
const EXCLUDED_EMAILS = [
  "supinyat7677@gmail.com",
  "jaroldchristopherortiaga@gmail.com",
  "wojciechowskil@outlook.fr",
  "covaci_alexia@yahoo.com",
  "juliette.cazabat@gmail.com",
  "irinaxgeorgiana@gmail.com",
  "christina.jander@gmail.com",
  "ayesharazashoaib@gmail.com",
  "camillepouget.nc@gmail.com",
  "t.sandalova1998@gmail.com",
  "anniecartwright123@gmail.com",
  "raulmaciel346@gmail.com",
  "omar4795@gmail.com",
  "mariipilv@gmail.com",
  "perfectionista66@gmail.com",
  "jennyma3222@gmail.com",
  "alalboti@gmail.com",
  "caio.guima@outlook.com",
  "silpochova.nikolka@seznam.cz",
  "m.verges@outlook.com",
  "rafaeldavilasosa@hotmail.com",
  "clem03101997@icloud.com",
  "kratosrock@hotmail.it",
  "francoacunaaguilera@gmail.com",
  "lorenzo.kes@hotmail.it",
  "hugo.abrantes.soares@gmail.com",
  "elianamaceiras@hotmail.com",
  "michellbrunofar@gmail.com",
];

async function main() {
  console.log('🚀 Starting weekly digest send...\n');
  const startTime = Date.now();

  try {
    // ⚡ OPTIMIZATION: Fetch all leaderboard snapshots ONCE
    // This reduces 16 DB queries per user to just 2 total queries!
    console.log('📸 Fetching leaderboard snapshots...');
    await fetchAllSnapshots();
    console.log('✅ Snapshots cached!\n');

    // Get all active users
    const activeUserIds = await getActiveUsersForDigest();
    console.log(`📋 Found ${activeUserIds.length} active users\n`);

    let emailsSent = 0;
    let emailsSkipped = 0;
    let emailsFailed = 0;
    const failures: Array<{ userId: string; email?: string; error: string }> = [];

    // ⚠️ Resend rate limit: 2 requests/second
    // Process sequentially with 600ms delay to stay under limit
    const DELAY_BETWEEN_EMAILS = 600; // milliseconds (stays under 2/sec)
    const PROGRESS_UPDATE_EVERY = 10; // Show progress every 10 users

    console.log(`⚠️  Resend rate limit: 2 emails/second`);
    console.log(`⏱️  Processing sequentially with ${DELAY_BETWEEN_EMAILS}ms delays...\n`);

    for (let i = 0; i < activeUserIds.length; i++) {
      const userId = activeUserIds[i];
      
      // Show progress header every 10 users
      if (i % PROGRESS_UPDATE_EVERY === 0) {
        const progress = ((i / activeUserIds.length) * 100).toFixed(1);
        console.log(`\n📧 Progress: ${i}/${activeUserIds.length} (${progress}%) | Sent: ${emailsSent} | Skipped: ${emailsSkipped} | Failed: ${emailsFailed}`);
      }

      try {
        // Get digest data (using cached snapshots for speed!)
        const digestData = await getWeeklyDigestData(userId, true);

        if (!digestData) {
          emailsSkipped++;
          continue;
        }

        // 🚫 Skip excluded emails (testing)
        if (EXCLUDED_EMAILS.includes(digestData.user.email)) {
          emailsSkipped++;
          console.log(`   ⏭️  Skipped ${digestData.user.name} (already received)`);
          continue;
        }

        // Check if user has weekly digest enabled
        if (digestData.user.notificationSettings?.weeklyDigest === false) {
          emailsSkipped++;
          console.log(`   ⏭️  Skipped ${digestData.user.name} (disabled in settings)`);
          continue;
        }

        // Check if we should send (has activity)
        if (!shouldSendDigest(digestData)) {
          emailsSkipped++;
          continue;
        }

        // Generate email
        const html = generateWeeklyDigestHTML(digestData);
        const text = generateWeeklyDigestText(digestData);

        // Send email
        await sendEmail({
          to: digestData.user.email,
          subject: `💃 Your Week on ${config.appName}`,
          html,
          text,
        });

        emailsSent++;
        console.log(`   ✅ Sent to ${digestData.user.name} (${digestData.user.email})`);

        // Delay to respect rate limit
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_EMAILS));

      } catch (error: any) {
        emailsFailed++;
        failures.push({
          userId,
          error: error.message,
        });
        console.log(`   ❌ Failed for user ${userId}: ${error.message}`);
      }
    }

    const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n\n✅ Weekly digest completed!');
    console.log('━'.repeat(60));
    console.log(`📊 Final Results:`);
    console.log(`   Total users processed: ${activeUserIds.length}`);
    console.log(`   ✅ Emails sent: ${emailsSent}`);
    console.log(`   ⏭️  Skipped (no activity or excluded): ${emailsSkipped}`);
    console.log(`   ❌ Failed: ${emailsFailed}`);
    console.log(`   ⏱️  Total time: ${totalDuration} seconds`);
    
    if (failures.length > 0) {
      console.log(`\n❌ Failures (${failures.length}):`);
      failures.slice(0, 10).forEach(f => {
        console.log(`   - User ${f.userId}: ${f.error}`);
      });
      if (failures.length > 10) {
        console.log(`   ... and ${failures.length - 10} more`);
      }
    }
    console.log('━'.repeat(60));

  } catch (error: any) {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  }
}

// Run the script
main()
  .then(() => {
    console.log('\n👋 Done! Exiting...');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });

