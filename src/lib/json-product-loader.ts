import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import type { Loader } from 'astro/loaders';

async function findJsonFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return findJsonFiles(entryPath);
      return entry.name.endsWith('.json') ? [entryPath] : [];
    }),
  );

  return files.flat().toSorted();
}

export function jsonProductLoader({ base }: { base: string }): Loader {
  return {
    name: 'shengborun-json-products',
    async load({ store, parseData, generateDigest }) {
      store.clear();

      for (const filePath of await findJsonFiles(path.resolve(base))) {
        const source = await readFile(filePath, 'utf8');
        if (source.trim().length === 0) continue;

        const raw = JSON.parse(source) as Record<string, unknown>;
        if (typeof raw.id !== 'string' || raw.id.length === 0) {
          throw new Error(`Product JSON is missing a valid id: ${filePath}`);
        }

        const data = await parseData({ id: raw.id, data: raw, filePath });
        store.set({
          id: raw.id,
          data,
          filePath,
          digest: generateDigest(source),
        });
      }
    },
  };
}
