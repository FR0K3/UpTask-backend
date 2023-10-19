const nodemailer = require('nodemailer');

exports.emailRegister = async (data) => {
    const { email, name, token } = data;

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // Email info
    await transport.sendMail({
        from: '"Uptask - Project Manager" <cuentas@uptask.com>',
        to: email,
        subject: "UpTask - Confirm your account",
        text: "Confirm your account",
        html: `<p>Hola ${name}. Comprueba tu cuenta en UpTask</p>
        <p>Tu cuenta ya está casi lista, solo debes comprobar en el siguiente enlace: </p>
        <a href="${process.env.FRONTEND_URL}/confirm/${token}">Confirmar Cuenta</a>
        <p>Si tu no creaste esta cuenta puedes ignorar este mensaje</p>
        `,
    })
}

exports.forgotPassword = async (data) => {
    const { email, name, token } = data;

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    await transport.sendMail({
        from: '"Uptask - Project Manager" <cuentas@uptask.com>',
        to: email,
        subject: "UpTask - Reset your password",
        text: "Confirm your account",
        html: `<p>Hola ${name}. Has solicitado reestablecer tu password</p>
        <p>Para restablecerla solo debes ingresar en el siguiente enlace: </p>
        <a href="${process.env.FRONTEND_URL}/forget-password/${token}">Reset Password</a>
        <p>Si tu no creaste esta cuenta puedes ignorar este mensaje</p>
        `,
    })
}


