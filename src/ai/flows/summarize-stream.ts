'use server';

/**
 * @fileOverview Summarizes a past live stream to provide a quick overview for users who missed it.
 *
 * - summarizeStream - A function that generates a summary of a past live stream.
 * - SummarizeStreamInput - The input type for the summarizeStream function.
 * - SummarizeStreamOutput - The return type for the summarizeStream function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeStreamInputSchema = z.object({
  streamRecording: z.string().describe('The full transcript or recording content of the past live stream.'),
});
export type SummarizeStreamInput = z.infer<typeof SummarizeStreamInputSchema>;

const SummarizeStreamOutputSchema = z.object({
  summary: z.string().describe('A detailed summary of the past live stream content.'),
});
export type SummarizeStreamOutput = z.infer<typeof SummarizeStreamOutputSchema>;

export async function summarizeStream(input: SummarizeStreamInput): Promise<SummarizeStreamOutput> {
  return summarizeStreamFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeStreamPrompt',
  input: {schema: SummarizeStreamInputSchema},
  output: {schema: SummarizeStreamOutputSchema},
  prompt: `You are an expert at summarizing live stream recordings.

  Please provide a detailed summary of the following live stream recording content, highlighting the main topics discussed and key events.

  Live Stream Recording:
  {{{streamRecording}}}

  Summary:`,
});

const summarizeStreamFlow = ai.defineFlow(
  {
    name: 'summarizeStreamFlow',
    inputSchema: SummarizeStreamInputSchema,
    outputSchema: SummarizeStreamOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
