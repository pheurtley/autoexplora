import { Resend } from "resend";
import {
  verificationEmailTemplate,
  passwordResetTemplate,
  welcomeTemplate,
  newMessageTemplate,
  dealerApprovalTemplate,
  dealerRejectionTemplate,
} from "./email-templates";

// Lazy initialization of Resend client
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

// Runtime getters to read env vars at execution time, not module load time
function getFromEmail(): string {
  return process.env.EMAIL_FROM || "AutoExplora <noreply@autoexplora.cl>";
}

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "https://autoexplora.cl";
}

function getAppName(): string {
  return process.env.NEXT_PUBLIC_APP_NAME || "AutoExplora";
}

/**
 * Send email verification link to new user
 */
export async function sendVerificationEmail(
  email: string,
  token: string,
  name?: string
): Promise<{ success: boolean; error?: string }> {
  const appUrl = getAppUrl();
  const appName = getAppName();
  const verificationLink = `${appUrl}/api/auth/verify-email?token=${token}`;

  try {
    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from: getFromEmail(),
      to: email,
      subject: `Verifica tu email - ${appName}`,
      html: verificationEmailTemplate(name || "Usuario", verificationLink),
    });

    if (error) {
      console.error("Error sending verification email:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending verification email:", error);
    return { success: false, error: "Error al enviar email de verificación" };
  }
}

/**
 * Send password reset link
 */
export async function sendPasswordResetEmail(
  email: string,
  token: string,
  name?: string
): Promise<{ success: boolean; error?: string }> {
  const appUrl = getAppUrl();
  const appName = getAppName();
  const resetLink = `${appUrl}/reset-password?token=${token}`;

  try {
    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from: getFromEmail(),
      to: email,
      subject: `Recupera tu contraseña - ${appName}`,
      html: passwordResetTemplate(name || "Usuario", resetLink),
    });

    if (error) {
      console.error("Error sending password reset email:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return { success: false, error: "Error al enviar email de recuperación" };
  }
}

/**
 * Send welcome email after registration
 */
export async function sendWelcomeEmail(
  email: string,
  name: string
): Promise<{ success: boolean; error?: string }> {
  const appName = getAppName();

  try {
    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from: getFromEmail(),
      to: email,
      subject: `Bienvenido a ${appName}`,
      html: welcomeTemplate(name),
    });

    if (error) {
      console.error("Error sending welcome email:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return { success: false, error: "Error al enviar email de bienvenida" };
  }
}

/**
 * Send notification when user receives a new message
 */
export async function sendNewMessageNotification(
  email: string,
  recipientName: string,
  senderName: string,
  vehicleTitle: string,
  conversationUrl: string
): Promise<{ success: boolean; error?: string }> {
  const appName = getAppName();

  try {
    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from: getFromEmail(),
      to: email,
      subject: `Nuevo mensaje de ${senderName} - ${appName}`,
      html: newMessageTemplate(recipientName, senderName, vehicleTitle, conversationUrl),
    });

    if (error) {
      console.error("Error sending new message notification:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending new message notification:", error);
    return { success: false, error: "Error al enviar notificación" };
  }
}

/**
 * Send dealer approval notification
 */
export async function sendDealerApprovalEmail(
  email: string,
  dealerName: string,
  ownerName: string
): Promise<{ success: boolean; error?: string }> {
  const appUrl = getAppUrl();
  const appName = getAppName();
  const dashboardUrl = `${appUrl}/dealer`;

  try {
    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from: getFromEmail(),
      to: email,
      subject: `Tu cuenta de automotora ha sido aprobada - ${appName}`,
      html: dealerApprovalTemplate(ownerName, dealerName, dashboardUrl),
    });

    if (error) {
      console.error("Error sending dealer approval email:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending dealer approval email:", error);
    return { success: false, error: "Error al enviar email de aprobación" };
  }
}

/**
 * Send dealer rejection notification
 */
export async function sendDealerRejectionEmail(
  email: string,
  dealerName: string,
  ownerName: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  const appName = getAppName();

  try {
    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from: getFromEmail(),
      to: email,
      subject: `Actualización sobre tu solicitud de automotora - ${appName}`,
      html: dealerRejectionTemplate(ownerName, dealerName, reason),
    });

    if (error) {
      console.error("Error sending dealer rejection email:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending dealer rejection email:", error);
    return { success: false, error: "Error al enviar email" };
  }
}
