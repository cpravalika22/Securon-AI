
'use server';
/**
 * @fileOverview An AI agent to analyze behavioral anomalies in reporting patterns.
 * 
 * Includes a robust fallback mechanism for keyword-based analysis when AI is unavailable.
 *
 * - analyzeBehavioralAnomaly - Detects suspicious reporting patterns like spam or duplicates.
 * - AnalyzeBehavioralAnomalyInput - The input type.
 * - AnalyzeBehavioralAnomalyOutput - The return type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeBehavioralAnomalyInputSchema = z.object({
  description: z.string().describe('The current complaint description.'),
  reportCountLast24h: z.number().describe('Number of reports filed by this user in the last 24 hours.'),
  pastReportSummaries: z.array(z.string()).describe('Summaries of previous reports filed by this user.'),
});
export type AnalyzeBehavioralAnomalyInput = z.infer<typeof AnalyzeBehavioralAnomalyInputSchema>;

const AnalyzeBehavioralAnomalyOutputSchema = z.object({
  anomalyScore: z.number().min(0).max(100).describe('Score indicating suspicion level (0-100).'),
  isSuspicious: z.boolean().describe('True if the report triggers an alert.'),
  anomalyType: z.enum(['None', 'Duplicate', 'Frequency', 'Exaggerated']).describe('The primary type of anomaly detected.'),
  reason: z.string().describe('Brief explanation for the anomaly score.'),
  source: z.enum(['ai', 'fallback']).describe('Source of the analysis (ai or fallback).'),
});
export type AnalyzeBehavioralAnomalyOutput = z.infer<typeof AnalyzeBehavioralAnomalyOutputSchema>;

export async function analyzeBehavioralAnomaly(
  input: AnalyzeBehavioralAnomalyInput
): Promise<AnalyzeBehavioralAnomalyOutput> {
  return analyzeBehavioralAnomalyFlow(input);
}

const analyzeBehavioralAnomalyPrompt = ai.definePrompt({
  name: 'analyzeBehavioralAnomalyPrompt',
  input: {schema: AnalyzeBehavioralAnomalyInputSchema},
  output: {schema: AnalyzeBehavioralAnomalyOutputSchema},
  prompt: `You are a Trust & Safety AI specialist. Your goal is to detect behavioral anomalies in anonymous college reports while maintaining user privacy.

Analyze the following context for suspicious activity:
Current Report: "{{{description}}}"
Reports in last 24h: {{{reportCountLast24h}}}
Past Report Context: {{#each pastReportSummaries}}- {{{this}}}\n{{/each}}

Criteria for Anomaly:
1. Duplicate/Similarity: Is the text nearly identical to past reports? (AnomalyType: Duplicate)
2. Frequency: Is the user filing an excessive number of reports (e.g., >3 in 24h)? (AnomalyType: Frequency)
3. Exaggeration: Does the language seem intentionally inflammatory or inconsistent with standard reporting? (AnomalyType: Exaggerated)

Return an anomalyScore (0-100). Scores above 60 should be marked as isSuspicious: true. 
Always set source to 'ai'.`,
});

/**
 * Heuristic keyword-based analysis used when AI API is unavailable.
 */
function runFallbackAnalysis(description: string): AnalyzeBehavioralAnomalyOutput {
  const text = description.toLowerCase();
  
  const HIGH = ["harassment", "abuse", "assault", "threat", "violence"];
  const MEDIUM = ["bullying", "intimidation", "pressure"];
  const LOW = ["misbehavior", "rude", "delay"];

  if (HIGH.some(kw => text.includes(kw))) {
    return {
      anomalyScore: 85,
      isSuspicious: true,
      anomalyType: 'Exaggerated',
      reason: 'High-risk terminology detected via fallback heuristic.',
      source: 'fallback'
    };
  }
  
  if (MEDIUM.some(kw => text.includes(kw))) {
    return {
      anomalyScore: 45,
      isSuspicious: false,
      anomalyType: 'None',
      reason: 'Medium-risk indicators noted via fallback heuristic.',
      source: 'fallback'
    };
  }

  if (LOW.some(kw => text.includes(kw))) {
    return {
      anomalyScore: 20,
      isSuspicious: false,
      anomalyType: 'None',
      reason: 'Low-risk indicators noted via fallback heuristic.',
      source: 'fallback'
    };
  }

  return {
    anomalyScore: 0,
    isSuspicious: false,
    anomalyType: 'None',
    reason: 'No suspicious patterns found in fallback analysis.',
    source: 'fallback'
  };
}

const analyzeBehavioralAnomalyFlow = ai.defineFlow(
  {
    name: 'analyzeBehavioralAnomalyFlow',
    inputSchema: AnalyzeBehavioralAnomalyInputSchema,
    outputSchema: AnalyzeBehavioralAnomalyOutputSchema,
  },
  async input => {
    try {
      const {output} = await analyzeBehavioralAnomalyPrompt(input);
      if (!output) {
        throw new Error('Empty AI response.');
      }
      return {
        ...output,
        source: 'ai'
      };
    } catch (error: any) {
      console.warn(`[Anomaly Monitor] AI analysis failed (Quota/Network). Using keyword fallback. Error: ${error.message || error}`);
      
      // Perform local keyword-based risk analysis
      return runFallbackAnalysis(input.description);
    }
  }
);
