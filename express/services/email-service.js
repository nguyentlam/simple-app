const nodemailer = require("nodemailer"),
  Email = require('email-templates'),
  path = require('path'),
  config = require('../../config');

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port || 587,
  secure: false,
  auth: {
    user: config.smtp.user, 
    pass: config.smtp.pass, 
  },
});

const email = new Email({
  message: {
    from: config.smtp.sender
  },
  transport: transporter,
  views: {
    root: path.resolve('express/views/emails'),
    options: {
      extension: 'ejs'
    }
  },
  send: true,
  preview: false
});

function sendEmailUseTemplate(receivers, template, locals) {
  email.send({
    template: template,
    message: {
      to: receivers
    },
    locals: locals
  })
  .then(res => {
    console.log('res.originalMessage', res.originalMessage)
  })
  .catch(console.error);;
}

function sendEmail(from, receivers, subject, html) {
  const email = {
    from: from,
    to: receivers,
    subject: subject,
    html: html,
  }
  transporter.sendMail(email);
}

module.exports = {
  sendEmail,
  sendEmailUseTemplate
}