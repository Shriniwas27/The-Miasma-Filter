'use server';

/**
 * @fileOverview Automatically generates trending topics from the current live streams.
 *
 * - generateTrendingTopics - A function that generates trending topics.
 * - GenerateTrendingTopicsInput - The input type for the generateTrendingTopics function.
 * - GenerateTrendingTopicsOutput - The return type for the generateTrendingTopics function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTrendingTopicsInputSchema = z.object({
  liveStreamTitles: z
    .array(z.string())
    .describe('The titles of the current live streams.'),
});
export type GenerateTrendingTopicsInput = z.infer<typeof GenerateTrendingTopicsInputSchema>;

const GenerateTrendingTopicsOutputSchema = z.object({
  trendingTopics: z
    .array(z.string())
    .describe('The generated trending topics from the live streams.'),
});
export type GenerateTrendingTopicsOutput = z.infer<typeof GenerateTrendingTopicsOutputSchema>;

export async function generateTrendingTopics(
  input: GenerateTrendingTopicsInput
): Promise<GenerateTrendingTopicsOutput> {
  return generateTrendingTopicsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTrendingTopicsPrompt',
  input: {schema: GenerateTrendingTopicsInputSchema},
  output: {schema: GenerateTrendingTopicsOutputSchema},
  prompt: `You are an AI that generates trending topics from a list of live stream titles.

  Analyze the following live stream titles and generate a list of trending topics that would be relevant to users.

  Live Stream Titles:
  {{#each liveStreamTitles}}- {{this}}\n{{/each}}

  Trending Topics:`,
});

const generateTrendingTopicsFlow = ai.defineFlow(
  {
    name: 'generateTrendingTopicsFlow',
    inputSchema: GenerateTrendingTopicsInputSchema,
    outputSchema: GenerateTrendingTopicsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
