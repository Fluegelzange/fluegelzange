import nodemailer from 'nodemailer';

// Konfigurieren Sie den Transporter für Ihren E-Mail-Anbieter
const transporter = nodemailer.createTransport({
  service: 'Gmail', // Beispiel: verwenden Sie einen E-Mail-Dienst wie Gmail
  auth: {
    user: flugelzange,  // Ihre E-Mail-Adresse
    pass: dieFluegelZange123   // Ihr E-Mail-Passwort
  }
});

class EmailService {
  static async sendConfirmationEmail(to, username, token) {
    const mailOptions = {
      from: 'no-reply@example.com', // Absenderadresse
      to: to, // Empfängeradresse
      subject: 'Bitte bestätigen Sie Ihre Registrierung',
      html: `
        <h1>Willkommen, ${username}!</h1>
        <p>Vielen Dank für Ihre Registrierung. Bitte bestätigen Sie Ihre E-Mail-Adresse, indem Sie auf den folgenden Link klicken:</p>
        <a href="http://yourdomain.com/confirm-email?token=${token}">E-Mail-Adresse bestätigen</a>
        <p>Falls Sie diese E-Mail nicht angefordert haben, ignorieren Sie bitte diese Nachricht.</p>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Bestätigungs-E-Mail wurde gesendet.');
    } catch (error) {
      console.error('Fehler beim Senden der Bestätigungs-E-Mail:', error);
    }
  }
}

export default EmailService;
