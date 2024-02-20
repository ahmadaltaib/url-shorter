import * as mongoose from 'mongoose';

export const UrlSchema = new mongoose.Schema({
  longUrl: String,
  shortUrl: String,
  createdAt: { type: Date, default: Date.now },
  stats: {
    accessCount: { type: Number, default: 0 },
    uniqueUsers: { type: Number, default: 0 },
    accessedFrom: [String],
    lastAccessedAt: { type: Date, default: Date.now },
  },
});
