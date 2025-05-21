// Summarize medical information from reliable online sources, filtering for the most relevant details.
'use server';

/**
 * @fileOverview Summarizes medical information from reliable online sources.
 *
 * - summarizeMedicalInformation - A function that summarizes medical information.
 * - SummarizeMedicalInformationInput - The input type for the summarizeMedicalInformation function.
 * - SummarizeMedicalInformationOutput - The return type for the summarizeMedicalInformation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeMedicalInformationInputSchema = z.object({
  query: z.string().describe('The medical query to summarize information about.'),
});
export type SummarizeMedicalInformationInput = z.infer<typeof SummarizeMedicalInformationInputSchema>;

const SummarizeMedicalInformationOutputSchema = z.object({
  summary: z.string().describe('The summarized medical information.'),
  sources: z.array(z.string()).describe('The sources used to generate the summary.'),
});
export type SummarizeMedicalInformationOutput = z.infer<typeof SummarizeMedicalInformationOutputSchema>;

export async function summarizeMedicalInformation(input: SummarizeMedicalInformationInput): Promise<SummarizeMedicalInformationOutput> {
  return summarizeMedicalInformationFlow(input);
}

const getMedicalInformation = ai.defineTool({
  name: 'getMedicalInformation',
  description: 'Returns medical information from reliable online sources based on the query.',
  inputSchema: z.object({
    query: z.string().describe('The medical query to search for.'),
  }),
  outputSchema: z.array(z.string()).describe('An array of relevant URLs with medical information.'),
}, async (input) => {
  // Dummy implementation: Replace with actual implementation to fetch medical information from reliable online sources.
  // For now, return a static list of URLs.
  return [
    'https://www.mayoclinic.org/',
    'https://www.webmd.com/',
    'https://www.medicalnewstoday.com/',
  ];
});

const prompt = ai.definePrompt({
  name: 'summarizeMedicalInformationPrompt',
  input: {schema: SummarizeMedicalInformationInputSchema},
  output: {schema: SummarizeMedicalInformationOutputSchema},
  tools: [getMedicalInformation],
  prompt: `You are a medical expert who summarizes medical information from reliable online sources.

  Based on the user query, use the getMedicalInformation tool to find relevant URLs.
  Then, summarize the medical information from those sources, filtering for the most relevant details.
  Include the sources in the output.

  User Query: {{{query}}}`,
});

const summarizeMedicalInformationFlow = ai.defineFlow(
  {
    name: 'summarizeMedicalInformationFlow',
    inputSchema: SummarizeMedicalInformationInputSchema,
    outputSchema: SummarizeMedicalInformationOutputSchema,
  },
  async input => {
    const sources = await getMedicalInformation(input);
    const {output} = await prompt({...input, sources});
    return output!;
  }
);
