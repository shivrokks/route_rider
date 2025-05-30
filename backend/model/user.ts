import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  isDriver: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export const User = mongoose.model('User', userSchema);