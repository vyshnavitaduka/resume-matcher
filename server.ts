import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import multer from 'multer';
import Database from 'better-sqlite3';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
import mammoth from 'mammoth';
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config();

interface CandidateRow {
  id: string;
  name: string;
  email: string;
  skills: string;
  education: string;
  experience: string;
  years_of_experience: number;
  resume_text: string;
  resume_name: string;
  match_score: number;
  analysis_json: string;
  created_at: string;
}

const db = new Database('candidates.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    title TEXT,
    description TEXT,
    required_skills TEXT,
    experience_level TEXT,
    location TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS candidates (
    id TEXT PRIMARY KEY,
    job_id TEXT,
    name TEXT,
    email TEXT,
    skills TEXT,
    education TEXT,
    experience TEXT,
    years_of_experience INTEGER,
    resume_text TEXT,
    resume_name TEXT,
    match_score INTEGER,
    analysis_json TEXT,
    status TEXT DEFAULT 'Pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(job_id) REFERENCES jobs(id)
  )
`);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

async function startServer() {
  const app = express();
  const PORT = 3000;
  const upload = multer({ storage: multer.memoryStorage() });

  app.use(express.json());

  // Job API Routes
  app.get('/api/jobs', (req, res) => {
    const jobs = db.prepare('SELECT * FROM jobs ORDER BY created_at DESC').all();
    res.json(jobs.map((j: any) => ({
      ...j,
      required_skills: JSON.parse(j.required_skills || '[]')
    })));
  });

  app.post('/api/jobs', async (req, res) => {
    const { title, description } = req.body;
    console.log('Creating job with description:', description?.substring(0, 100) + '...');
    
    try {
      const model = "gemini-3.1-pro-preview";
      const prompt = `Analyze the following job description and extract key details: ${description}`;

      const aiResponse = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "The job title" },
              required_skills: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of required technical and soft skills" },
              experience_level: { type: Type.STRING, description: "Required experience level (e.g. Junior, Mid, Senior)" },
              location: { type: Type.STRING, description: "Job location or Remote" }
            },
            required: ["title", "required_skills", "experience_level", "location"]
          }
        },
      });

      const parsedData = JSON.parse(aiResponse.text || '{}');
      const id = Math.random().toString(36).substr(2, 9);
      const finalTitle = title || parsedData.title || "New Job Position";

      console.log('Extracted job title:', finalTitle);

      db.prepare(`
        INSERT INTO jobs (id, title, description, required_skills, experience_level, location)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        id,
        finalTitle,
        description,
        JSON.stringify(parsedData.required_skills || []),
        parsedData.experience_level || 'Not Specified',
        parsedData.location || 'Remote'
      );

      res.json({ id, title: finalTitle, ...parsedData });
    } catch (error) {
      console.error('Error creating job:', error);
      res.status(500).json({ error: 'Failed to create job. Please check your Gemini API key and try again.' });
    }
  });

  app.delete('/api/jobs/:id', (req, res) => {
    db.prepare('DELETE FROM candidates WHERE job_id = ?').run(req.params.id);
    db.prepare('DELETE FROM jobs WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Candidate API Routes
  app.get('/api/candidates', (req, res) => {
    const jobId = req.query.jobId;
    let query = 'SELECT * FROM candidates';
    let params: any[] = [];
    
    if (jobId) {
      query += ' WHERE job_id = ?';
      params.push(jobId);
    }
    
    query += ' ORDER BY match_score DESC';
    
    const candidates = db.prepare(query).all(params) as CandidateRow[];
    res.json(candidates.map(c => ({
      ...c,
      skills: JSON.parse(c.skills || '[]'),
      analysis: JSON.parse(c.analysis_json || '{}')
    })));
  });

  app.post('/api/upload', upload.array('resumes'), async (req, res) => {
    const files = req.files as Express.Multer.File[];
    const jobId = req.body.jobId;
    
    const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(jobId) as any;
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const results = [];

    for (const file of files) {
      try {
        let text = '';
        if (file.mimetype === 'application/pdf') {
          const data = await pdf(file.buffer);
          text = data.text;
        } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          const data = await mammoth.extractRawText({ buffer: file.buffer });
          text = data.value;
        } else {
          text = file.buffer.toString('utf-8');
        }

        // Parse with Gemini
        const model = "gemini-3.1-pro-preview";
        const prompt = `
          Extract candidate information from the following resume text and analyze the match against the provided job description.
          
          Job Description:
          ${job.description}
          
          Resume Text:
          ${text}
        `;

        const aiResponse = await ai.models.generateContent({
          model,
          contents: prompt,
          config: { 
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                email: { type: Type.STRING },
                skills: { type: Type.ARRAY, items: { type: Type.STRING } },
                education: { type: Type.STRING },
                experience: { type: Type.STRING },
                yearsOfExperience: { type: Type.NUMBER },
                analysis: {
                  type: Type.OBJECT,
                  properties: {
                    matchScore: { type: Type.NUMBER },
                    keywordScore: { type: Type.NUMBER },
                    skillSimilarity: { type: Type.NUMBER },
                    semanticScore: { type: Type.NUMBER },
                    summary: { type: Type.STRING },
                    matchingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                    missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                    experienceMatch: { type: Type.STRING },
                    recommendation: { type: Type.STRING, enum: ["Strong Match", "Potential Match", "Weak Match", "No Match"] }
                  },
                  required: ["matchScore", "summary", "matchingSkills", "missingSkills", "recommendation"]
                }
              },
              required: ["name", "email", "skills", "education", "experience", "yearsOfExperience", "analysis"]
            }
          },
        });

        const parsedData = JSON.parse(aiResponse.text || '{}');
        const id = Math.random().toString(36).substr(2, 9);

        db.prepare(`
          INSERT INTO candidates (id, job_id, name, email, skills, education, experience, years_of_experience, resume_text, resume_name, match_score, analysis_json)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          id,
          jobId,
          parsedData.name,
          parsedData.email,
          JSON.stringify(parsedData.skills),
          parsedData.education,
          parsedData.experience,
          parsedData.yearsOfExperience,
          text,
          file.originalname,
          parsedData.analysis?.matchScore || 0,
          JSON.stringify(parsedData.analysis || {})
        );

        results.push({ id, ...parsedData, resumeName: file.originalname });
      } catch (error) {
        console.error(`Error processing ${file.originalname}:`, error);
        results.push({ error: `Failed to process ${file.originalname}`, resumeName: file.originalname });
      }
    }

    res.json(results);
  });

  app.delete('/api/candidates/:id', (req, res) => {
    db.prepare('DELETE FROM candidates WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  app.patch('/api/candidates/:id/status', (req, res) => {
    const { status } = req.body;
    db.prepare('UPDATE candidates SET status = ? WHERE id = ?').run(status, req.params.id);
    res.json({ success: true });
  });

  app.get('/api/stats', (req, res) => {
    const totalResumes = db.prepare('SELECT COUNT(*) as count FROM candidates').get() as any;
    const totalJobs = db.prepare('SELECT COUNT(*) as count FROM jobs').get() as any;
    const topCandidates = db.prepare('SELECT name, match_score, resume_name FROM candidates ORDER BY match_score DESC LIMIT 5').all();
    const statusCounts = db.prepare('SELECT status, COUNT(*) as count FROM candidates GROUP BY status').all();
    
    res.json({
      totalResumes: totalResumes.count,
      totalJobs: totalJobs.count,
      topCandidates,
      statusCounts
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
