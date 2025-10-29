import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import config from "@/config";
import { sendEmail } from "@/libs/resend";

// POST: Create new user and send invite email
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is admin
    if (!session?.user?.email || session.user.email !== config.admin.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectMongo();

    const body = await req.json();
    const { email } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Create new user with minimal data
    const newUser = await User.create({
      email: email.toLowerCase(),
      hasAccess: false,
    });

    // Generate sign-in URL (magic link)
    const signInUrl = `https://${config.domainName}/api/auth/signin?email=${encodeURIComponent(email)}`;

    // Send invite email
    const emailContent = inviteUserEmail(email, signInUrl);
    
    await sendEmail({
      to: email,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
      from: config.resend.fromNoReply,
    });

    return NextResponse.json({
      success: true,
      message: "User created and invite email sent",
      user: {
        _id: newUser._id,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Error inviting user:", error);
    return NextResponse.json(
      { error: "Failed to invite user" },
      { status: 500 }
    );
  }
}

// Email template for user invite
function inviteUserEmail(email: string, signInUrl: string) {
  return {
    subject: `You're invited to join ${config.appName}! 💃🕺`,
    text: `Welcome to ${config.appName}! You've been invited to join our dance community. Click here to sign in and complete your profile: ${signInUrl}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
            .content { background: #f9f9f9; padding: 40px 30px; }
            .welcome-box { background: white; padding: 30px; margin: 20px 0; border-radius: 10px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .button { display: inline-block; background: #667eea; color: white !important; padding: 16px 40px; text-decoration: none; border-radius: 8px; margin-top: 20px; font-weight: bold; font-size: 16px; }
            .button:hover { background: #5568d3; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 32px;">💃 Welcome to ${config.appName}! 🕺</h1>
            </div>
            <div class="content">
              <div class="welcome-box">
                <h2 style="color: #333; margin-top: 0;">You're Invited!</h2>
                <p style="font-size: 16px; color: #666; margin: 20px 0;">
                  You've been invited to join <strong>${config.appName}</strong>, the global platform 
                  connecting dancers worldwide.
                </p>
                
                <a href="${signInUrl}" class="button">Sign In & Get Started</a>
                
                <p style="font-size: 12px; color: #999; margin-top: 30px;">
                  This link will take you to our secure sign-in page.
                </p>
              </div>

              <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
                Join thousands of dancers around the world! 🌎
              </p>
            </div>
            <div class="footer">
              <p>You received this email because you were invited to ${config.appName}.</p>
              <p style="margin-top: 10px;">
                <a href="https://${config.domainName}" style="color: #667eea;">Visit ${config.appName}</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `
  };
}

