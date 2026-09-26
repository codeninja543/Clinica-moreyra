import nodemailer from 'nodemailer';

let transporte = null;

function obtenerTransporte() {
  if (transporte) return transporte;
  if (!process.env.SMTP_HOST) return null;

  transporte = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return transporte;
}

/**
 * Envia un correo a la clinica. Si no hay SMTP configurado,
 * solo lo muestra en consola para no romper el flujo en desarrollo.
 */
export async function enviarCorreo({ asunto, texto }) {
  const mailer = obtenerTransporte();
  if (!mailer) {
    console.log(`[correo simulado] ${asunto}\n${texto}`);
    return { simulado: true };
  }

  await mailer.sendMail({
    from: process.env.MAIL_FROM || 'Web Dino Dent <no-reply@dinodent.com>',
    to: process.env.MAIL_TO || 'citas@dinodent.com',
    subject: asunto,
    text: texto,
  });
  return { simulado: false };
}
