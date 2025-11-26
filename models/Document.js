import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  publicId: {
    type: String,
  },
  text: {
    type: String, // extracted text
  },
  embedding: {
    type: [Number], // vector array
  }
}, { timestamps: true });

export default mongoose.model("Document", documentSchema);