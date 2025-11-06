import mongoose from "mongoose";
export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Mongoose Database Connected Successfully");
  } catch (error) {
    console.log("Unable to Connect to Mongoose Database");

    console.log(error);
  }
};
