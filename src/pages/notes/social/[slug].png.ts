import type { APIRoute, GetStaticPaths } from 'astro';
import { visibleNotes, noteDateLabel } from '../../../lib/notes';
import { socialCard } from '../../../lib/social-card';

export const getStaticPaths: GetStaticPaths = async () =>
  (await visibleNotes()).map(note => ({ params: { slug: note.id }, props: { note } }));

export const GET: APIRoute = async ({ props }) => {
  const { note } = props;
  const png = await socialCard({
    title: note.data.title,
    label: 'Note',
    date: note.data.publishedAt ? noteDateLabel(note.data.publishedAt) : 'Draft',
  });
  return new Response(png, { headers: { 'Content-Type': 'image/png' } });
};
