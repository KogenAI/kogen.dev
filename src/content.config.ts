import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
const announcements = defineCollection({
 loader: glob({ pattern: '**/*.md', base: './src/content/announcements' }),
 schema: z.object({
  title: z.string(), summary: z.string(), author: z.string(),
  status: z.enum(['draft','published']).default('draft'),
  publishedAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
 }).refine(entry => entry.status !== 'published' || Boolean(entry.publishedAt), {
  message: 'Published announcements require a publication date.',
 }).refine(entry => !entry.updatedAt || !entry.publishedAt || entry.updatedAt >= entry.publishedAt, {
  message: 'Update date cannot precede publication.',
 }),
});
const notes = defineCollection({
 loader: glob({ pattern: '**/*.md', base: './src/content/notes' }),
 schema: z.object({
  title: z.string(), summary: z.string(), author: z.string(),
  status: z.enum(['draft','published']).default('draft'),
  publishedAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
 }).refine(entry => entry.status !== 'published' || Boolean(entry.publishedAt), {
  message: 'Published notes require a publication date.',
 }).refine(entry => !entry.updatedAt || !entry.publishedAt || entry.updatedAt >= entry.publishedAt, {
  message: 'Update date cannot precede publication.',
 }),
});
export const collections = { announcements, notes };
