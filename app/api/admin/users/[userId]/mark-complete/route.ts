import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import City from "@/models/City";
import config from "@/config";
import { sendEmail } from "@/libs/resend";

// PATCH: Mark user profile as complete
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
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

    const { userId } = await params;
    
    // Get user before updating to check if they were already complete
    const userBefore = await User.findById(userId);
    
    if (!userBefore) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const wasAlreadyComplete = userBefore.isProfileComplete;
    
    // Update user's profile completion status
    const user = await User.findByIdAndUpdate(
      userId,
      { isProfileComplete: true },
      { new: true }
    );

    // If user just became complete and has a city, increment city's totalDancers
    if (!wasAlreadyComplete && user && user.city) {
      await City.findByIdAndUpdate(user.city, {
        $inc: { totalDancers: 1 },
      });
    }

    // Get translations based on user's language preference
    const lang = (user.preferredLanguage || 'en') as 'en' | 'es';
    const translations = {
      en: {
        subject: `🎉 Your ${config.appName} Profile is Now Active!`,
        congratulations: '🎉 Congratulations!',
        title: 'Your Profile is Now Active!',
        greeting: `Hi ${user.name?.split(' ')[0] || 'there'},`,
        message: `Great news! Your ${config.appName} profile has been reviewed and is now active. You can now fully participate in the global dance community!`,
        buttonText: 'View Your Profile',
        tagline: 'Start connecting with dancers worldwide! 💃🕺',
        needHelp: 'Need Help?',
        supportMessage: 'Have questions or need support? Reach out to us!',
        instagramButton: '📱 Contact us on Instagram',
        footerReason: `You're receiving this because your profile on ${config.appName} was activated.`,
        copyright: `© ${new Date().getFullYear()} ${config.appName}. All rights reserved.`,
      },
      es: {
        subject: `🎉 ¡Tu Perfil de ${config.appName} Ahora Está Activo!`,
        congratulations: '🎉 ¡Felicitaciones!',
        title: '¡Tu Perfil Ahora Está Activo!',
        greeting: `Hola ${user.name?.split(' ')[0] || 'amigo/a'},`,
        message: `¡Excelente noticia! Tu perfil de ${config.appName} ha sido revisado y ahora está activo. ¡Ya puedes participar completamente en la comunidad global de baile!`,
        buttonText: 'Ver Tu Perfil',
        tagline: '¡Comienza a conectar con bailarines de todo el mundo! 💃🕺',
        needHelp: '¿Necesitas Ayuda?',
        supportMessage: '¿Tienes preguntas o necesitas soporte? ¡Contáctanos!',
        instagramButton: '📱 Contáctanos en Instagram',
        footerReason: `Recibes este correo porque tu perfil en ${config.appName} fue activado.`,
        copyright: `© ${new Date().getFullYear()} ${config.appName}. Todos los derechos reservados.`,
      },
    };
    const t = translations[lang];

    // Send email notification to user
    if (user.email) {
      try {
        await sendEmail({
          to: user.email,
          from: config.resend.fromAdmin,
          subject: t.subject,
          text: `${t.greeting} ${t.message}`,
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
                  .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1 style="margin: 0; font-size: 32px;">${t.congratulations}</h1>
                  </div>
                  <div class="content">
                    <div class="box">
                      <h2 style="color: #333; margin-top: 0;">${t.title}</h2>
                      <p style="font-size: 16px; color: #666;">
                        ${t.greeting}
                      </p>
                      <p style="font-size: 16px; color: #666;">
                        ${t.message}
                      </p>
                      <a href="${typeof window !== 'undefined' ? window.location.origin : 'https://dancecircle.co'}/profile" class="button">
                        ${t.buttonText}
                      </a>
                    </div>
                    <div style="text-align: center; margin-top: 20px;">
                      <p style="color: #666;">
                        ${t.tagline}
                      </p>
                    </div>
                  </div>
                  <div style="background: white; padding: 20px 30px; margin: 20px 30px; border-radius: 10px; text-align: center;">
                    <p style="color: #666; margin: 0 0 10px 0; font-size: 14px;">
                      <strong>${t.needHelp}</strong>
                    </p>
                    <p style="color: #666; margin: 0 0 15px 0; font-size: 14px;">
                      ${t.supportMessage}
                    </p>
                    <a href="https://www.instagram.com/${config.social.instagram}/" style="display: inline-block; background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%); color: white !important; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">
                      ${t.instagramButton}
                    </a>
                  </div>
                  <div class="footer">
                    <p>${t.footerReason}</p>
                    <p>${t.copyright}</p>
                  </div>
                </div>
              </body>
            </html>
          `,
        });
      } catch (emailError) {
        console.error("Error sending completion email:", emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: "User profile marked as complete and notification sent",
      user: {
        _id: user._id,
        name: user.name,
        isProfileComplete: user.isProfileComplete,
      },
    });
  } catch (error) {
    console.error("Error marking profile complete:", error);
    return NextResponse.json(
      { error: "Failed to mark profile as complete" },
      { status: 500 }
    );
  }
}

