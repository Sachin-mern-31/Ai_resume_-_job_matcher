import mongoose from 'mongoose';

const ResumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    originalFilename: {
      type: String,
      required: true,
    },
    cloudinaryUrl: {
      type: String,
      default: null,
    },
    cloudinaryPublicId: {
      type: String,
      default: null,
    },
    jobDescription: {
      type: String,
      required: [true, 'Job description is required'],
    },
    matchScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    extractedSkills: { type: [String], default: [] },
    missingSkills:   { type: [String], default: [] },
    summary:         { type: String,   default: null },
    jobSuggestions:  { type: [String], default: [] },
    strengths:       { type: [String], default: [] },
    improvements:    { type: [String], default: [] },
    status: {
      type: String,
      enum: ['processing', 'completed', 'failed'],
      default: 'processing',
    },
    errorMessage: { type: String, default: null },
  },
  { timestamps: true }
);

const Resume = mongoose.model('Resume', ResumeSchema);
export default Resume;
