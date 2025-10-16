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

/**
 * Friend Request Received Email
 */
export function friendRequestReceivedEmail(sender: UserData, recipient: UserData) {
  return {
    subject: `${sender.name || 'Someone'} sent you a friend request on ${config.appName}! 👋`,
    text: `Hi ${recipient.name || 'there'}! ${sender.name || 'A dancer'} wants to connect with you on ${config.appName}.`,
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
              <h1 style="margin: 0; font-size: 28px;">👋 New Friend Request!</h1>
            </div>
            <div class="content">
              <p style="font-size: 16px; margin-bottom: 20px;">Hi ${recipient.name || 'there'}!</p>
              <div class="profile-card">
                ${sender.image 
                  ? `<img src="${sender.image}" alt="${sender.name}" class="profile-image" />` 
                  : `<div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; color: white; font-size: 32px; font-weight: bold;">${sender.name?.[0] || 'D'}</div>`
                }
                <h2 style="margin: 10px 0; color: #333;">${sender.name || 'A dancer'}</h2>
                ${sender.username ? `<p style="color: #666; margin: 5px 0;">@${sender.username}</p>` : ''}
                <p style="color: #666; margin: 10px 0;">wants to connect with you!</p>
              </div>
              <div style="text-align: center;">
                <a href="https://dancetribe.co/friends" class="button">View Friend Request</a>
              </div>
              <p style="margin-top: 30px; color: #666; font-size: 14px;">
                Connect with dancers worldwide and grow your network! 🌍
              </p>
            </div>
            <div class="footer">
              <p>You're receiving this because someone sent you a friend request on ${config.appName}.</p>
              <p><a href="https://${config.domainName}/profile?settings=notifications" style="color: #667eea;">Manage notification preferences</a></p>
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
export function friendRequestAcceptedEmail(accepter: UserData, sender: UserData) {
  return {
    subject: `${accepter.name || 'Someone'} accepted your friend request! 🎉`,
    text: `Hi ${sender.name || 'there'}! ${accepter.name || 'A dancer'} accepted your friend request on ${config.appName}.`,
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
              <h1 style="margin: 0; font-size: 28px;">🎉 Friend Request Accepted!</h1>
            </div>
            <div class="content">
              <p style="font-size: 16px; margin-bottom: 20px;">Hi ${sender.name || 'there'}!</p>
              <p style="font-size: 16px; margin-bottom: 20px;">Great news! <strong>${accepter.name || 'A dancer'}</strong> accepted your friend request.</p>
              <div class="profile-card">
                ${accepter.image 
                  ? `<img src="${accepter.image}" alt="${accepter.name}" class="profile-image" />` 
                  : `<div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; color: white; font-size: 32px; font-weight: bold;">${accepter.name?.[0] || 'D'}</div>`
                }
                <h2 style="margin: 10px 0; color: #333;">${accepter.name || 'Your new friend'}</h2>
                ${accepter.username ? `<p style="color: #666; margin: 5px 0;">@${accepter.username}</p>` : ''}
              </div>
              <div style="text-align: center;">
                <a href="https://dancetribe.co/${accepter.username || `dancer/${accepter._id}`}" class="button">View Profile</a>
              </div>
              <p style="margin-top: 30px; color: #666; font-size: 14px;">
                You're now connected! Start exploring their dance journey. 💃🕺
              </p>
            </div>
            <div class="footer">
              <p>You're receiving this because your friend request was accepted on ${config.appName}.</p>
              <p><a href="https://${config.domainName}/profile?settings=notifications" style="color: #667eea;">Manage notification preferences</a></p>
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
export function profileLikedEmail(liker: UserData, recipient: UserData) {
  return {
    subject: `${liker.name || 'Someone'} liked your profile! ❤️`,
    text: `Hi ${recipient.name || 'there'}! ${liker.name || 'A dancer'} liked your profile on ${config.appName}.`,
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
              <h1 style="margin: 0; font-size: 28px;">❤️ Someone Liked Your Profile!</h1>
            </div>
            <div class="content">
              <p style="font-size: 16px; margin-bottom: 20px;">Hi ${recipient.name || 'there'}!</p>
              <div class="heart">❤️</div>
              <div class="profile-card">
                ${liker.image 
                  ? `<img src="${liker.image}" alt="${liker.name}" class="profile-image" />` 
                  : `<div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; color: white; font-size: 32px; font-weight: bold;">${liker.name?.[0] || 'D'}</div>`
                }
                <h2 style="margin: 10px 0; color: #333;">${liker.name || 'A dancer'}</h2>
                ${liker.username ? `<p style="color: #666; margin: 5px 0;">@${liker.username}</p>` : ''}
                <p style="color: #666; margin: 10px 0;">liked your profile!</p>
              </div>
              <div style="text-align: center;">
                <a href="https://dancetribe.co/${liker.username || `dancer/${liker._id}`}" class="button">View Their Profile</a>
              </div>
              <p style="margin-top: 30px; color: #666; font-size: 14px;">
                Maybe it's time to connect? Send them a friend request! 💃🕺
              </p>
            </div>
            <div class="footer">
              <p>You're receiving this because someone liked your profile on ${config.appName}.</p>
              <p><a href="https://${config.domainName}/profile?settings=notifications" style="color: #667eea;">Manage notification preferences</a></p>
            </div>
          </div>
        </body>
      </html>
    `
  };
}

