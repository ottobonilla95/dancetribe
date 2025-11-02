import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import { sendEmail } from "@/libs/resend";
import config from "@/config";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();

    const { suggestion, category } = body;

    if (!suggestion || suggestion.trim().length === 0) {
      return NextResponse.json(
        { error: "Suggestion is required" },
        { status: 400 }
      );
    }

    // Get user info
    const userName = session?.user?.name || "Anonymous";
    const userEmail = session?.user?.email || "Not provided";
    const userId = session?.user?.id || "N/A";

    // Category emoji
    const categoryEmoji: { [key: string]: string } = {
      feature: "✨",
      improvement: "🚀",
      other: "💭",
    };

    // Send email to admin
    const emailSubject = `${categoryEmoji[category] || "💡"} New ${category === "feature" ? "Feature Request" : category === "improvement" ? "Improvement Idea" : "Suggestion"} from ${userName}`;
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">
            ${categoryEmoji[category] || "💡"} New Suggestion!
          </h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="margin-top: 0; color: #333; font-size: 18px; border-bottom: 2px solid #667eea; padding-bottom: 10px;">
              📋 Suggestion Details
            </h2>
            
            <div style="margin: 20px 0;">
              <p style="margin: 5px 0; color: #666;"><strong>Category:</strong> ${category.charAt(0).toUpperCase() + category.slice(1)}</p>
              <p style="margin: 5px 0; color: #666;"><strong>From:</strong> ${userName}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Email:</strong> ${userEmail}</p>
              <p style="margin: 5px 0; color: #666;"><strong>User ID:</strong> ${userId}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            </div>
          </div>

          <div style="background: white; padding: 25px; border-radius: 8px;">
            <h3 style="margin-top: 0; color: #333; font-size: 16px;">💭 The Suggestion:</h3>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; border-left: 4px solid #667eea;">
              <p style="margin: 0; color: #333; line-height: 1.6; white-space: pre-wrap;">${suggestion}</p>
            </div>
          </div>

          <div style="margin-top: 20px; text-align: center; color: #999; font-size: 12px;">
            <p>This suggestion was submitted via the ${config.appName} Suggestion Box</p>
          </div>
        </div>
      </div>
    `;

    const emailText = `
New Suggestion Received!

Category: ${category}
From: ${userName} (${userEmail})
User ID: ${userId}
Date: ${new Date().toLocaleString()}

Suggestion:
${suggestion}

---
Submitted via ${config.appName} Suggestion Box
    `.trim();

    // Send to admin email (or support email)
    const recipientEmail = config.admin?.email || config.resend?.supportEmail;

    if (!recipientEmail) {
      console.error("No admin or support email configured");
      return NextResponse.json(
        { error: "Email configuration missing" },
        { status: 500 }
      );
    }

    await sendEmail({
      to: recipientEmail,
      subject: emailSubject,
      html: emailHtml,
      text: emailText,
    });

    return NextResponse.json({ 
      success: true, 
      message: "Suggestion submitted successfully" 
    });
  } catch (error) {
    console.error("Error submitting suggestion:", error);
    return NextResponse.json(
      { error: "Failed to submit suggestion" },
      { status: 500 }
    );
  }
}

