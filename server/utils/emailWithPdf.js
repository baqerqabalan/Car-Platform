const nodemailer = require("nodemailer");

exports.sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Mail options including attachment
    const mailOptions = {
      from: '"Carisco" <no-reply@carisco.com>',
      to: options.email,
      subject: options.subject,
      text: options.message,
      attachments: [
        {
          filename: "reservation_bill.pdf",
          content: options.pdfBuffer, // Attach PDF buffer directly
          contentType: "application/pdf",
        },
      ],
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log("Error while sending email:", error);
  }
};
