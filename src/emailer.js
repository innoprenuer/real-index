const nodemailer = require("nodemailer");

async function sendEmail(to, listingId, listingAddress) {
  let _to = to.split(".");
  let salutation = "Sehr geehrte Damen und Herren";
  if (_to.length > 1) {
    salutation = `Hallo ${_to[0].charAt(0).toUpperCase()}${_to[0].substring(
      1,
      _to[0].length
    )}`;
  }
  let template = `${salutation},

Ich bin Manan Patel. Ich lebe seit 4 Jahren in Deutschland und seit 1,5 Jahren in Berlin. Ich habe einen festen Job in Berlin. Ich möchte eine Wohnung um ${listingAddress} beantragen.

Bitte geben Sie mir einen Besichtigungstermin. Hier ist ein Verweis auf mein Linkedin-Profil - https://www.linkedin.com/in/mananpatel7/

Einen schönen Tag noch.
Manan Patel
  `;

  try {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
      }
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: `${process.env.NAME}<${process.env.EMAIL}>`,
      to: [to],
      bcc: process.env.BCC,
      subject: `Besichtigungstermin ${listingId} (${listingAddress})`,
      text: `${template}`
    });

    console.log("Message sent to : %s", to);
  } catch (error) {
    console.error(error.message);
  }
}

module.exports = { sendEmail };
