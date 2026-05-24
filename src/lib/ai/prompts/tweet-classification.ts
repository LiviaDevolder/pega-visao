import type { RawTweet } from '@/lib/social/apify-client';

export interface TweetClassification {
  area_fm: string | null;
  tipo_crime: string | null;
  local_especifico: string | null;
  horario_relatado: string | null;
  relevancia: number;
  sentimento: string;
  is_relevant: boolean;
}

export function buildTweetClassificationPrompt(tweet: RawTweet): string {
  return `Voce e um analista de seguranca publica do CompStat Municipal do Rio de Janeiro. Classifique o tweet abaixo em relacao a ocorrencias criminais nas areas da Forca Municipal (FM) do Rio de Janeiro.

## Tweet

Autor: @${tweet.autor}
Data: ${tweet.data_tweet}
Texto: "${tweet.texto}"

## Instrucoes

Analise se o tweet relata ou menciona uma ocorrencia criminal no municipio do Rio de Janeiro. Retorne um JSON com exatamente estes campos:

{
  "area_fm": "nome da area FM mais provavelmente mencionada, ou null se nao identificada",
  "tipo_crime": "um de: 'roubo', 'furto', 'tiroteio', 'outros', null se nao relevante",
  "local_especifico": "logradouro, bairro ou referencia geografica especifica mencionada, ou null",
  "horario_relatado": "horario ou periodo do dia mencionado no tweet (ex: '22h', 'madrugada'), ou null",
  "relevancia": numero de 1 a 5 (1=irrelevante, 5=altamente relevante para seguranca publica),
  "sentimento": "negativo", "neutro" ou "positivo",
  "is_relevant": true se o tweet relata um crime ou situacao de seguranca publica real, false caso contrario
}

Areas FM validas: Copacabana, Botafogo, Ipanema, Centro, Tijuca, Madureira, Penha, Meier, Jacarepagua, Bangu, Santa Cruz, Ilha do Governador, Sao Cristovao, Ramos, Pavuna, Santa Teresa, Bonsucesso, Iraja, Ilha de Paqueta, Deodoro, Guaratiba, Vigario Geral.

Responda APENAS com o JSON, sem markdown ou texto adicional.`;
}
