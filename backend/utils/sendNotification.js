
import Notification from "../models/Notification.js";

export const sendNotification = async ({
  sender,
  receiver,
  receivers = [], // array of users
  type,
  message,
  relatedId,
  onModel,
  link,
}) => {
  try {
    const targets = receivers.length > 0 ? receivers : [receiver];
    const payload = targets.map((r) => ({
      sender,
      receiver: r,
      type,
      message,
      relatedId,
      onModel,
      link,
    }));
      await Notification.insertMany(payload);
    console.log("✅ Notification sent to:", targets);
  } catch (err) {
    console.error("❌ Notification error:", err.message);
  }
};
