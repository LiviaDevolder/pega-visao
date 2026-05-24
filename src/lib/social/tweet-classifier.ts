import { generateAnalysis } from '@/lib/ai/anthropic-client';
import {
  buildTweetClassificationPrompt,
  type TweetClassification,
} from '@/lib/ai/prompts/tweet-classification';
import type { RawTweet } from './apify-client';

export type { TweetClassification };

export async function classifyTweet(tweet: RawTweet): Promise<TweetClassification | null> {
  try {
    const prompt = buildTweetClassificationPrompt(tweet);
    const response = await generateAnalysis(prompt);
    return JSON.parse(response) as TweetClassification;
  } catch {
    return null;
  }
}
