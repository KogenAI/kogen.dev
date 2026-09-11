import type { APIRoute } from 'astro';
import { visibleAnnouncements, announcementUrl } from '../lib/announcements';
import { visibleNotes, noteUrl } from '../lib/notes';

export const GET: APIRoute = async () => {
  const posts = await visibleAnnouncements();
  const notes = await visibleNotes();
  const paths = ['/', '/origins/', '/notes/', '/announcements/', ...notes.filter(note => note.data.status === 'published').map(noteUrl), ...posts.filter(post => post.data.status === 'published').map(announcementUrl)];
  const entries = paths.map(path => `<url><loc>${new URL(path, 'https://kogen.dev').href}</loc></url>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</urlset>`, { headers: { 'Content-Type': 'application/xml' } });
};
