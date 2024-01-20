"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResetPasswordEmail = exports.sendVerifyEmail = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendEmail = (emailOptions) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transporter = nodemailer_1.default.createTransport({
            service: process.env.SERVICE,
            auth: {
                user: process.env.USER,
                pass: process.env.PASS,
            },
        });
        const emailResponse = yield transporter.sendMail(Object.assign({}, emailOptions));
        return emailResponse;
    }
    catch (err) {
        console.error(err);
        return err;
    }
});
exports.sendEmail = sendEmail;
const sendVerifyEmail = (to, resetLink) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const emailResponse = yield (0, exports.sendEmail)({
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
    }
    catch (err) {
        return err;
    }
});
exports.sendVerifyEmail = sendVerifyEmail;
const sendResetPasswordEmail = (to, resetLink) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const emailResponse = yield (0, exports.sendEmail)({
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
    }
    catch (err) {
        return err;
    }
});
exports.sendResetPasswordEmail = sendResetPasswordEmail;
