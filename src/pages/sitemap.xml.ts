import type { APIRoute } from 'astro';
import { visibleAnnouncements, announcementUrl } from '../lib/announcements';

export const GET: APIRoute = async () => {
  const posts = await visibleAnnouncements();
  const paths = ['/', '/origins/', '/announcements/', ...posts.filter(post => post.data.status === 'published').map(announcementUrl)];
  const entries = paths.map(path => `<url><loc>${new URL(path, 'https://kogen.dev').href}</loc></url>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</urlset>`, { headers: { 'Content-Type': 'application/xml' } });
};
