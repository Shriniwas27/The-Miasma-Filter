'use server';

import { generateTrendingTopics } from '@/ai/flows/trending-topic-generation';
import { moderateContent, type ModerateContentOutput } from '@/ai/flows/content-moderation';
import { streams } from '@/lib/data';
import { revalidatePath } from 'next/cache';
import { generateStreamTitles } from '@/ai/flows/generate-stream-titles';

// Action to get trending topics
export async function getTrendingTopicsAction() {
  try {
    const liveStreamTitles = streams.filter(s => s.isLive).map(s => s.title);
    if (liveStreamTitles.length === 0) {
      return { trendingTopics: [] };
    }
    const result = await generateTrendingTopics({ liveStreamTitles });
    return result;
  } catch (error) {
    console.error('Error generating trending topics:', error);
    // Return a fallback or an empty array in case of an error
    return { trendingTopics: ['Gaming', 'News', 'Music', 'Tech', 'eSports'] };
  }
}

// Action to moderate chat messages
export async function moderateMessageAction(
  prevState: any,
  formData: FormData
): Promise<{ message: string; user: string; moderated: boolean; reason?: string }> {
  const message = formData.get('message') as string;
  const user = 'You';

  if (!message || message.trim().length === 0) {
    return { message: '', user: '', moderated: false };
  }

  try {
    const moderationResult: ModerateContentOutput = await moderateContent({ text: message });

    if (!moderationResult.isSafe) {
      return {
        message: 'This message was removed by our content filter.',
        user,
        moderated: true,
        reason: moderationResult.reason,
      };
    }

    // In a real app, you would save the message to a database here.
    
    revalidatePath('/stream/.*'); // Revalidate stream pages
    return { message, user, moderated: false };

  } catch (error) {
    console.error('Error moderating content:', error);
    // If moderation fails, we can choose to either block the message or allow it.
    // For this example, we'll allow it but log the error.
    return { message, user, moderated: false };
  }
}

// Action to generate stream titles and descriptions
export async function generateTitlesAction(
  prevState: any,
  formData: FormData
): Promise<{
  suggestedTitles: string[];
  suggestedDescriptions: string[];
  error?: string;
}> {
  const streamContent = formData.get('description') as string;

  if (!streamContent || streamContent.trim().length < 20) {
    return {
      suggestedTitles: [],
      suggestedDescriptions: [],
      error: 'Please provide a longer description (at least 20 characters) to generate suggestions.',
    };
  }

  try {
    const result = await generateStreamTitles({ streamContent });
    return {
      suggestedTitles: result.suggestedTitles || [],
      suggestedDescriptions: result.suggestedDescriptions || [],
    };
  } catch (error) {
    console.error('Error generating stream titles:', error);
    return {
      suggestedTitles: [],
      suggestedDescriptions: [],
      error: 'Failed to generate suggestions. Please try again later.',
    };
  }
}
