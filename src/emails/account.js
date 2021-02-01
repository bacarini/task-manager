const { SENDGRID_API_KEY } = require('../config')

const sgMail = require('@sendgrid/mail')
const { model } = require('mongoose')

sgMail.setApiKey(SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'bacarini.bruno@gmail.com',
        subject: 'Welcome to task-manager',
        text: `Welcom to the app, ${name}!`,
        html: `Welcom to the app, <strong>${name}</strong>!`,
    }).catch((error) => {
        console.error(error)
    })
}

const sendCancelationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'bacarini.bruno@gmail.com',
        subject: 'Sorry to see you go',
        text: `Goodbye ${name}`,
        html: `Goodbye <strong>${name}</strong>`,
    }).catch((error) => {
        console.error(error)
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}
