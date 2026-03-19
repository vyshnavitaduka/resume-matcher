import { GoogleGenAI } from "@google/genai";
import { ResumeAnalysis, JobRole } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

/**
 * Calculates cosine similarity between two embedding vectors.
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (normA * normB);
}

export async function analyzeResume(resumeText: string, jobDescription: string): Promise<ResumeAnalysis> {
  const model = "gemini-3.1-pro-preview";
  
  // 1. Get embeddings for semantic similarity
  const embeddingModel = "gemini-embedding-2-preview";
  const [resumeEmbed, jdEmbed] = await Promise.all([
    ai.models.embedContent({ model: embeddingModel, contents: [resumeText] }),
    ai.models.embedContent({ model: embeddingModel, contents: [jobDescription] })
  ]);
  
  const semanticScore = Math.round(cosineSimilarity(resumeEmbed.embeddings[0].values, jdEmbed.embeddings[0].values) * 100);

  // 2. Perform detailed NLP analysis
  const prompt = `
    You are an expert HR recruitment assistant. Analyze the following resume against the job description provided.
    
    Use the following NLP techniques to perform the comparison:
    - Keyword extraction (identifying specific tools, technologies, and skills)
    - Skill similarity detection (mapping synonyms and related concepts)
    - TF-IDF similarity scoring (evaluating the importance of terms in both documents)
    - Semantic matching (understanding the underlying meaning of experience and qualifications)
    
    Job Description:
    ${jobDescription}
    
    Resume Content:
    ${resumeText}
    
    Provide a detailed analysis in JSON format with the following structure:
    {
      "matchScore": number (0-100, overall weighted score),
      "summary": "A brief 2-3 sentence summary of the candidate's fit",
      "matchingSkills": ["skill1", "skill2"],
      "missingSkills": ["skill1", "skill2"],
      "experienceMatch": "Brief explanation of how their experience aligns",
      "yearsOfExperience": number (Extract total years of experience as a single number),
      "educationRelevance": "Brief explanation of how their education aligns",
      "location": "Extract the candidate's current location or 'Not specified'",
      "recommendation": "Strong Match" | "Potential Match" | "Weak Match" | "No Match",
      "detailedScores": {
        "keywordMatch": number (0-100),
        "skillSimilarity": number (0-100),
        "semanticSimilarity": ${semanticScore} (use this value provided),
        "experienceScore": number (0-100),
        "educationScore": number (0-100)
      }
    }
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");
  
  return JSON.parse(text) as ResumeAnalysis;
}

export async function extractJobDetails(jobDescription: string): Promise<Partial<JobRole>> {
  const model = "gemini-3.1-pro-preview";
  
  const prompt = `
    You are an expert HR assistant. Extract key information from the following job description.
    
    Job Description:
    ${jobDescription}
    
    Provide the extracted information in JSON format with the following structure:
    {
      "title": "Job Title",
      "requiredSkills": ["skill1", "skill2"],
      "experienceLevel": "e.g., Junior, Senior, 3-5 years",
      "location": "Job Location",
      "qualifications": ["qualification1", "qualification2"]
    }
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");
  
  return JSON.parse(text);
}
