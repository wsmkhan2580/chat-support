import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true, trim: true, maxlength: 60 },
    deviceType: { type: String, required: true, trim: true, maxlength: 80 },
    issueSummary: { type: String, required: true, trim: true, maxlength: 500 },
    status: {
      type: String,
      enum: ['open', 'pending', 'resolved'],
      default: 'open',
    },
    lastMessageAt: { type: Date, default: Date.now },
    lastMessagePreview: { type: String, default: '', maxlength: 200 },
    unreadForAgent: { type: Boolean, default: true },
  },
  { timestamps: true },
);

conversationSchema.index({ status: 1, lastMessageAt: -1 });

export const Conversation = mongoose.model('Conversation', conversationSchema);
