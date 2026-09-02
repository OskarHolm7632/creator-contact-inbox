import assert from "node:assert/strict";
import test from "node:test";
import { inboxSubject, contactSchema } from "../src/contact_workflow.js";

test("digital asset requests are routed with a typed subject", () => {
  const form = contactSchema.parse({ name: "Mina", email: "mina@example.com", message: "Need the kit", contentType: "digital-asset", assetUrl: "https://example.com/kit.zip" });
  assert.equal(inboxSubject(form), "[creator contact] digital-asset from Mina");
});
