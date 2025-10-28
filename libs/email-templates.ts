/**
 * Email templates for transactional notifications
 * These templates are used for sending transactional emails to users
 */

import config from "@/config";

interface UserData {
  name?: string;
  email?: string;
  username?: string;
  image?: string;
  _id?: string;
}

type Locale = 'en' | 'es';

// Email translations
const emailTranslations = {
  en: {
    friendRequest: {
      subject: (name: string) => `${name} sent you a friend request on ${config.appName}! 👋`,
      header: 'New Friend Request!',
      greeting: (name: string) => `Hi ${name}!`,
      wantsToConnect: 'wants to connect with you!',
      viewButton: 'View Friend Request',
      footer1: 'Connect with dancers worldwide and grow your network! 🌍',
      footer2: (appName: string) => `You're receiving this because someone sent you a friend request on ${appName}.`,
      managePrefs: 'Manage notification preferences'
    },
    friendAccepted: {
      subject: (name: string) => `${name} accepted your friend request! 🎉`,
      header: 'Friend Request Accepted!',
      greeting: (name: string) => `Hi ${name}!`,
      greatNews: (name: string) => `Great news! <strong>${name}</strong> accepted your friend request.`,
      newFriend: 'Your new friend',
      viewButton: 'View Profile',
      footer1: "You're now connected! Start exploring their dance journey. 💃🕺",
      footer2: (appName: string) => `You're receiving this because your friend request was accepted on ${appName}.`,
      managePrefs: 'Manage notification preferences'
    },
    profileLiked: {
      subject: (name: string) => `${name} liked your profile! ❤️`,
      header: 'Someone Liked Your Profile!',
      greeting: (name: string) => `Hi ${name}!`,
      likedProfile: 'liked your profile!',
      viewButton: 'View Their Profile',
      footer1: "Maybe it's time to connect? Send them a friend request! 💃🕺",
      footer2: (appName: string) => `You're receiving this because someone liked your profile on ${appName}.`,
      managePrefs: 'Manage notification preferences'
    }
  },
  es: {
    friendRequest: {
      subject: (name: string) => `¡${name} te envió una solicitud de amistad en ${config.appName}! 👋`,
      header: '¡Nueva Solicitud de Amistad!',
      greeting: (name: string) => `¡Hola ${name}!`,
      wantsToConnect: '¡quiere conectar contigo!',
      viewButton: 'Ver Solicitud de Amistad',
      footer1: '¡Conecta con bailarines de todo el mundo y expande tu red! 🌍',
      footer2: (appName: string) => `Recibes esto porque alguien te envió una solicitud de amistad en ${appName}.`,
      managePrefs: 'Gestionar preferencias de notificaciones'
    },
    friendAccepted: {
      subject: (name: string) => `¡${name} aceptó tu solicitud de amistad! 🎉`,
      header: '¡Solicitud de Amistad Aceptada!',
      greeting: (name: string) => `¡Hola ${name}!`,
      greatNews: (name: string) => `¡Buenas noticias! <strong>${name}</strong> aceptó tu solicitud de amistad.`,
      newFriend: 'Tu nuevo amigo',
      viewButton: 'Ver Perfil',
      footer1: '¡Ya están conectados! Comienza a explorar su viaje de baile. 💃🕺',
      footer2: (appName: string) => `Recibes esto porque tu solicitud de amistad fue aceptada en ${appName}.`,
      managePrefs: 'Gestionar preferencias de notificaciones'
    },
    profileLiked: {
      subject: (name: string) => `¡A ${name} le gustó tu perfil! ❤️`,
      header: '¡A Alguien le Gustó tu Perfil!',
      greeting: (name: string) => `¡Hola ${name}!`,
      likedProfile: '¡le gustó tu perfil!',
      viewButton: 'Ver su Perfil',
      footer1: '¿Quizás es momento de conectar? ¡Envíale una solicitud de amistad! 💃🕺',
      footer2: (appName: string) => `Recibes esto porque a alguien le gustó tu perfil en ${appName}.`,
      managePrefs: 'Gestionar preferencias de notificaciones'
    }
  }
};

/**
 * Friend Request Received Email
 */
export function friendRequestReceivedEmail(sender: UserData, recipient: UserData, locale: Locale = 'en') {
  const t = emailTranslations[locale].friendRequest;
  
  return {
    subject: t.subject(sender.name || 'Someone'),
    text: `${t.greeting(recipient.name || 'there')} ${sender.name || 'A dancer'} ${t.wantsToConnect}`,
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
            .profile-card { background: white; padding: 20px; margin: 20px 0; border-radius: 10px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .profile-image { width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 15px; object-fit: cover; }
            .button { display: inline-block; background: #667eea; color: white !important; padding: 14px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; font-weight: bold; }
            .button:hover { background: #5568d3; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">👋 ${t.header}</h1>
            </div>
            <div class="content">
              <p style="font-size: 16px; margin-bottom: 20px;">${t.greeting(recipient.name || 'there')}</p>
              <div class="profile-card">
                ${sender.image 
                  ? `<img src="${sender.image}" alt="${sender.name}" class="profile-image" />` 
                  : `<div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; color: white; font-size: 32px; font-weight: bold;">${sender.name?.[0] || 'D'}</div>`
                }
                <h2 style="margin: 10px 0; color: #333;">${sender.name || 'A dancer'}</h2>
                ${sender.username ? `<p style="color: #666; margin: 5px 0;">@${sender.username}</p>` : ''}
                <p style="color: #666; margin: 10px 0;">${t.wantsToConnect}</p>
              </div>
              <div style="text-align: center;">
                <a href="https://dancecircle.co/friends" class="button">${t.viewButton}</a>
              </div>
              <p style="margin-top: 30px; color: #666; font-size: 14px;">
                ${t.footer1}
              </p>
            </div>
            <div class="footer">
              <p>${t.footer2(config.appName)}</p>
              <p><a href="https://${config.domainName}/profile?settings=notifications" style="color: #667eea;">${t.managePrefs}</a></p>
            </div>
          </div>
        </body>
      </html>
    `
  };
}

/**
 * Friend Request Accepted Email
 */
export function friendRequestAcceptedEmail(accepter: UserData, sender: UserData, locale: Locale = 'en') {
  const t = emailTranslations[locale].friendAccepted;
  
  return {
    subject: t.subject(accepter.name || 'Someone'),
    text: `${t.greeting(sender.name || 'there')} ${accepter.name || 'A dancer'} accepted your friend request on ${config.appName}.`,
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
            .profile-card { background: white; padding: 20px; margin: 20px 0; border-radius: 10px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .profile-image { width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 15px; object-fit: cover; }
            .button { display: inline-block; background: #667eea; color: white !important; padding: 14px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; font-weight: bold; }
            .button:hover { background: #5568d3; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">🎉 ${t.header}</h1>
            </div>
            <div class="content">
              <p style="font-size: 16px; margin-bottom: 20px;">${t.greeting(sender.name || 'there')}</p>
              <p style="font-size: 16px; margin-bottom: 20px;">${t.greatNews(accepter.name || 'A dancer')}</p>
              <div class="profile-card">
                ${accepter.image 
                  ? `<img src="${accepter.image}" alt="${accepter.name}" class="profile-image" />` 
                  : `<div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; color: white; font-size: 32px; font-weight: bold;">${accepter.name?.[0] || 'D'}</div>`
                }
                <h2 style="margin: 10px 0; color: #333;">${accepter.name || t.newFriend}</h2>
                ${accepter.username ? `<p style="color: #666; margin: 5px 0;">@${accepter.username}</p>` : ''}
              </div>
              <div style="text-align: center;">
                <a href="https://dancecircle.co/${accepter.username || `dancer/${accepter._id}`}" class="button">${t.viewButton}</a>
              </div>
              <p style="margin-top: 30px; color: #666; font-size: 14px;">
                ${t.footer1}
              </p>
            </div>
            <div class="footer">
              <p>${t.footer2(config.appName)}</p>
              <p><a href="https://${config.domainName}/profile?settings=notifications" style="color: #667eea;">${t.managePrefs}</a></p>
            </div>
          </div>
        </body>
      </html>
    `
  };
}

/**
 * Profile Liked Email
 */
export function profileLikedEmail(liker: UserData, recipient: UserData, locale: Locale = 'en') {
  const t = emailTranslations[locale].profileLiked;
  
  return {
    subject: t.subject(liker.name || 'Someone'),
    text: `${t.greeting(recipient.name || 'there')} ${liker.name || 'A dancer'} ${t.likedProfile}`,
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
            .profile-card { background: white; padding: 20px; margin: 20px 0; border-radius: 10px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .profile-image { width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 15px; object-fit: cover; }
            .button { display: inline-block; background: #667eea; color: white !important; padding: 14px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; font-weight: bold; }
            .button:hover { background: #5568d3; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .heart { font-size: 40px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">❤️ ${t.header}</h1>
            </div>
            <div class="content">
              <p style="font-size: 16px; margin-bottom: 20px;">${t.greeting(recipient.name || 'there')}</p>
              <div class="heart">❤️</div>
              <div class="profile-card">
                ${liker.image 
                  ? `<img src="${liker.image}" alt="${liker.name}" class="profile-image" />` 
                  : `<div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; color: white; font-size: 32px; font-weight: bold;">${liker.name?.[0] || 'D'}</div>`
                }
                <h2 style="margin: 10px 0; color: #333;">${liker.name || 'A dancer'}</h2>
                ${liker.username ? `<p style="color: #666; margin: 5px 0;">@${liker.username}</p>` : ''}
                <p style="color: #666; margin: 10px 0;">${t.likedProfile}</p>
              </div>
              <div style="text-align: center;">
                <a href="https://dancecircle.co/${liker.username || `dancer/${liker._id}`}" class="button">${t.viewButton}</a>
              </div>
              <p style="margin-top: 30px; color: #666; font-size: 14px;">
                ${t.footer1}
              </p>
            </div>
            <div class="footer">
              <p>${t.footer2(config.appName)}</p>
              <p><a href="https://${config.domainName}/profile?settings=notifications" style="color: #667eea;">${t.managePrefs}</a></p>
            </div>
          </div>
        </body>
      </html>
    `
  };
}

