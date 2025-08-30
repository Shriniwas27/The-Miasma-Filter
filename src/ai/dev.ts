import { config } from 'dotenv';
config();

import '@/ai/flows/content-moderation.ts';
import '@/ai/flows/stream-summary-generation.ts';
import '@/ai/flows/trending-topic-generation.ts';
import '@/ai/flows/summarize-stream.ts';
import '@/ai/flows/generate-stream-titles.ts';