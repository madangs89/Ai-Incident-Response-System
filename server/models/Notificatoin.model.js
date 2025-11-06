const notificationsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  logId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Log",
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ["read", "unread"],
    default: "unread",
  },
});

const Notifications = mongoose.model("Notification", notificationsSchema);

export default Notifications;
