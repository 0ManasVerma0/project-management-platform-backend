import Mailgen from "mailgen";
import nodemailer from "nodemailer";

const sendEmail = async (options) => {
    const mailGenerator = new Mailgen({
        theme: "default",
        product: {
            name: "Task Manager",
            link: "https://taskmanagerlink.com"
        }
    })

    const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent)
    const emailHtml = mailGenerator.generate(options.mailgenContent)

    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        port: process.env.MAILTRAP_SMTP_PORT,
        auth: {
            user: process.env.MAILTRAP_SMTP_USERNAME,
            pass: process.env.MAILTRAP_SMTP_PASSWORD
        }
    })

    const mail = {
        from: "mail.taskmanager@gmail.com",
        to: options.email,
        subject: options.subject,
        text: emailTextual,
        html: emailHtml
    }

    try {
        await transporter.sendMail(mail)
    } catch (error) {
        console.error("Email service failed silently, this might have happend because of credentials, make sure you have provided your mailtrap credentials in the .env file")
        console.error("error", error)
    }
}

const emailVerificationMailgenContent = (username, verificationUrl) => {
    return {
        body: {
            name: username,
            intro: "Welcome to My App! I am excited to have you on board",
            action: {
                instructions: "To verify your email address click on the following button",
                button: {
                    color: "#22BC66",
                    text: "Verify your email",
                    link: verificationUrl
                }
            },
            outro: "Need help or have any questions just reply to this email, we'd love to reply"
        }
    }
}

const forgotPasswordMailgenContent = (username, passwordResetUrl) => {
    return {
        body: {
            name: username,
            intro: "we got the request to reset the password of your account",
            action: {
                instructions: "To reset your password click on the following button or link",
                button: {
                    color: "#22BC66",
                    text: "Reset Password",
                    link: passwordResetUrl
                }
            },
            outro: "Need help or have any questions just reply to this email, we'd love to reply"
        }
    }
}

export {emailVerificationMailgenContent, forgotPasswordMailgenContent, sendEmail}