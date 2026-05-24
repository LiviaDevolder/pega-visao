import { NextRequest, NextResponse } from 'next/server';
import { fetchAllAreas } from '@/lib/social/apify-client';
import { classifyTweet } from '@/lib/social/tweet-classifier';
import {
  upsertTweet,
  updateClassification,
  getSocialMentions,
} from '@/lib/social/social-mentions-repository';

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters = {
      area_fm: searchParams.get('area_fm') ?? undefined,
      tipo_crime: searchParams.get('tipo_crime') ?? undefined,
      data_inicio: searchParams.get('data_inicio') ?? undefined,
      data_fim: searchParams.get('data_fim') ?? undefined,
      relevancia_minima: searchParams.get('relevancia_minima')
        ? Number(searchParams.get('relevancia_minima'))
        : undefined,
    };

    const mentions = await getSocialMentions(filters);
    return NextResponse.json(mentions);
  } catch (error) {
    console.error('Erro ao buscar menções sociais:', error);
    return NextResponse.json({ error: 'Erro ao buscar feed social' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  const expectedToken = `Bearer ${process.env.SOCIAL_CRON_SECRET}`;

  if (!authHeader || authHeader !== expectedToken) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const tweets = await fetchAllAreas();

    let total_classificados = 0;
    let total_pendentes = 0;

    for (const tweet of tweets) {
      await upsertTweet(tweet);

      const classification = await classifyTweet(tweet);
      if (classification) {
        await updateClassification(tweet.tweet_id, classification);
        total_classificados++;
      } else {
        total_pendentes++;
      }
    }

    return NextResponse.json({
      total_capturados: tweets.length,
      total_classificados,
      total_pendentes,
    });
  } catch (error) {
    console.error('Erro no pipeline social:', error);
    return NextResponse.json({ error: 'Erro ao executar pipeline social' }, { status: 500 });
  }
}
