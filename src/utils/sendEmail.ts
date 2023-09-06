import nodemailer from "nodemailer";

export const sendEmail = async (emailOptions: {
  to: string;
  subject: string;
  from: string;
  text: string;
  html?: string;
}) => {
  try {
    const transporter = nodemailer.createTransport({
      service: process.env.SERVICE,
      auth: {
        user: process.env.USER,
        pass: process.env.PASS,
      },
    });

    const emailResponse = await transporter.sendMail({ ...emailOptions });
    return emailResponse;
  } catch (err: any) {
    console.error(err);
    return err;
  }
};

export const sendVerifyEmail = async (to: string, resetLink: string) => {
  try {
    const emailResponse = await sendEmail({
      to,
      html: `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Astro Link verify email address</title>
        </head>
        <body>
          <main style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">
            <h1 style="font-size: 1.5rem;">Astro Link Verify Email</h1>
            <p>
              Hello, <br /><br />
              We've received a request to verify your email address. <br /><br />You can verify your email address by
              clicking the link below
            </p>
            <a
              href="${resetLink}"
              style="
                text-decoration: none;
                color: rgba(255, 255, 255, 1);
                background-color: #0275d8;
                padding: 0.5em 2em;
                border-radius: 0.5em;
                margin-bottom: .5rem;
                display: flex;
                font-size: 1rem;
                height: fit-content;
                width: fit-content;
                font-weight: 500;
                box-shadow: 0 0 1px rgba(0, 0, 0, 0.5);
              "
              >Verify your email address</a
            >
            <p>This link will be expired in 5 minutes.</p>
          </main>
        </body>
      </html>`,
      subject: "Verify Email Address",
      text: `Hello, <br /><br />
      We've received a request to verify your email address. <br /><br />You can verify your email address by
      clicking the link below \n\n${resetLink}\n\nThis link will expired in 5 minutes.`,
      from: "Astro Link",
    });

    return emailResponse;
  } catch (err: any) {
    return err;
  }
};

export const sendResetPasswordEmail = async (to: string, resetLink: string) => {
  try {
    const emailResponse = await sendEmail({
      to,
      html: `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Astro Link reset account password</title>
        </head>
        <body>
          <main style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">
            <h1 style="font-size: 1.5rem;">Astro Link Password Reset</h1>
            <p>
              Hello, <br /><br />
              We've received a request to reset password for the Astro Link account
              associated with ${to}. <br /><br />You can reset your password by
              clicking the link below
            </p>
            <a
              href="${resetLink}"
              style="
                text-decoration: none;
                color: rgba(255, 255, 255, 1);
                background-color: #0275d8;
                padding: 0.5em 2em;
                border-radius: 0.5em;
                margin-bottom: .5rem;
                display: flex;
                font-size: 1rem;
                height: fit-content;
                width: fit-content;
                font-weight: 500;
                box-shadow: 0 0 1px rgba(0, 0, 0, 0.5);
              "
              >Reset your password</a
            >
            <p>This link will be expired in 5 minutes.</p>
            <p style="color: grey">
              If you did not request a password reset, you can safely ignore this
              email. Only a person with access to your email can reset your account
              password.
            </p>
          </main>
        </body>
      </html>`,
      subject: "Password Reset",
      text: `Hello, \n\nWe've received a request to reset password for the Astro Link account associated with ${to}. \n\nYou can reset your password by clicking the link below \n\n${resetLink}\n\nThis link will expired in 5 minutes.\nIf you did not request a password reset, you can safely ignore this email. Only a person with access to your email can reset your account password.`,
      from: "Astro Link",
    });

    return emailResponse;
  } catch (err: any) {
    return err;
  }
};
