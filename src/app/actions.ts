'use server';

import { streams } from '@/lib/data';
import { revalidatePath } from 'next/cache';

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

  // In a real app, you would save the message to a database here.
  
  revalidatePath('/stream/.*'); // Revalidate stream pages
  return { message, user, moderated: false };
}
