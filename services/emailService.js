const nodemailer = require("nodemailer");

const emailService = {
  // Create transporter
  transporter: nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  }),

  // Function to send email
  async sendEmail(data) {
    const formatDataToText = (data) =>
      `Support Email for Trvlpass
Name: ${data.name || ""}
Email: ${data.emailAddress || ""}
ICCID: ${data.eSIM_ICCID || ""}
Device Model: ${data.device || ""}
Phone Number: ${data.phoneNumber || ""}
Message: ${data.message || ""}
`.trim();

    const formatDataToHTML = (data) =>
      `<span>Support Email for Trvlpass</span><br/><br/>
<span>Name: ${data.name || ""}</span><br/>
<span>Email: ${data.emailAddress || ""}</span><br/>
<span>ICCID: ${data.eSIM_ICCID || ""}</span><br/>
<span>Device Model: ${data.device || ""}</span><br/>
<span>Phone Number: ${data.phoneNumber || ""}</span><br/><br/>
<span>Message: <br/>${data.message || ""}</span>
`.trim();

    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL, 
      to: data.recipient || "support@trvlpass.com",
      subject: data.subject || "Support Request",
      text: formatDataToText(data),
      html: formatDataToHTML(data),
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  },
};

module.exports = emailService;
