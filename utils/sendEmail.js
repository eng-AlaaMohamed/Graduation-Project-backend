const nodemailer = require('nodemailer');

module.exports = async (userEmail, subject,htmltemplate) => {
    try {
        
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.APP_EMAIL_ADDRESS, //Sender
              pass: process.env.APP_EMAIL_PASSWORD,
            }
          });

        const mailOptions = {
            from: process.env.APP_EMAIL_ADDRESS, // sender address
            to: userEmail, // list of receivers
            subject: subject, // Subject line
            html: htmltemplate, // html body
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email Send: ' + info.response);

    } catch (error) {
        console.log(error);
        throw new Error('Internal Server Error (nodemailer)');
    }
};