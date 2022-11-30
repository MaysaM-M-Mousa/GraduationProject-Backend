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

const sendRegAppApprovalEmail = (email, childName) => {
    client.sendMail(
        {
            from: process.env.SENDER_DOMAIN,
            to: email,
            subject: "Register Application Status Update!",
            text: `Congratulations, Your child ${childName} Application has been approved, All what is left 
            is to attend to our kindergarten's location to finish the registratoin process, regards.`
        }
    )
}

const sendRegAppRejectionEmail = (email, childName) => {
    client.sendMail(
        {
            from: process.env.SENDER_DOMAIN,
            to: email,
            subject: "Register Application Status Update!",
            text: `Unfortunately, Your child ${childName} Application has been rejected`
        }
    )
}


const sendRegAppConfirmationEmail = (email, childName) => {
    client.sendMail(
        {
            from: process.env.SENDER_DOMAIN,
            to: email,
            subject: "Register Application Status Update!",
            text: `Congratulations, Your child ${childName} is now officialy a member of our kindergarten.`
        }
    )
}

const sendDeletionOtherRegAppsEmail = (email, parentName, childName) => {
    client.sendMail(
        {
            from: process.env.SENDER_DOMAIN,
            to: email,
            subject: "Register Application Status Update!",
            text: `Congratulations ${parentName} for your child acceptance. This email is just a notification for you to
            let you know that other register applications you have applied to your child ${childName} to other kindergartens
            have been deleted since ${childName} is officialy accepted in one kindergarten`
        }
    )
}

module.exports = {
    sendWelcomeEmail,
    sendRegAppApprovalEmail,
    sendRegAppRejectionEmail,
    sendRegAppConfirmationEmail,
    sendDeletionOtherRegAppsEmail
}