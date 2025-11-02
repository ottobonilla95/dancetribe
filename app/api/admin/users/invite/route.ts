import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import clientPromise from "@/libs/mongo";
import User from "@/models/User";
import config from "@/config";
import { sendEmail } from "@/libs/resend";
import crypto from "crypto";

// POST: Send invite email with magic link
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

    // Get host from request
    const host = req.headers.get('host') || config.domainName;
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;
    
    // Generate verification token (exactly like NextAuth does)
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date();
    expires.setDate(expires.getDate() + 7); // 7 days - matches EmailProvider maxAge

    // Hash token with secret
    const secret = process.env.NEXTAUTH_SECRET || "";
    const hashedToken = crypto
      .createHash("sha256")
      .update(`${token}${secret}`)
      .digest("hex");

    // Store in verification_tokens collection
    const client = await clientPromise;
    const db = client.db();
    
    await db.collection("verification_tokens").deleteMany({
      identifier: email.toLowerCase(),
    });
    
    await db.collection("verification_tokens").insertOne({
      identifier: email.toLowerCase(),
      token: hashedToken,
      expires: expires,
    });

    // Generate magic link
    const callbackUrl = `${baseUrl}/onboarding`;
    const magicLink = `${baseUrl}/api/auth/callback/email?callbackUrl=${encodeURIComponent(callbackUrl)}&token=${token}&email=${encodeURIComponent(email)}`;

    // Send email using Resend
    await sendEmail({
      to: email,
      from: config.resend.fromNoReply,
      subject: `Sign in to ${config.appName}`,
      text: `Sign in to ${config.appName}\n\n${magicLink}\n\n`,
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
              .box { background: white; padding: 30px; margin: 20px 0; border-radius: 10px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
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
                <div class="box">
                  <h2 style="color: #333; margin-top: 0;">You're Invited!</h2>
                  <p style="font-size: 16px; color: #666; margin: 20px 0;">
                    Click the button below to sign in and complete your profile.
                  </p>
                  
                  <a href="${magicLink}" class="button">Sign In & Get Started</a>
                  
                  <p style="font-size: 12px; color: #999; margin-top: 30px;">
                    This link will expire in 24 hours.
                  </p>
                </div>

                <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
                  Join thousands of dancers around the world! 🌎
                </p>
              </div>
              <div class="footer">
                <p>You received this email because you were invited to ${config.appName}.</p>
                <p style="margin-top: 10px;">
                  <a href="${baseUrl}" style="color: #667eea;">Visit ${config.appName}</a>
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Invite email sent",
      email: email.toLowerCase(),
    });
  } catch (error) {
    console.error("Error inviting user:", error);
    return NextResponse.json(
      { error: "Failed to invite user" },
      { status: 500 }
    );
  }
}
