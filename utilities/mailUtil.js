const nodemailer = require('nodemailer')

const client = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.SENDER_DOMAIN,
        pass: process.env.SENDER_PASS
    }
});

const sendWelcomeEmail = (email) => {
    client.sendMail(
        {
            from: process.env.SENDER_DOMAIN,
            to: email,
            subject: "Welcome to Kiddy!",
            text: "HELLO FROM KIDDY, ADMIN"
        }
    )
}

module.exports = {
    sendWelcomeEmail
}