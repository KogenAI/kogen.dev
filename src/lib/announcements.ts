import { getCollection, type CollectionEntry } from 'astro:content';
export async function visibleAnnouncements() {
 const includeDrafts = import.meta.env.DEV || import.meta.env.KOGEN_INCLUDE_DRAFTS === 'true';
 return (await getCollection('announcements', ({data}) => includeDrafts || data.status === 'published'))
  .sort((a,b) => (b.data.publishedAt?.getTime() ?? 0) - (a.data.publishedAt?.getTime() ?? 0) || a.id.localeCompare(b.id));
}
export const dateLabel = (date: Date) => date.toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});

// Drafts without a publication date stay on an explicitly private preview path.
export function announcementPath(post: CollectionEntry<'announcements'>) {
 const date = post.data.publishedAt;
 if (!date && post.data.status === 'published') {
  throw new Error(`Published announcement ${post.id} has no publication date.`);
 }
 const segment = date ? date.toISOString().slice(0, 10) : 'drafts';
 return `${segment}/${post.id}`;
}
export const announcementUrl = (post: CollectionEntry<'announcements'>) => `/announcements/${announcementPath(post)}/`;
