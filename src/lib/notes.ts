import { getCollection, type CollectionEntry } from 'astro:content';

export async function visibleNotes() {
 const includeDrafts = import.meta.env.DEV || import.meta.env.KOGEN_INCLUDE_DRAFTS === 'true';
 return (await getCollection('notes', ({data}) => includeDrafts || data.status === 'published'))
  .sort((a,b) => (b.data.publishedAt?.getTime() ?? 0) - (a.data.publishedAt?.getTime() ?? 0) || a.id.localeCompare(b.id));
}

export const noteDateLabel = (date: Date) => date.toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});

export function notePath(note: CollectionEntry<'notes'>) {
 const date = note.data.publishedAt;
 if (!date && note.data.status === 'published') {
  throw new Error(`Published note ${note.id} has no publication date.`);
 }
 const segment = date ? date.toISOString().slice(0, 10) : 'drafts';
 return `${segment}/${note.id}`;
}

export const noteUrl = (note: CollectionEntry<'notes'>) => `/notes/${notePath(note)}/`;
