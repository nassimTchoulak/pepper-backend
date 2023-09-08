"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmailVerificationCode = void 0;
const tslib_1 = require("tslib");
const nodemailer_1 = (0, tslib_1.__importDefault)(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    service: 'Gmail',
    auth: {
        user: 'nassimtchou@gmail.com',
        pass: 'qmasedjsojoynrwv'
    },
});
const Corporation = "DZ-paiement";
function sendEmailVerificationCode(destinationMail, emailCode, firstName) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        transporter.sendMail({
            from: "Dz-paiement",
            to: destinationMail,
            subject: `Validation E-mail  ${Corporation}`,
            text: `
    
    Cher(e) ${firstName},
    
    Bienvenue sur DZ-Pay ! Avant de commencer, nous devons valider votre adresse e-mail pour assurer la sécurité de votre compte.
    
    Pour valider votre adresse e-mail, veuillez cliquer sur le lien ci-dessous ou copier et coller l'URL dans votre navigateur :
    
    [Lien de Validation de l'E-mail]
    
    Code de Validation : ${emailCode}
    
    Une fois que vous avez validé votre adresse e-mail en utilisant le code ${emailCode}, vous pourrez accéder à toutes les fonctionnalités de ${Corporation} et commencer à acheter et vendre en ligne en toute sécurité.
    
    Si vous avez des questions ou avez besoin d'assistance, contactez notre support client à support@${Corporation}.dz .
    
    Nous sommes ravis de vous avoir parmi nous et vous remercions de faire confiance à  ${Corporation}.
    
    Cordialement,
    L'équipe de  ${Corporation}
    
    
    
    `,
        });
    });
}
exports.sendEmailVerificationCode = sendEmailVerificationCode;
//# sourceMappingURL=mailer.js.map