import {agentContent} from '../lib/agent-response.js';
import articleRedirects from '../lib/article-redirects.json' with {type: 'json'};

export function onRequest(context) {
  const url = new URL(context.request.url);
  const destination = articleRedirects[url.pathname.replace(/\/+$/, '') + '/'];
  if (destination) {
    url.pathname = destination;
    return Response.redirect(url.href, 301);
  }
  return agentContent(context);
}
