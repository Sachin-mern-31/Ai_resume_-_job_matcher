import Resume from '../models/Resume.js';
import { analyzeResume }        from '../utils/geminiService.js';
import { deleteFromCloudinary } from '../utils/cloudinaryService.js';
import { createRequire }        from 'module';
import axios   from 'axios';
import fs      from 'fs';

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

    // Create pending record
    const resumeDoc = await Resume.create({
      userId:             req.user._id,
      originalFilename:   req.file.originalname,
      cloudinaryUrl:      req.file.path || null,
      cloudinaryPublicId: req.file.filename || null,
      jobDescription:     jobDescription.trim(),
      status:             'processing',
    });

    // Extract text from PDF buffer/path
    let pdfText = '';
    try {
      let pdfBuffer;
      if (req.file.buffer) {
        pdfBuffer = req.file.buffer;
      } else if (req.file.path && req.file.path.startsWith('http')) {
        const response = await axios.get(req.file.path, { responseType: 'arraybuffer' });
        pdfBuffer = Buffer.from(response.data);
      } else if (req.file.path) {
        pdfBuffer = fs.readFileSync(req.file.path);
      }

      if (!pdfBuffer) {
        throw new Error('No PDF file buffer available');
      }

      pdfText = await parsePdfBuffer(pdfBuffer);
    } catch (pdfErr) {
      console.error('PDF Extraction Error:', pdfErr);
      await Resume.findByIdAndUpdate(resumeDoc._id, {
        status: 'failed',
        errorMessage: 'Could not read PDF content. Ensure the file is not password-protected.',
      });
      return res.status(422).json({ success: false, message: 'Could not extract text from PDF' });
    }

    if (!pdfText || pdfText.trim().length < 50) {
      await Resume.findByIdAndUpdate(resumeDoc._id, {
        status: 'failed',
        errorMessage: 'PDF appears to be empty or image-based (non-readable text).',
      });
      return res.status(422).json({ success: false, message: 'PDF has no readable text. Use a text-based PDF.' });
    }

    // Call Gemini AI
    let analysis;
    try {
      analysis = await analyzeResume(pdfText, jobDescription.trim());
    } catch (aiErr) {
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
    res.status(500).json({ success: false, message: err.message });
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
