const sgMail = require('@sendgrid/mail')


sgMail.setApiKey(process.env.SENDGRID_API_KEY)


sgMail.send({
    to : 'coolabdoana@yahoo.com',
    from: 'abdoshahda2000@gmail.com',
    subject: 'This is a test',
    text: 'I hopt this one actually gets you'
})