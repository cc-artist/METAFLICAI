import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  avatar?: string;
  isVip: boolean;
  vipExpiresAt?: Date;
  freeWatchTime: number;
  freeWatchTimeResetAt: Date;
  freeTrialUsed: boolean;
  freeTrialStartAt?: Date;
  freeTrialEndAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    trim: true
  },
  isVip: {
    type: Boolean,
    default: false
  },
  vipExpiresAt: {
    type: Date
  },
  freeWatchTime: {
    type: Number,
    default: 60,
    min: 0,
    max: 60
  },
  freeWatchTimeResetAt: {
    type: Date,
    default: Date.now
  },
  freeTrialUsed: {
    type: Boolean,
    default: false
  },
  freeTrialStartAt: {
    type: Date
  },
  freeTrialEndAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for better query performance
UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ isVip: 1 });

// Update updatedAt field on save
UserSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  (next as Function)();
});

export default mongoose.model<IUser>('User', UserSchema);
