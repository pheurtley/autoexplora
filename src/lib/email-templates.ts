function getAppName(): string {
  return process.env.NEXT_PUBLIC_APP_NAME || "AutoExplora";
}

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "https://autoexplora.cl";
}

/**
 * Base email layout with AutoExplora branding
 */
function baseTemplate(content: string): string {
  const APP_NAME = getAppName();
  const APP_URL = getAppUrl();
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${APP_NAME}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px 24px; text-align: center; border-bottom: 1px solid #e4e4e7;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #2563eb;">${APP_NAME}</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 32px 40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f9fafb; border-top: 1px solid #e4e4e7; border-radius: 0 0 8px 8px;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #71717a; text-align: center;">
                Este email fue enviado por ${APP_NAME}
              </p>
              <p style="margin: 0; font-size: 12px; color: #71717a; text-align: center;">
                <a href="${APP_URL}" style="color: #2563eb; text-decoration: none;">${APP_URL}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

/**
 * Button component for emails
 */
function emailButton(text: string, url: string): string {
  return `
<table role="presentation" width="100%" cellspacing="0" cellpadding="0">
  <tr>
    <td align="center" style="padding: 24px 0;">
      <a href="${url}" style="display: inline-block; padding: 14px 32px; background-color: #2563eb; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 6px;">
        ${text}
      </a>
    </td>
  </tr>
</table>
`;
}

/**
 * Email verification template
 */
export function verificationEmailTemplate(name: string, verificationLink: string): string {
  const APP_NAME = getAppName();
  const content = `
<h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #18181b;">
  Hola ${name},
</h2>
<p style="margin: 0 0 16px; font-size: 16px; color: #3f3f46; line-height: 1.6;">
  Gracias por registrarte en ${APP_NAME}. Para completar tu registro y verificar tu email, haz clic en el siguiente boton:
</p>
${emailButton("Verificar mi email", verificationLink)}
<p style="margin: 0 0 16px; font-size: 14px; color: #71717a; line-height: 1.6;">
  Si no creaste una cuenta en ${APP_NAME}, puedes ignorar este email.
</p>
<p style="margin: 0; font-size: 14px; color: #71717a; line-height: 1.6;">
  Este enlace expira en 24 horas.
</p>
<hr style="margin: 24px 0; border: none; border-top: 1px solid #e4e4e7;">
<p style="margin: 0; font-size: 12px; color: #a1a1aa;">
  Si el boton no funciona, copia y pega este enlace en tu navegador:<br>
  <a href="${verificationLink}" style="color: #2563eb; word-break: break-all;">${verificationLink}</a>
</p>
`;
  return baseTemplate(content);
}

/**
 * Password reset template
 */
export function passwordResetTemplate(name: string, resetLink: string): string {
  const APP_NAME = getAppName();
  const content = `
<h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #18181b;">
  Hola ${name},
</h2>
<p style="margin: 0 0 16px; font-size: 16px; color: #3f3f46; line-height: 1.6;">
  Recibimos una solicitud para restablecer la contrasena de tu cuenta en ${APP_NAME}.
</p>
<p style="margin: 0 0 16px; font-size: 16px; color: #3f3f46; line-height: 1.6;">
  Haz clic en el siguiente boton para crear una nueva contrasena:
</p>
${emailButton("Restablecer contrasena", resetLink)}
<p style="margin: 0 0 16px; font-size: 14px; color: #71717a; line-height: 1.6;">
  Si no solicitaste restablecer tu contrasena, puedes ignorar este email. Tu contrasena actual seguira siendo la misma.
</p>
<p style="margin: 0; font-size: 14px; color: #71717a; line-height: 1.6;">
  Este enlace expira en 1 hora por seguridad.
</p>
<hr style="margin: 24px 0; border: none; border-top: 1px solid #e4e4e7;">
<p style="margin: 0; font-size: 12px; color: #a1a1aa;">
  Si el boton no funciona, copia y pega este enlace en tu navegador:<br>
  <a href="${resetLink}" style="color: #2563eb; word-break: break-all;">${resetLink}</a>
</p>
`;
  return baseTemplate(content);
}

/**
 * Welcome email template
 */
export function welcomeTemplate(name: string): string {
  const APP_NAME = getAppName();
  const APP_URL = getAppUrl();
  const content = `
<h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #18181b;">
  Bienvenido a ${APP_NAME}, ${name}!
</h2>
<p style="margin: 0 0 16px; font-size: 16px; color: #3f3f46; line-height: 1.6;">
  Tu cuenta ha sido creada exitosamente. Ahora puedes:
</p>
<ul style="margin: 0 0 16px; padding-left: 24px; font-size: 16px; color: #3f3f46; line-height: 1.8;">
  <li>Buscar vehiculos en todo Chile</li>
  <li>Guardar tus vehiculos favoritos</li>
  <li>Contactar vendedores directamente</li>
  <li>Publicar tus propios vehiculos</li>
</ul>
${emailButton("Explorar vehiculos", APP_URL)}
<p style="margin: 0; font-size: 14px; color: #71717a; line-height: 1.6;">
  Si tienes alguna pregunta, no dudes en contactarnos.
</p>
`;
  return baseTemplate(content);
}

/**
 * New message notification template
 */
export function newMessageTemplate(
  recipientName: string,
  senderName: string,
  vehicleTitle: string,
  conversationUrl: string
): string {
  const content = `
<h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #18181b;">
  Hola ${recipientName},
</h2>
<p style="margin: 0 0 16px; font-size: 16px; color: #3f3f46; line-height: 1.6;">
  <strong>${senderName}</strong> te ha enviado un mensaje sobre:
</p>
<div style="margin: 0 0 24px; padding: 16px; background-color: #f4f4f5; border-radius: 6px;">
  <p style="margin: 0; font-size: 16px; color: #18181b; font-weight: 500;">
    ${vehicleTitle}
  </p>
</div>
${emailButton("Ver mensaje", conversationUrl)}
<p style="margin: 0; font-size: 14px; color: #71717a; line-height: 1.6;">
  Responde pronto para no perder la oportunidad.
</p>
`;
  return baseTemplate(content);
}

/**
 * Dealer approval notification template
 */
export function dealerApprovalTemplate(
  ownerName: string,
  dealerName: string,
  dashboardUrl: string
): string {
  const APP_NAME = getAppName();
  const content = `
<h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #18181b;">
  Felicitaciones ${ownerName}!
</h2>
<p style="margin: 0 0 16px; font-size: 16px; color: #3f3f46; line-height: 1.6;">
  Tu solicitud para registrar <strong>${dealerName}</strong> en ${APP_NAME} ha sido <span style="color: #16a34a; font-weight: 600;">aprobada</span>.
</p>
<p style="margin: 0 0 16px; font-size: 16px; color: #3f3f46; line-height: 1.6;">
  Ya puedes acceder a tu panel de automotora y comenzar a:
</p>
<ul style="margin: 0 0 16px; padding-left: 24px; font-size: 16px; color: #3f3f46; line-height: 1.8;">
  <li>Publicar vehiculos de tu inventario</li>
  <li>Gestionar tus publicaciones</li>
  <li>Responder mensajes de clientes</li>
  <li>Ver estadisticas de rendimiento</li>
</ul>
${emailButton("Ir a mi panel", dashboardUrl)}
<p style="margin: 0; font-size: 14px; color: #71717a; line-height: 1.6;">
  Gracias por elegir ${APP_NAME} para tu negocio.
</p>
`;
  return baseTemplate(content);
}

/**
 * Dealer rejection notification template
 */
export function dealerRejectionTemplate(
  ownerName: string,
  dealerName: string,
  reason?: string
): string {
  const APP_NAME = getAppName();
  const content = `
<h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #18181b;">
  Hola ${ownerName},
</h2>
<p style="margin: 0 0 16px; font-size: 16px; color: #3f3f46; line-height: 1.6;">
  Lamentamos informarte que tu solicitud para registrar <strong>${dealerName}</strong> en ${APP_NAME} no ha sido aprobada en esta oportunidad.
</p>
${
  reason
    ? `
<div style="margin: 0 0 24px; padding: 16px; background-color: #fef2f2; border-radius: 6px; border-left: 4px solid #ef4444;">
  <p style="margin: 0 0 8px; font-size: 14px; color: #991b1b; font-weight: 600;">
    Motivo:
  </p>
  <p style="margin: 0; font-size: 14px; color: #7f1d1d;">
    ${reason}
  </p>
</div>
`
    : ""
}
<p style="margin: 0 0 16px; font-size: 16px; color: #3f3f46; line-height: 1.6;">
  Si crees que esto es un error o deseas mas informacion, puedes contactarnos respondiendo a este email.
</p>
<p style="margin: 0; font-size: 14px; color: #71717a; line-height: 1.6;">
  Gracias por tu interes en ${APP_NAME}.
</p>
`;
  return baseTemplate(content);
}
