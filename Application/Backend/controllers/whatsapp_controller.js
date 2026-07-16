// WhatsApp Controller
import { createNotificationHelper } from "./Notification_Controller.js";

// Meta verification for Webhook
export const verifyWebhook = (req, res) => {
  try {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    // Check if mode and token are sent
    if (mode && token) {
      // Check if mode is subscribe and token matches our environment variable
      if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
        console.log("WhatsApp Webhook verified successfully!");
        return res.status(200).send(challenge);
      } else {
        console.log("WhatsApp Webhook verification failed. Token mismatch.");
        return res.sendStatus(403);
      }
    }
    return res.sendStatus(400);
  } catch (err) {
    console.error("Error verifying WhatsApp Webhook:", err);
    return res.status(500).json({ error: err.message });
  }
};

// Process incoming WhatsApp messages
export const receiveMessage = async (req, res) => {
  try {
    const body = req.body;

    // Check if the webhook event is from whatsapp business account
    if (body.object === "whatsapp_business_account") {
      if (
        body.entry &&
        body.entry[0].changes &&
        body.entry[0].changes[0].value &&
        body.entry[0].changes[0].value.messages &&
        body.entry[0].changes[0].value.messages[0]
      ) {
        const changeValue = body.entry[0].changes[0].value;
        const message = changeValue.messages[0];
        const from = message.from; // Sender phone number
        const text = message.text ? message.text.body : ""; // Message text
        const senderName = changeValue.contacts?.[0]?.profile?.name || "Parent";

        console.log(`[WhatsApp Message] From: ${senderName} (${from}) | Message: "${text}"`);
        await createNotificationHelper(
          "WhatsApp Message Received",
          `Message from ${senderName} (${from}): "${text}"`,
          "whatsapp"
        );
      }
      return res.status(200).send("EVENT_RECEIVED");
    } else {
      return res.sendStatus(404);
    }
  } catch (err) {
    console.error("Error receiving WhatsApp message:", err);
    return res.status(500).json({ error: err.message });
  }
};
