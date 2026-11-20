import Resume from '../models/Resume.js';
import { analyzeResume } from '../utils/geminiService.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinaryService.js';
import { createRequire } from 'module';
import fs from 'fs';

// pdf-parse import compatibility wrapper for v1 & v2
const require = createRequire(import.meta.url);
const pdfParseModule = require('pdf-parse');

const parsePdfBuffer = async (pdfBuffer) => {
  if (typeof pdfParseModule === 'function') {
    const data = await pdfParseModule(pdfBuffer);
    return data.text;
  }
  const { PDFParse } = pdfParseModule;
  if (PDFParse) {
    const parser = new PDFParse({ data: pdfBuffer });
    const result = await parser.getText();
    return result.text;
  }
  throw new Error('PDF parsing module is unavailable.');
};

// POST /api/resume/upload (protected)
export const uploadAndAnalyze = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'PDF file is required' });
    }
    const { jobDescription } = req.body;
    if (!jobDescription || jobDescription.trim().length < 20) {
      return res.status(400).json({ success: false, message: 'Job description must be at least 20 characters' });
    }

    // Direct buffer from memoryStorage (instant and offline-ready)
    const pdfBuffer = req.file.buffer || (req.file.path ? fs.readFileSync(req.file.path) : null);

    if (!pdfBuffer) {
      return res.status(400).json({ success: false, message: 'Could not access uploaded file buffer.' });
    }

    // Upload to Cloudinary in parallel if configured (does not block local parsing)
    const cloudinaryPromise = uploadToCloudinary(pdfBuffer, req.file.originalname);

    // Extract text from PDF buffer
    let pdfText = '';
    try {
      pdfText = await parsePdfBuffer(pdfBuffer);
    } catch (pdfErr) {
      console.error('PDF Extraction Error:', pdfErr.message);
      return res.status(422).json({
        success: false,
        message: 'Could not extract text from PDF. Ensure the file is a text-based, non-password-protected PDF.',
      });
    }

    if (!pdfText || pdfText.trim().length < 50) {
      return res.status(422).json({
        success: false,
        message: 'PDF has no readable text. Scanned or image-based PDFs cannot be parsed.',
      });
    }

    // Await Cloudinary URL if available
    const cloudinaryData = await cloudinaryPromise;

    // Create pending record
    const resumeDoc = await Resume.create({
      userId:             req.user._id,
      originalFilename:   req.file.originalname,
      cloudinaryUrl:      cloudinaryData.url || null,
      cloudinaryPublicId: cloudinaryData.publicId || null,
      jobDescription:     jobDescription.trim(),
      status:             'processing',
    });

    // Call Gemini AI
    let analysis;
    try {
      analysis = await analyzeResume(pdfText, jobDescription.trim());
    } catch (aiErr) {
      console.error('Gemini AI Analysis Error:', aiErr.message);
      await Resume.findByIdAndUpdate(resumeDoc._id, { status: 'failed', errorMessage: aiErr.message });
      return res.status(500).json({ success: false, message: aiErr.message });
    }

    // Save completed analysis
    const updated = await Resume.findByIdAndUpdate(
      resumeDoc._id,
      {
        status:          'completed',
        matchScore:      analysis.matchScore,
        extractedSkills: analysis.extractedSkills || [],
        missingSkills:   analysis.missingSkills   || [],
        strengths:       analysis.strengths        || [],
        improvements:    analysis.improvements     || [],
        summary:         analysis.summary          || '',
        jobSuggestions:  analysis.jobSuggestions   || [],
      },
      { new: true }
    );

    res.status(201).json({ success: true, data: updated });
  } catch (err) {
    console.error('uploadAndAnalyze error:', err);
    res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  }
};

// GET /api/resume/history (protected)
export const getHistory = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select('-__v');
    res.json({ success: true, count: resumes.length, data: resumes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/resume/:id (protected)
export const getById = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) return res.status(404).json({ success: false, message: 'Resume analysis not found' });
    res.json({ success: true, data: resume });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/resume/:id (protected)
export const deleteById = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) return res.status(404).json({ success: false, message: 'Resume analysis not found' });
    if (resume.cloudinaryPublicId) await deleteFromCloudinary(resume.cloudinaryPublicId);
    await resume.deleteOne();
    res.json({ success: true, message: 'Analysis deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
