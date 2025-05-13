import mongoose from 'mongoose';

export const stopSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  busRoute: {
    type: String,
    required: true
  },
  notifications: {
    enablePushNotifications: {
      type: Boolean,
      default: true
    },
    enableSmsNotifications: {
      type: Boolean,
      default: false
    }
  },
  location: {
    latitude: Number,
    longitude: Number
  }
}, {
  timestamps: true
});

// Compound index to ensure user can't save same stop twice
stopSchema.index({ userId: 1, name: 1 }, { unique: true });

export const Stop = mongoose.model('Stop', stopSchema);