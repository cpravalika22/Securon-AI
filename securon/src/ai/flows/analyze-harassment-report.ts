'use server';
/**
 * @fileOverview An AI agent to analyze harassment report descriptions.
 *
 * - analyzeHarassmentReport - A function that handles the harassment report analysis process.
 * - AnalyzeHarassmentReportInput - The input type for the analyzeHarassmentReport function.
 * - AnalyzeHarassmentReportOutput - The return type for the analyzeHarassmentReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeHarassmentReportInputSchema = z.object({
  description: z.string().describe('The detailed description of the harassment incident.'),
});
export type AnalyzeHarassmentReportInput = z.infer<typeof AnalyzeHarassmentReportInputSchema>;

const AnalyzeHarassmentReportOutputSchema = z.object({
  keyDetails: z.array(z.string()).describe('A list of key details extracted from the report.'),
  incidentCategory:
    z.union([z.literal('Verbal'), z.literal('Physical'), z.literal('Cyber'), z.literal('Other')])
      .describe('The categorized type of harassment (Verbal, Physical, Cyber, or Other).'),
  triageRecommendation: z.string().describe('An initial recommendation for triaging the report.'),
});
export type AnalyzeHarassmentReportOutput = z.infer<typeof AnalyzeHarassmentReportOutputSchema>;

export async function analyzeHarassmentReport(
  input: AnalyzeHarassmentReportInput
): Promise<AnalyzeHarassmentReportOutput> {
  return analyzeHarassmentReportFlow(input);
}

const analyzeHarassmentReportPrompt = ai.definePrompt({
  name: 'analyzeHarassmentReportPrompt',
  input: {schema: AnalyzeHarassmentReportInputSchema},
  output: {schema: AnalyzeHarassmentReportOutputSchema},
  prompt: `You are an AI assistant specialized in analyzing harassment reports. Your task is to carefully read the provided report description, identify all key details, categorize the incident into one of the specified types, and provide an initial triage recommendation.

Key details should include who, what, when, where, and any specific impactful statements or actions.
Categorize the incident as either 'Verbal', 'Physical', 'Cyber', or 'Other'.
The triage recommendation should suggest immediate next steps or considerations for handling the report.

Harassment Report Description:
{{{description}}}`,
});

const analyzeHarassmentReportFlow = ai.defineFlow(
  {
    name: 'analyzeHarassmentReportFlow',
    inputSchema: AnalyzeHarassmentReportInputSchema,
    outputSchema: AnalyzeHarassmentReportOutputSchema,
  },
  async input => {
    const {output} = await analyzeHarassmentReportPrompt(input);
    if (!output) {
      throw new Error('Failed to analyze harassment report.');
    }
    return output;
  }
);
