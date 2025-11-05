import { NextResponse } from "next/server";
import { getActiveUsersForDigest, getWeeklyDigestData, shouldSendDigest } from "@/utils/weekly-digest";
import { generateWeeklyDigestHTML, generateWeeklyDigestText } from "@/utils/email-templates/weekly-digest";
import { sendEmail } from "@/libs/resend";
import config from "@/config";

/**
 * POST /api/cron/weekly-digest
 * 
 * Sends weekly digest emails to all active users.
 * Should be called via cron every Monday morning.
 * 
 * Security: Protected by cron secret or admin auth
 */
export async function POST(req: Request) {
  try {
    // Check authorization
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Allow either cron secret or admin session
    const isAuthorizedCron = cronSecret && authHeader === `Bearer ${cronSecret}`;
    
    if (!isAuthorizedCron) {
      // Alternative: check if admin (for manual testing)
      // You could add session check here if needed
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log('🚀 Starting weekly digest job...');

    // Get all active users
    const activeUserIds = await getActiveUsersForDigest();
    console.log(`📋 Found ${activeUserIds.length} active users`);

    let emailsSent = 0;
    let emailsSkipped = 0;
    let emailsFailed = 0;
    const failures: Array<{ userId: string; error: string }> = [];

    // Process users in batches to avoid overwhelming the email service
    const BATCH_SIZE = 50;
    const DELAY_BETWEEN_BATCHES = 2000; // 2 seconds

    for (let i = 0; i < activeUserIds.length; i += BATCH_SIZE) {
      const batch = activeUserIds.slice(i, i + BATCH_SIZE);
      
      console.log(`📧 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(activeUserIds.length / BATCH_SIZE)}...`);

      // Process batch in parallel
      await Promise.all(
        batch.map(async (userId) => {
          try {
            // Get digest data
            const digestData = await getWeeklyDigestData(userId);

            if (!digestData) {
              emailsSkipped++;
              return;
            }

            // Check if user has weekly digest enabled
            if (digestData.user.notificationSettings?.weeklyDigest === false) {
              emailsSkipped++;
              console.log(`⏭️ Skipped ${digestData.user.name} - weekly digest disabled in settings`);
              return;
            }

            // Check if we should send (has activity)
            if (!shouldSendDigest(digestData)) {
              emailsSkipped++;
              return;
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
            console.log(`✅ Sent digest to ${digestData.user.name} (${digestData.user.email})`);
          } catch (error: any) {
            console.error(`❌ Failed to send digest to user ${userId}:`, error.message);
            emailsFailed++;
            failures.push({
              userId,
              error: error.message,
            });
          }
        })
      );

      // Delay between batches to avoid rate limits
      if (i + BATCH_SIZE < activeUserIds.length) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }
    }

    const summary = {
      success: true,
      totalUsers: activeUserIds.length,
      emailsSent,
      emailsSkipped,
      emailsFailed,
      timestamp: new Date().toISOString(),
      ...(failures.length > 0 && { failures: failures.slice(0, 10) }), // Show first 10 failures
    };

    console.log('✅ Weekly digest job completed:', summary);

    return NextResponse.json(summary);
  } catch (error: any) {
    console.error('💥 Weekly digest job failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cron/weekly-digest
 * 
 * Returns info about the weekly digest endpoint (for testing)
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/cron/weekly-digest',
    method: 'POST',
    description: 'Sends weekly digest emails to all active users',
    authentication: 'Bearer token with CRON_SECRET',
    schedule: 'Every Monday at 9:00 AM',
    rateLimit: '50 emails per batch with 2s delay between batches',
  });
}

