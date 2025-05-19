import mongoose from 'mongoose';

interface IUser extends mongoose.Document {
  fullName: string;
  email: string;
  phoneNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>({
  fullName: {
    type: String,
    default: function(this: IUser) {
      // Default to email prefix if available
      return this.email ? this.email.split('@')[0] : 'User';
    }
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export const User = mongoose.model<IUser>('User', userSchema);