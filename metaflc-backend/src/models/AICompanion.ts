import mongoose, { Schema, Document } from 'mongoose';

export interface IAICompanion extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  avatar: string;
  personality: string;
  voice: string;
  interactionStyle: string;
  favoriteGenres: string[];
  backstory: string;
  createdAt: Date;
  updatedAt: Date;
}

const AICompanionSchema: Schema = new Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  avatar: {
    type: String,
    required: true,
    trim: true
  },
  personality: {
    type: String,
    required: true,
    trim: true
  },
  voice: {
    type: String,
    required: true,
    trim: true
  },
  interactionStyle: {
    type: String,
    required: true,
    trim: true
  },
  favoriteGenres: {
    type: [String],
    required: true,
    default: []
  },
  backstory: {
    type: String,
    required: false,
    trim: true
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
AICompanionSchema.index({ userId: 1 });
AICompanionSchema.index({ name: 1 });
AICompanionSchema.index({ favoriteGenres: 1 });

// Update updatedAt field on save
AICompanionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  (next as Function)();
});

export default mongoose.model<IAICompanion>('AICompanion', AICompanionSchema);
