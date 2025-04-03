import mongoose, { Schema } from 'mongoose';

export interface IVocabulary {
  _id?: string;
  english: string;
  thai: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  category?: string;
}

const VocabularySchema = new Schema<IVocabulary>(
  {
    english: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    thai: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: String,
      required: true,
      enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    },
    category: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Check if model exists to prevent OverwriteModelError in development with hot reloading
export const Vocabulary = (mongoose.models.Vocabulary as mongoose.Model<IVocabulary>) ||
  mongoose.model<IVocabulary>('Vocabulary', VocabularySchema);

export default Vocabulary;
