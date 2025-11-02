import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import config from "@/config";
import { sendEmail } from "@/libs/resend";

// POST: Send reminder email to incomplete profile
export async function POST(
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
    
    // Find user and populate onboardingSteps
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if profile is already complete
    if (user.isProfileComplete) {
      return NextResponse.json(
        { error: "Profile is already complete" },
        { status: 400 }
      );
    }

    // Check if user has email
    if (!user.email) {
      return NextResponse.json(
        { error: "User has no email address" },
        { status: 400 }
      );
    }

    // Get translations based on user's language preference
    const lang = (user.preferredLanguage || 'en') as 'en' | 'es';
    const translations = {
      en: {
        subject: `⏰ Complete Your ${config.appName} Profile`,
        title: '⏰ Complete Your Profile',
        greeting: `Hi ${user.name?.split(' ')[0] || 'there'},`,
        message: `We noticed your ${config.appName} profile is <strong>{{percentage}}% complete</strong>. You're almost there! 🎉`,
        profileCompletion: 'Profile Completion',
        missingSteps: 'Missing steps:',
        completeMessage: 'Complete your profile to start connecting with dancers worldwide! 💃🕺',
        buttonText: 'Complete My Profile',
        needHelp: 'Need Help?',
        supportMessage: 'Have questions or need support? Reach out to us!',
        instagramButton: '📱 Contact us on Instagram',
        footerReason: `You're receiving this because you have an incomplete profile on ${config.appName}.`,
        copyright: `© ${new Date().getFullYear()} ${config.appName}. All rights reserved.`,
        steps: {
          name: 'Name',
          bio: 'Bio',
          city: 'Location',
          danceStyles: 'Dance Styles',
          profilePicture: 'Profile Picture',
        },
      },
      es: {
        subject: `⏰ Completa Tu Perfil de ${config.appName}`,
        title: '⏰ Completa Tu Perfil',
        greeting: `Hola ${user.name?.split(' ')[0] || 'amigo/a'},`,
        message: `Notamos que tu perfil de ${config.appName} está <strong>{{percentage}}% completo</strong>. ¡Ya casi terminas! 🎉`,
        profileCompletion: 'Completitud del Perfil',
        missingSteps: 'Pasos faltantes:',
        completeMessage: '¡Completa tu perfil para comenzar a conectar con bailarines de todo el mundo! 💃🕺',
        buttonText: 'Completar Mi Perfil',
        needHelp: '¿Necesitas Ayuda?',
        supportMessage: '¿Tienes preguntas o necesitas soporte? ¡Contáctanos!',
        instagramButton: '📱 Contáctanos en Instagram',
        footerReason: `Recibes este correo porque tienes un perfil incompleto en ${config.appName}.`,
        copyright: `© ${new Date().getFullYear()} ${config.appName}. Todos los derechos reservados.`,
        steps: {
          name: 'Nombre',
          bio: 'Biografía',
          city: 'Ubicación',
          danceStyles: 'Estilos de Baile',
          profilePicture: 'Foto de Perfil',
        },
      },
    };
    const t = translations[lang];

    // Determine missing steps - use ACTUAL onboarding step keys
    // Match the mandatory steps from profile completion logic
    const allSteps = [
      { key: 'nameDetails', label: t.steps.name },
      { key: 'username', label: 'Username' },
      { key: 'profilePic', label: t.steps.profilePicture },
      { key: 'dateOfBirth', label: 'Date of Birth' },
      { key: 'gender', label: 'Gender' },
      { key: 'nationality', label: 'Nationality' },
      { key: 'currentLocation', label: t.steps.city },
      { key: 'danceRole', label: 'Dance Role' },
      { key: 'teacherInfo', label: 'Professional Info' },
    ];

    const missingSteps = allSteps.filter(step => {
      return !user.onboardingSteps?.[step.key];
    });

    const completionPercentage = Math.round(((allSteps.length - missingSteps.length) / allSteps.length) * 100);

    // Generate missing steps HTML
    const missingStepsHtml = missingSteps.map(step => 
      `<li style="margin: 8px 0; font-size: 16px;">❌ ${step.label}</li>`
    ).join('');

    // Send reminder email
    try {
      await sendEmail({
        to: user.email,
        from: config.resend.fromAdmin,
        subject: t.subject,
        text: `${t.greeting} ${t.message.replace('{{percentage}}', completionPercentage.toString())} ${t.completeMessage}`,
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
                .box { background: white; padding: 30px; margin: 20px 0; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .progress-bar { background: #e0e0e0; height: 30px; border-radius: 15px; overflow: hidden; margin: 20px 0; }
                .progress-fill { background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; }
                .button { display: inline-block; background: #667eea; color: white !important; padding: 16px 40px; text-decoration: none; border-radius: 8px; margin-top: 20px; font-weight: bold; font-size: 16px; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                ul { text-align: left; list-style: none; padding: 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0; font-size: 32px;">${t.title}</h1>
                </div>
                <div class="content">
                  <div class="box">
                    <p style="font-size: 16px; color: #666;">
                      ${t.greeting}
                    </p>
                    <p style="font-size: 16px; color: #666;">
                      ${t.message.replace('{{percentage}}', completionPercentage.toString())}
                    </p>
                    <div class="progress-bar">
                      <div class="progress-fill" style="width: ${completionPercentage}%;">
                        ${completionPercentage}%
                      </div>
                    </div>
                    <p style="font-size: 16px; color: #666; margin-top: 30px;">
                      <strong>${t.missingSteps}</strong>
                    </p>
                    <ul>
                      ${missingStepsHtml}
                    </ul>
                    <p style="font-size: 16px; color: #666; margin-top: 30px;">
                      ${t.completeMessage}
                    </p>
                    <div style="text-align: center;">
                      <a href="${typeof window !== 'undefined' ? window.location.origin : 'https://dancecircle.co'}/profile" class="button">
                        ${t.buttonText}
                      </a>
                    </div>
                  </div>
                  <div style="background: white; padding: 20px 30px; margin: 20px 30px; border-radius: 10px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
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

      // Update user to mark reminder as sent
      await User.findByIdAndUpdate(userId, {
        reminderSent: true,
        reminderSentAt: new Date(),
      });

      return NextResponse.json({
        success: true,
        message: "Reminder email sent successfully",
      });
    } catch (emailError) {
      console.error("Error sending reminder email:", emailError);
      return NextResponse.json(
        { error: "Failed to send reminder email" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error sending reminder:", error);
    return NextResponse.json(
      { error: "Failed to send reminder" },
      { status: 500 }
    );
  }
}

