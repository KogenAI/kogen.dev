import type { APIRoute, GetStaticPaths } from 'astro';
import { visibleAnnouncements, dateLabel } from '../../../lib/announcements';
import { socialCard } from '../../../lib/social-card';

export const getStaticPaths: GetStaticPaths = async () =>
  (await visibleAnnouncements()).map(post => ({ params: { slug: post.id }, props: { post } }));

export const GET: APIRoute = async ({ props }) => {
  const { post } = props;
  const png = await socialCard({
    title: post.data.title,
    label: 'Announcement',
    date: post.data.publishedAt ? dateLabel(post.data.publishedAt) : 'Draft',
  });
  return new Response(png, { headers: { 'Content-Type': 'image/png' } });
};
