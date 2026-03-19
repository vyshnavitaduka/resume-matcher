export interface JobRole {
  id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  experienceLevel: string;
  location: string;
  qualifications: string[];
  createdAt: string;
}

export interface ResumeAnalysis {
  matchScore: number;
  summary: string;
  matchingSkills: string[];
  missingSkills: string[];
  experienceMatch: string;
  yearsOfExperience?: number;
  educationRelevance: string;
  location?: string;
  recommendation: 'Strong Match' | 'Potential Match' | 'Weak Match' | 'No Match';
  detailedScores?: {
    keywordMatch: number;
    skillSimilarity: number;
    semanticSimilarity: number;
    experienceScore: number;
    educationScore: number;
  };
}

export interface ResumeFile {
  id: string;
  name: string;
  content: string; // Base64 or text
  type: string;
  analysis?: ResumeAnalysis;
  isAnalyzing: boolean;
}
