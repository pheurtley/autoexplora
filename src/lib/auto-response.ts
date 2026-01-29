import prisma from "@/lib/prisma";
import { interpolateTemplate } from "./template-interpolation";
import { Resend } from "resend";

let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

function getFromEmail(): string {
  return process.env.EMAIL_FROM || "AutoExplora <noreply@autoexplora.cl>";
}

interface AutoResponseContext {
  nombre: string;
  email: string;
  telefono?: string | null;
  vehiculo?: string | null;
  vehiculo_precio?: number | null;
  dealer_nombre: string;
  dealer_telefono?: string | null;
  dealer_direccion?: string | null;
}

/**
 * Process auto-response for a new lead
 * This should be called asynchronously (don't await in main request)
 */
export async function processAutoResponse(
  dealerId: string,
  leadId: string,
  context: AutoResponseContext
): Promise<void> {
  try {
    // Get auto-response config
    const config = await prisma.autoResponseConfig.findUnique({
      where: { dealerId },
      include: {
        dealer: {
          select: {
            messageTemplates: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    if (!config || !config.enabled) {
      return;
    }

    // Handle delay if configured
    if (config.delayMinutes > 0) {
      await new Promise((resolve) =>
        setTimeout(resolve, config.delayMinutes * 60 * 1000)
      );

      // Re-check if lead still exists and hasn't been responded to
      const lead = await prisma.dealerLead.findUnique({
        where: { id: leadId },
        select: { respondedAt: true },
      });

      if (!lead || lead.respondedAt) {
        return; // Already responded manually
      }
    }

    // Prepare interpolation context
    const interpolationContext = {
      nombre: context.nombre,
      email: context.email,
      telefono: context.telefono || "",
      vehiculo: context.vehiculo || "",
      vehiculo_precio: context.vehiculo_precio
        ? `$ ${context.vehiculo_precio.toLocaleString("es-CL")}`
        : "",
      dealer_nombre: context.dealer_nombre,
      dealer_telefono: context.dealer_telefono || "",
      dealer_direccion: context.dealer_direccion || "",
    };

    // Send email if configured
    if (config.emailTemplateId) {
      const template = config.dealer.messageTemplates.find(
        (t) => t.id === config.emailTemplateId && t.channel === "EMAIL"
      );

      if (template) {
        const subject = interpolateTemplate(
          template.subject || "Gracias por tu consulta",
          interpolationContext
        );
        const body = interpolateTemplate(template.content, interpolationContext);

        try {
          const resend = getResendClient();
          await resend.emails.send({
            from: getFromEmail(),
            to: context.email,
            subject,
            html: wrapInEmailTemplate(body),
          });

          // Log the activity
          const dealerOwner = await prisma.user.findFirst({
            where: {
              dealerId,
              dealerRole: "OWNER",
            },
            select: { id: true },
          });

          if (dealerOwner) {
            await prisma.leadActivity.create({
              data: {
                leadId,
                userId: dealerOwner.id,
                type: "EMAIL",
                content: "Respuesta automática enviada",
                metadata: { auto: true, templateId: template.id },
              },
            });
          }
        } catch (error) {
          console.error("Error sending auto-response email:", error);
        }
      }
    }

    // Update lead respondedAt
    await prisma.dealerLead.update({
      where: { id: leadId },
      data: { respondedAt: new Date() },
    });
  } catch (error) {
    console.error("Error processing auto-response:", error);
  }
}

/**
 * Wrap plain text in a basic email HTML template
 */
function wrapInEmailTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 32px 40px;">
              ${content.replace(/\n/g, "<br>")}
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
