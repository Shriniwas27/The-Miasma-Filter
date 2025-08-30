'use server';

import { streams, type Stream } from '@/lib/data';
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

// Action to create a new stream
export async function createStreamAction(data: {
  title: string;
  description: string;
  category: string;
}): Promise<Stream> {
  const newStream: Stream = {
    id: (streams.length + 1).toString(),
    title: data.title,
    description: data.description,
    category: data.category,
    user: 'John Doe',
    userAvatar: 'https://picsum.photos/100/100',
    thumbnailUrl: `https://picsum.photos/seed/stream${streams.length + 1}/600/400`,
    viewers: 1,
    isLive: true,
    tags: ['New', 'Live'],
  };

  // In a real app, you would save this to a database.
  // For this prototype, we're just adding it to the in-memory array.
  streams.unshift(newStream);

  // Revalidate paths to show the new stream immediately
  revalidatePath('/');
  revalidatePath('/browse');

  return newStream;
}
