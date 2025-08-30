'use server';

/**
 * @fileOverview Summarizes a live stream to provide a quick overview for users.
 *
 * - generateStreamSummary - Generates a summary of a live stream.
 * - StreamSummaryInput - The input type for the generateStreamSummary function.
 * - StreamSummaryOutput - The return type for the generateStreamSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StreamSummaryInputSchema = z.object({
  streamDescription: z.string().describe('Description of the live stream.'),
  currentDiscussion: z.string().describe('The current topic being discussed in the live stream.'),
});
export type StreamSummaryInput = z.infer<typeof StreamSummaryInputSchema>;

const StreamSummaryOutputSchema = z.object({
  summary: z.string().describe('A short summary of the live stream content.'),
});
export type StreamSummaryOutput = z.infer<typeof StreamSummaryOutputSchema>;

export async function generateStreamSummary(input: StreamSummaryInput): Promise<StreamSummaryOutput> {
  return streamSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'streamSummaryPrompt',
  input: {schema: StreamSummaryInputSchema},
  output: {schema: StreamSummaryOutputSchema},
  prompt: `You are a live stream summarization expert. Provide a concise summary of the live stream based on the provided information.

Stream Description: {{{streamDescription}}}
Current Discussion: {{{currentDiscussion}}}

Summary:`,
});

const streamSummaryFlow = ai.defineFlow(
  {
    name: 'streamSummaryFlow',
    inputSchema: StreamSummaryInputSchema,
    outputSchema: StreamSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
