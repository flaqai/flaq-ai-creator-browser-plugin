import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const EXECUTABLE_INLINE_SCRIPT = /<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/gi;

export function externalizeInlineScripts(html) {
  const scripts = new Map();
  const transformed = html.replace(EXECUTABLE_INLINE_SCRIPT, (tag, attributes, content) => {
    if (/type=["']application\/ld\+json["']/i.test(attributes)) return '';
    if (!content.trim()) return '';

    const digest = createHash('sha256').update(content).digest('hex').slice(0, 20);
    scripts.set(`${digest}.js`, content);
    return `<script${attributes} src="/site/_inline/${digest}.js"></script>`;
  });

  return { html: transformed, scripts };
}

async function findHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return findHtmlFiles(fullPath);
      return entry.name.endsWith('.html') ? [fullPath] : [];
    }),
  );
  return nested.flat();
}

export async function packageStaticSite({ sourceDirectory, publicDirectory, outputDirectory }) {
  const siteDirectory = path.join(outputDirectory, 'site');
  const inlineDirectory = path.join(siteDirectory, '_inline');

  await cp(sourceDirectory, siteDirectory, { recursive: true, force: true });
  await cp(publicDirectory, outputDirectory, { recursive: true, force: true });
  await mkdir(inlineDirectory, { recursive: true });

  const htmlFiles = await findHtmlFiles(siteDirectory);
  const scripts = new Map();

  for (const htmlPath of htmlFiles) {
    const result = externalizeInlineScripts(await readFile(htmlPath, 'utf8'));
    await writeFile(htmlPath, result.html);
    for (const [name, content] of result.scripts) scripts.set(name, content);
  }

  await Promise.all(
    [...scripts].map(([name, content]) => writeFile(path.join(inlineDirectory, name), content)),
  );

  return { htmlFiles: htmlFiles.length, inlineScripts: scripts.size };
}
