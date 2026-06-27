"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
const resend_1 = require("resend");
const resend = new resend_1.Resend(process.env.RESEND_API_KEY);
async function sendEmail({ to, subject, react, }) {
    const { data, error } = await resend.emails.send({
        from: 'Galset <noreply@galset.com>',
        to,
        subject,
        react,
    });
    if (error) {
        throw new Error(`Resend error: ${error.message}`);
    }
    return data;
}
