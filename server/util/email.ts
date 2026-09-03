import { config } from '../config.js'

export interface EmailMessage {
  to: string
  subject: string
  text: string
}

export async function sendEmail(message: EmailMessage): Promise<void> {
  if (!config.smtp.enabled) {
    console.log('[email] no SMTP configured; reset mail would be sent with:')
    console.log(`[email] to: ${message.to}`)
    console.log(`[email] subject: ${message.subject}`)
    console.log(`[email] body:\n${message.text}`)
    return
  }

  throw new Error(
    'SMTP transport is not implemented yet. Configure an email provider or rely on console delivery.',
  )
}