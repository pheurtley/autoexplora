import { Resend } from "resend";
import { newLeadEmailTemplate, leadAssignedEmailTemplate } from "./email-templates";

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

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "https://autoexplora.cl";
}

function getAppName(): string {
  return process.env.NEXT_PUBLIC_APP_NAME || "AutoExplora";
}

interface LeadInfo {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  vehicleTitle?: string | null;
}

/**
 * Send email notification when a new lead is created
 */
export async function sendNewLeadNotification(
  recipientEmail: string,
  recipientName: string,
  lead: LeadInfo
): Promise<{ success: boolean; error?: string }> {
  const appUrl = getAppUrl();
  const appName = getAppName();
  const leadUrl = `${appUrl}/dealer/leads?leadId=${lead.id}`;

  try {
    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from: getFromEmail(),
      to: recipientEmail,
      subject: `Nuevo Lead: ${lead.name} - ${appName}`,
      html: newLeadEmailTemplate(recipientName, lead, leadUrl),
    });

    if (error) {
      console.error("Error sending new lead notification:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending new lead notification:", error);
    return { success: false, error: "Error al enviar notificación de lead" };
  }
}

/**
 * Send email notification when a lead is assigned to a user
 */
export async function sendLeadAssignedNotification(
  recipientEmail: string,
  recipientName: string,
  assignedByName: string,
  lead: LeadInfo
): Promise<{ success: boolean; error?: string }> {
  const appUrl = getAppUrl();
  const appName = getAppName();
  const leadUrl = `${appUrl}/dealer/leads?leadId=${lead.id}`;

  try {
    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from: getFromEmail(),
      to: recipientEmail,
      subject: `Lead Asignado: ${lead.name} - ${appName}`,
      html: leadAssignedEmailTemplate(recipientName, assignedByName, lead, leadUrl),
    });

    if (error) {
      console.error("Error sending lead assigned notification:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending lead assigned notification:", error);
    return { success: false, error: "Error al enviar notificación de asignación" };
  }
}
