// emailService.js
const emailjs = require('@emailjs/nodejs');

class EmailService {
  constructor() {
    this.serviceID = 'service_73mw0va'; // Ersetzen Sie durch Ihre Service-ID
    this.templateID = 'template_vdsuzfn'; // Ersetzen Sie durch Ihre Template-ID
    this.publicKey = 'E1pHJ7rpvwOpLdi3b'; // Ersetzen Sie durch Ihre öffentliche Schlüssel
    this.privateKey = 'g1M9OLUWcoCGzeK1mWuOH'; // Ersetzen Sie durch Ihre private Schlüssel (optional, aber empfohlen)
  }

  async sendConfirmationEmail(toEmail, username, token) {
    const templateParams = {
      username: username,
      token: token,
      to_email: toEmail
    };

    try {
      const response = await emailjs.send(this.serviceID, this.templateID, templateParams, {
        publicKey: this.publicKey,
        privateKey: this.privateKey
      });
      console.log('SUCCESS!', response.status, response.text);
    } catch (error) {
      console.log('FAILED...', error);
    }
  }
}

module.exports = new EmailService();
