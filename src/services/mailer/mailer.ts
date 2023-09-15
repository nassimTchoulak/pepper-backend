"use strict";
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'nassimtchou@gmail.com',
    pass: 'qmasedjsojoynrwv'
  },
});

const Corporation = "DZ-paiement"

// async..await is not allowed in global scope, must use a wrapper
export async function sendEmailVerificationCodeBuyer(destinationMail: string, emailCode: number, firstName: string) {
  // send mail with defined transport object
 transporter.sendMail({
    from: "Dz-paiement", // sender address

    to: destinationMail, // list of receivers

    subject: `Validation E-mail  ${Corporation}`, // Subject line
    text: `
    
    Cher(e) ${firstName},
    
    Bienvenue sur DZ-Pay ! Avant de commencer, nous devons valider votre adresse e-mail pour assurer la sécurité de votre compte.
    
    Pour valider votre adresse e-mail, veuillez cliquer sur le lien ci-dessous ou copier et coller l'URL dans votre navigateur :
    
    [Lien de Validation de l'E-mail]
    
    Code de Validation : ${emailCode}
    
    Une fois que vous avez validé votre adresse e-mail en utilisant le code ${emailCode}, vous pourrez accéder à toutes les fonctionnalités de ${Corporation} et commencer à acheter en toute sécurité.
    
    Si vous avez des questions ou avez besoin d'assistance, contactez notre support client à support@${Corporation}.dz .
    
    Nous sommes ravis de vous avoir parmi nous et vous remercions de faire confiance à  ${Corporation}.
    
    Cordialement,
    L'équipe de  ${Corporation}
    
    
    
    `, // plain text body
  });
}


// async..await is not allowed in global scope, must use a wrapper
export async function sendEmailVerificationCodeSeller(destinationMail: string, emailCode: number, firstName: string) {
    // send mail with defined transport object
   transporter.sendMail({
      from: "Dz-paiement", // sender address
  
      to: destinationMail, // list of receivers
  
      subject: `Validation E-mail  ${Corporation}`, // Subject line
      text: `
      
      Cher(e) ${firstName},
      
      Bienvenue sur DZ-Pay ! Avant de commencer, nous devons valider votre adresse e-mail pour assurer la sécurité de votre compte.
      
      Pour valider votre adresse e-mail, veuillez cliquer sur le lien ci-dessous ou copier et coller l'URL dans votre navigateur :
      
      [Lien de Validation de l'E-mail]
      
      Code de Validation : ${emailCode}
      
      Une fois que vous avez validé votre adresse e-mail en utilisant le code ${emailCode}, vous pourrez accéder à toutes les fonctionnalités de ${Corporation} et commencer à vendre vos produits.
      
      Si vous avez des questions ou avez besoin d'assistance, contactez notre support client à support@${Corporation}.dz .
      
      Nous sommes ravis de vous avoir parmi nous et vous remercions de faire confiance à  ${Corporation}.
      
      Cordialement,
      L'équipe de  ${Corporation}
      
      
      
      `, // plain text body
    })
  }
  