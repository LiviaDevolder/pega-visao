import { sql } from '@/lib/db';
import type { RawTweet } from './apify-client';
import type { TweetClassification } from './tweet-classifier';

export interface SocialMention {
  id: number;
  tweet_id: string;
  texto: string;
  autor: string | null;
  data_tweet: string | null;
  url: string | null;
  captured_at: string;
  query_origem: string | null;
  status: string;
  area_fm: string | null;
  tipo_crime: string | null;
  local_especifico: string | null;
  horario_relatado: string | null;
  relevancia: number | null;
  sentimento: string | null;
}

export async function upsertTweet(tweet: RawTweet): Promise<void> {
  await sql(
    `INSERT INTO social_mentions (tweet_id, texto, autor, data_tweet, url, query_origem)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (tweet_id) DO NOTHING`,
    [tweet.tweet_id, tweet.texto, tweet.autor, tweet.data_tweet, tweet.url, tweet.query_origem]
  );
}

export async function updateClassification(
  tweetId: string,
  c: TweetClassification
): Promise<void> {
  await sql(
    `UPDATE social_mentions
     SET area_fm = $2,
         tipo_crime = $3,
         local_especifico = $4,
         horario_relatado = $5,
         relevancia = $6,
         sentimento = $7,
         status = 'classificado'
     WHERE tweet_id = $1`,
    [
      tweetId,
      c.area_fm,
      c.tipo_crime,
      c.local_especifico,
      c.horario_relatado,
      c.relevancia,
      c.sentimento,
    ]
  );
}

export async function getSocialMentions(filters: {
  area_fm?: string;
  tipo_crime?: string;
  data_inicio?: string;
  data_fim?: string;
  relevancia_minima?: number;
}): Promise<SocialMention[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (filters.area_fm) {
    conditions.push(`area_fm = $${idx++}`);
    params.push(filters.area_fm);
  }

  if (filters.tipo_crime) {
    conditions.push(`tipo_crime = $${idx++}`);
    params.push(filters.tipo_crime);
  }

  if (filters.data_inicio) {
    conditions.push(`data_tweet >= $${idx++}`);
    params.push(filters.data_inicio);
  }

  if (filters.data_fim) {
    conditions.push(`data_tweet <= $${idx++}`);
    params.push(filters.data_fim);
  }

  if (filters.relevancia_minima !== undefined) {
    conditions.push(`(relevancia >= $${idx++} OR relevancia IS NULL)`);
    params.push(filters.relevancia_minima);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const rows = await sql(
    `SELECT * FROM social_mentions ${where} ORDER BY data_tweet DESC NULLS LAST LIMIT 100`,
    params
  );

  return rows as SocialMention[];
}
