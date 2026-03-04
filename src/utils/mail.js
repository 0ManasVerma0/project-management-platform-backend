import { text } from "express";
import Mailgen from "mailgen";

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