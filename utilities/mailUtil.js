const nodemailer = require('nodemailer')
const fs = require("fs").promises
const path = require("path")
const handlebars = require("handlebars")

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

const sendRegAppApprovalEmail = async (email, parentName, childName, semester) => {
    const templatePath = path.join(__dirname, 'templates', 'mailTemplate.html')
    const templateFile = await fs.readFile(templatePath, 'utf-8')
    const template = handlebars.compile(templateFile)
    const replacements = {
        username: parentName[0].toUpperCase() + parentName.slice(1),
        title: "Approval Email",
        kindergartenName: semester.kindergarten.name,
        body: `Your child ${childName} Application has been approved, All what is left to do, 
                    is to attend to our kindergarten's location, ${semester.kindergarten.locationFormatted} to finish the registratoin process, regards.`
    }
    const finalHtml = template(replacements)
    client.sendMail(
        {
            from: process.env.SENDER_DOMAIN,
            to: email,
            subject: "Register Application Status Update!",
            html: finalHtml
        }
    )
}

const sendRegAppRejectionEmail = async (email, parentName, childName, semester) => {
    const templatePath = path.join(__dirname, 'templates', 'mailTemplate.html')
    const templateFile = await fs.readFile(templatePath, 'utf-8')
    const template = handlebars.compile(templateFile)
    const replacements = {
        username: parentName[0].toUpperCase() + parentName.slice(1),
        title: "Unapproval Email",
        kindergartenName: semester.kindergarten.name,
        body: `Thank you for taking the time to submit an application to our kindergarten, we are 
                sorry to tell you that your child's application, ${childName} has not been approved to the next step for the registration.
                We are happy to have you and your greate child in the next semester.
                Regards`
    }
    const finalHtml = template(replacements)
    client.sendMail(
        {
            from: process.env.SENDER_DOMAIN,
            to: email,
            subject: "Register Application Status Update!",
            html: finalHtml
        }
    )
}

const sendRegAppConfirmationEmail = async (email, parentName, childName, semester) => {
    const templatePath = path.join(__dirname, 'templates', 'mailTemplate.html')
    const templateFile = await fs.readFile(templatePath, 'utf-8')
    const template = handlebars.compile(templateFile)

    const replacements = {
        username: parentName[0].toUpperCase() + parentName.slice(1),
        title: "Confirmation Email",
        kindergartenName: semester.kindergarten.name,
        body: `Congrats for your family!, your child ${childName} is now officially a member of our kindergarten.
        The new semester starts at ${semester.startDate}. Keep your self updated!`
    }
    const finalHtml = template(replacements)
    client.sendMail(
        {
            from: process.env.SENDER_DOMAIN,
            to: email,
            subject: "Register Application Status Update!",
            html: finalHtml,
        }
    )
}

const sendDeletionOtherRegAppsEmail = async (email, parentName, childName, semester) => {
    const templatePath = path.join(__dirname, 'templates', 'mailTemplate.html')
    const templateFile = await fs.readFile(templatePath, 'utf-8')
    const template = handlebars.compile(templateFile)

    const replacements = {
        username: parentName[0].toUpperCase() + parentName.slice(1),
        title: "Notification",
        kindergartenName: "Kiddy",
        body: `Congratulations ${parentName} for your child acceptance in ${semester.kindergarten.name} kindergarten. This email is just to inform you
        that other register applications you have applied to your child ${childName} to other kindergartens
        have been deleted since ${childName} is officialy accepted in ${semester.kindergarten.name}`
    }
    const finalHtml = template(replacements)
    client.sendMail(
        {
            from: process.env.SENDER_DOMAIN,
            to: email,
            subject: "Register Application Status Update!",
            html: finalHtml 
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