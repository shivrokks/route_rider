import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    name: { type: String, required: true },
    email: { type: String, required: true }
  },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Create indexes for better query performance
messageSchema.index({ timestamp: -1 });
messageSchema.index({ 'sender.email': 1 });

export const Message = mongoose.model('Message', messageSchema);
