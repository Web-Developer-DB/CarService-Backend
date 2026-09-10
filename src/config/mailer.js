import nodemailer from 'nodemailer';

export const createMailer = (config) =>
  nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    secure: config.SMTP_PORT === 465,
    auth: { user: config.SMTP_USER, pass: config.SMTP_PASS },
    disableFileAccess: true,
    disableUrlAccess: true,
    name: 'car-service-api'
  });
