import { HandlerContext, HandlerEvent } from '@netlify/functions';

export function getFunctionHost(
  event: HandlerEvent,
  context: HandlerContext
): string {
  const data = context.clientContext?.custom?.netlify;

  if (!data) {
    const url = new URL(event.rawUrl);
    return `${url.protocol}//${url.host}`;
  }

  const decoded = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));

  return decoded.site_url;
}
