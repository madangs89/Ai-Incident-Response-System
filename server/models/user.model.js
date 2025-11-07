import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  notifications: {
    type: Boolean,
    default: true,
  },
});

const User = new mongoose.model("User", userSchema);

export default User;
