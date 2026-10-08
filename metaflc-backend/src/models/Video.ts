import mongoose, { Schema, Document } from 'mongoose';

export interface IVideo extends Document {
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  duration: number;
  category: string;
  tags: string[];
  source: string;
  language: string;
  releaseDate: Date;
  viewCount: number;
  likes: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VideoSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  thumbnail: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  tags: {
    type: [String],
    default: []
  },
  source: {
    type: String,
    required: true,
    trim: true
  },
  language: {
    type: String,
    required: true,
    trim: true
  },
  releaseDate: {
    type: Date,
    default: Date.now
  },
  viewCount: {
    type: Number,
    default: 0,
    min: 0
  },
  likes: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
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
VideoSchema.index({ title: 1 });
VideoSchema.index({ category: 1 });
VideoSchema.index({ tags: 1 });
VideoSchema.index({ source: 1 });
VideoSchema.index({ isActive: 1 });

// Update updatedAt field on save
VideoSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  (next as Function)();
});

export default mongoose.model<IVideo>('Video', VideoSchema);
