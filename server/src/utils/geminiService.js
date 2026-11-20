import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Analyzes a resume against a job description using Gemini AI.
 */
export const analyzeResume = async (resumeText, jobDescription) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error('Gemini API key is not configured. Please set GEMINI_API_KEY in server/.env');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  const prompt = `
You are an expert ATS (Applicant Tracking System) and career coach AI.

Analyze the following RESUME against the given JOB DESCRIPTION and provide a detailed, structured evaluation.

=== RESUME ===
${resumeText}

=== JOB DESCRIPTION ===
${jobDescription}

=== INSTRUCTIONS ===
Respond with ONLY a valid JSON object (no markdown, no code fences, no extra text) with this exact structure:
{
  "matchScore": <integer 0–100 representing how well the resume matches the JD>,
  "extractedSkills": [<array of skills found in the resume that are relevant to the JD>],
  "missingSkills": [<array of skills mentioned in the JD but NOT found in the resume>],
  "strengths": [<3–5 specific strong points of this resume for this role>],
  "improvements": [<3–5 specific, actionable suggestions to improve the resume for this role>],
  "summary": "<2–3 sentence overall assessment of the candidate's fit for the role>",
  "jobSuggestions": [<5–8 specific job titles this candidate would be well-suited for, based on their actual skills>]
}

Be specific, honest, and actionable. Base all analysis strictly on the text provided.
`;

  // Try available models (gemini-3.8-flash is current)
  const modelNames = ['gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-3.8-pro', 'gemini-1.5-flash'];
  let text = '';
  let lastError = null;

  for (const name of modelNames) {
    try {
      const model = genAI.getGenerativeModel({ model: name });
      const result = await model.generateContent(prompt);
      text = result.response.text().trim();
      if (text) break;
    } catch (err) {
      lastError = err;
      console.warn(`Gemini model ${name} failed: ${err.message}. Trying next model...`);
    }
  }

  if (!text) {
    throw lastError || new Error('Failed to generate response from Gemini AI');
  }

  // Extract JSON object using regex (handles code fences, introductory text, and linebreaks)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const cleanedText = jsonMatch ? jsonMatch[0] : text;

  try {
    const parsed = JSON.parse(cleanedText);
    if (typeof parsed.matchScore !== 'number' || !Array.isArray(parsed.extractedSkills)) {
      throw new Error('Invalid response structure from Gemini');
    }
    return parsed;
  } catch (parseErr) {
    console.error('Gemini parse error:', parseErr);
    console.error('Raw response:', text);
    throw new Error('Failed to parse AI analysis response. Please try again.');
  }
};
