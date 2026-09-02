import { z } from "zod";
import { infrai, type EmailResult } from "./infrai_email.js";

export const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(1),
  contentType: z.enum(["digital-asset", "newsletter", "processing"]),
  assetUrl: z.string().url().optional(),
  subscribe: z.boolean().default(false),
});
export type ContactForm = z.infer<typeof contactSchema>;

export function inboxSubject(form: ContactForm): string {
  return `[creator contact] ${form.contentType} from ${form.name}`;
}

export async function routeContact(form: ContactForm, inbox: string): Promise<{ inbox: EmailResult; followUp?: EmailResult }> {
  const parsed = contactSchema.parse(form);
  const inboxResult = await infrai.email.send({
    to: inbox,
    subject: inboxSubject(parsed),
    html: `<p>From: ${parsed.name} &lt;${parsed.email}&gt;</p><p>${parsed.message}</p>`,
  }, `contact-${parsed.email}-${parsed.contentType}`);

  let followUp: EmailResult | undefined;
  if (parsed.contentType === "digital-asset" && parsed.assetUrl) {
    followUp = await infrai.email.send({
      to: parsed.email,
      subject: "Your requested digital asset",
      html: `<p>Thanks, ${parsed.name}.</p><p>Download your asset: <a href="${parsed.assetUrl}">${parsed.assetUrl}</a></p>`,
    }, `asset-${parsed.email}-${parsed.assetUrl}`);
  } else if (parsed.subscribe) {
    followUp = await infrai.email.send({
      to: parsed.email,
      subject: "You are subscribed to creator updates",
      html: `<p>Thanks for subscribing, ${parsed.name}. We will send occasional creator updates.</p>`,
    }, `subscriber-${parsed.email}`);
  }
  return { inbox: inboxResult, followUp };
}
