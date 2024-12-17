const nodemailer = require('nodemailer');

exports.sendEmail = async(options) => {
    try{
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        const mailOptions = {
            from: `Car Platform  <${process.env.SENDER}>`,
            to: options.email,
            subject: options.subject,
            text: options.message
        };

        await transporter.sendMail(mailOptions);
    }catch(error){
        console.log(error);
    }
};

exports.sendEmailWithUrl = async (options) => {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    
      // Mail options with the URL in the message body
      const mailOptions = {
        from: `"Carisco" ${process.env.SENDER}`,
        to: options.email,
        subject: options.subject,
        text: `${options.message}\n\nClick the following link to proceed: ${options.dynamicUrl}`,
        html: `<p>${options.message}</p>
               <p><a href="${options.dynamicUrl}">Click here to proceed</a></p>`
      };
  
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.log("Error while sending email:", error);
    }
  };