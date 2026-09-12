import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';

const escapeXml = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

function wrapTitle(title: string, target = 21) {
  const lines: string[] = [];
  for (const word of title.split(/\s+/)) {
    const current = lines.at(-1);
    if (!current || (current.length + word.length + 1 > target && lines.length < 3)) {
      lines.push(word);
    } else if (current.length + word.length + 1 > target) {
      throw new Error(`Social card title exceeds three lines: ${title}`);
    } else {
      lines[lines.length - 1] = `${current} ${word}`;
    }
  }
  return lines.slice(0, 3);
}

export async function socialCard({ title, label, date }: { title: string; label: string; date?: string }) {
  const [kit, wordmark] = await Promise.all([
    readFile(resolve('public/brand/kogen-kit-black.svg')),
    readFile(resolve('public/brand/kogen-wordmark-black.svg')),
  ]);
  const lines = wrapTitle(title);
  const titleSize = lines.length > 2 ? 58 : 66;
  const titleLines = lines.map((line, index) =>
    `<tspan x="72" dy="${index === 0 ? 0 : Math.round(titleSize * 1.12)}">${escapeXml(line)}</tspan>`
  ).join('');
  const footer = date ? `${date} · kogen.dev` : 'kogen.dev';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
      <rect width="1200" height="630" fill="#fff"/>
      <image href="data:image/svg+xml;base64,${wordmark.toString('base64')}" x="72" y="56" width="142" height="49"/>
      <text x="235" y="87" fill="#595959" font-family="Arial, sans-serif" font-size="23" letter-spacing="3">${escapeXml(label.toUpperCase())}</text>
      <text x="72" y="232" fill="#171717" font-family="Arial, sans-serif" font-size="${titleSize}" font-weight="700" letter-spacing="-1.4">${titleLines}</text>
      <text x="72" y="548" fill="#595959" font-family="Arial, sans-serif" font-size="23">${escapeXml(footer)}</text>
      <image href="data:image/svg+xml;base64,${kit.toString('base64')}" x="818" y="130" width="306" height="316"/>
      <path d="M72 586H1128" stroke="#d8d8d8" stroke-width="2"/>
    </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}
