import {
  AREAS_FM_KEYWORDS,
  buildSearchQuery,
  type AreaKeywords,
} from './keywords-areas-fm';

const APIFY_BASE = 'https://api.apify.com/v2';
const ACTOR_ID = 'apidojo~tweet-scraper';

export interface RawTweet {
  tweet_id: string;
  texto: string;
  autor: string;
  data_tweet: string;
  url: string;
  query_origem: string;
}

function apifyHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.APIFY_API_TOKEN}`,
  };
}

async function startRun(query: string): Promise<string> {
  const res = await fetch(`${APIFY_BASE}/acts/${ACTOR_ID}/runs`, {
    method: 'POST',
    headers: apifyHeaders(),
    body: JSON.stringify({
      searchTerms: [query],
      maxItems: 50,
      lang: 'pt',
    }),
  });

  if (!res.ok) {
    throw new Error(`Apify run failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return data.data.id as string;
}

async function waitForRun(runId: string): Promise<string> {
  const maxAttempts = 30;
  const delayMs = 5000;

  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(`${APIFY_BASE}/actor-runs/${runId}`, {
      headers: apifyHeaders(),
    });

    if (!res.ok) {
      throw new Error(`Apify status check failed: ${res.status}`);
    }

    const data = await res.json();
    const status: string = data.data.status;

    if (status === 'SUCCEEDED') {
      return data.data.defaultDatasetId as string;
    }

    if (status === 'FAILED' || status === 'ABORTED' || status === 'TIMED-OUT') {
      throw new Error(`Apify run ended with status: ${status}`);
    }

    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  throw new Error('Apify run timed out waiting for completion');
}

async function fetchDatasetItems(datasetId: string, query: string): Promise<RawTweet[]> {
  const res = await fetch(`${APIFY_BASE}/datasets/${datasetId}/items?clean=true`, {
    headers: apifyHeaders(),
  });

  if (!res.ok) {
    throw new Error(`Apify dataset fetch failed: ${res.status}`);
  }

  const items = await res.json();

  return (items as Array<Record<string, unknown>>)
    .filter((item) => item.lang === 'pt' || item.lang === undefined)
    .map((item) => ({
      tweet_id: String(item.id ?? item.tweetId ?? item.tweet_id ?? ''),
      texto: String(item.fullText ?? item.text ?? ''),
      autor: String((item.author as Record<string, unknown>)?.userName ?? (item.user as Record<string, unknown>)?.screen_name ?? ''),
      data_tweet: String(item.createdAt ?? item.created_at ?? new Date().toISOString()),
      url: String(item.url ?? `https://twitter.com/i/web/status/${item.id}`),
      query_origem: query,
    }))
    .filter((t) => t.tweet_id !== '');
}

export async function fetchTweetsByArea(area: AreaKeywords): Promise<RawTweet[]> {
  const query = buildSearchQuery(area);
  const runId = await startRun(query);
  const datasetId = await waitForRun(runId);
  return fetchDatasetItems(datasetId, query);
}

export async function fetchAllAreas(): Promise<RawTweet[]> {
  const results: RawTweet[] = [];

  for (const area of AREAS_FM_KEYWORDS) {
    try {
      const tweets = await fetchTweetsByArea(area);
      results.push(...tweets);
    } catch (error) {
      console.error(`Erro ao buscar tweets para área ${area.nome_area_fm}:`, error);
    }
  }

  return results;
}
