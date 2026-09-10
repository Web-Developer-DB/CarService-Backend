export const sendActionEmail = async ({ mailer, config, recipient, type, token }) => {
  const path = type === 'verify_email' ? '/verify-email' : '/reset-password';
  const url = new URL(path, config.APP_ORIGIN);
  url.searchParams.set('token', token);
  const subject = type === 'verify_email' ? 'E-Mail-Adresse bestätigen' : 'Passwort zurücksetzen';
  await mailer.sendMail({
    from: config.SMTP_FROM,
    to: recipient,
    subject,
    text: `Öffnen Sie diesen einmalig gültigen Link innerhalb von ${config.actionTokenTtlMinutes} Minuten: ${url.toString()}`
  });
};
