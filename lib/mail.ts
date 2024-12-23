import { Resend } from "resend"

const resend = new Resend (process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email: string, token: string) => {

    //TODO da cambiare in production
    const confirmLink = `http://localhost:3000/auth/new-verification?token=${token}`;

    resend.emails.send({
        from: "onboarding@resend.dev",
        to: email,
        subject: "Conferma la tua email",
        html: ` <p> Clicca <a href="${confirmLink}">qui</a> per confermare la tua email </p> `
    })

}

export const sendResetPasswordEmail = async (email: string, token: string) => {

    //TODO da cambiare in production
    const resetLink = `http://localhost:3000/auth/new-password?token=${token}`;

    resend.emails.send({
        from: "onboarding@resend.dev",
        to: email,
        subject: "Cambia la tua password",
        html: ` <p> Clicca <a href="${resetLink}">qui</a> per cambiare la tua password </p> `
    })    

}
