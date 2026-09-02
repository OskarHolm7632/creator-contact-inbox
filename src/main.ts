import { routeContact, contactSchema } from "./contact_workflow.js";

const inbox = process.env.TEAM_INBOX;
if (!inbox) throw new Error("TEAM_INBOX is required");
const body = JSON.parse(process.env.CONTACT_JSON ?? "{}");
const form = contactSchema.parse(body);
const result = await routeContact(form, inbox);
console.log(JSON.stringify({ accepted: true, message_id: result.inbox.message_id, follow_up: Boolean(result.followUp) }));
