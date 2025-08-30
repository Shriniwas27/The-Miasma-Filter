'use server';

/**
 * @fileOverview Generates engaging titles and descriptions for live streams based on the content being broadcasted.
 *
 * - generateStreamTitles - A function that generates stream titles and descriptions.
 * - GenerateStreamTitlesInput - The input type for the generateStreamTitles function.
 * - GenerateStreamTitlesOutput - The return type for the generateStreamTitles function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStreamTitlesInputSchema = z.object({
  streamContent: z
    .string()
    .describe(
      'A detailed description of the content being broadcasted in the live stream.'
    ),
});
export type GenerateStreamTitlesInput = z.infer<typeof GenerateStreamTitlesInputSchema>;

const GenerateStreamTitlesOutputSchema = z.object({
  suggestedTitles: z
    .array(z.string())
    .describe('A list of suggested engaging titles for the live stream.'),
  suggestedDescriptions: z
    .array(z.string())
    .describe('A list of suggested descriptions for the live stream.'),
});
export type GenerateStreamTitlesOutput = z.infer<typeof GenerateStreamTitlesOutputSchema>;

export async function generateStreamTitles(
  input: GenerateStreamTitlesInput
): Promise<GenerateStreamTitlesOutput> {
  return generateStreamTitlesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStreamTitlesPrompt',
  input: {schema: GenerateStreamTitlesInputSchema},
  output: {schema: GenerateStreamTitlesOutputSchema},
  prompt: `You are an AI assistant that helps live streamers generate engaging titles and descriptions for their streams.

  Given the following information about the stream content, generate a list of 5 suggested titles and 3 suggested descriptions that would attract more viewers and increase engagement.

  Stream Content:
  {{streamContent}}

  Suggested Titles:
  Suggested Descriptions:`,
});

const generateStreamTitlesFlow = ai.defineFlow(
  {
    name: 'generateStreamTitlesFlow',
    inputSchema: GenerateStreamTitlesInputSchema,
    outputSchema: GenerateStreamTitlesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
