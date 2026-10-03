// Email (Gmail via nodemailer) and SMS (Twilio). Falls back to console logging when not configured.
const nodemailer = require('nodemailer');
const tw = process.env.TWILIO_SID ? require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN) : null;
const mail = process.env.SMTP_USER
  ? nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } }) : null;

exports.sms = async (to, body) => {
  if (!tw) return console.log(`[SMS dev] -> ${to}: ${body}`);
  try { await tw.messages.create({ from: process.env.TWILIO_FROM, to, body }); }
  catch (e) { console.error('SMS failed:', e.message); }
};
exports.email = async (to, subject, text) => {
  if (!mail) return console.log(`[EMAIL dev] -> ${to}: ${subject} | ${text}`);
  try { await mail.sendMail({ from: process.env.SMTP_USER, to, subject, text }); }
  catch (e) { console.error('Email failed:', e.message); }
};
