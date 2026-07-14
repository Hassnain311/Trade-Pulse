const nodemailer=require('nodemailer');
const config=require('../config/config');

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        type: "OAuth2",
        user: config.GOOGLE_USER,
        clientId: config.GOOGLE_CLIENT_ID,
        clientSecret: config.GOOGLE_CLIENT_SECRET,
        refreshToken: config.GOOGLE_REFRESH_TOKEN
    }
});

transporter.verify((error) => {
    if (error) {
        console.log(error);
    } else {
        console.log("Email server is ready to send messages.");
    }
});

const sendEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"OTP Verification" <${config.GOOGLE_USER}>`,
            to,
            subject,
            text,
            html
        });

        console.log("Email Sent:", info.messageId);

        return info;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

module.exports = sendEmail;