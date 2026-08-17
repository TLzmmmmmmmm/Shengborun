import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import { validateContentReferences } from '../src/lib/content-rules.ts';

const contentRoot = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve(process.cwd(), 'src', 'content');

async function findFiles(directory, extensions) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await findFiles(entryPath, extensions)));
    } else if (extensions.some((extension) => entry.name.endsWith(extension))) {
      files.push(entryPath);
    }
  }

  return files;
}

async function readJsonDirectory(directoryName) {
  const directory = path.join(contentRoot, directoryName);
  const filePaths = await findFiles(directory, ['.json']);

  return Promise.all(
    filePaths.map(async (filePath) => {
      const source = await readFile(filePath, 'utf8');
      return source.trim().length === 0 ? undefined : JSON.parse(source);
    }),
  ).then((items) => items.filter(Boolean));
}

async function readJsonFile(relativePath) {
  return JSON.parse(await readFile(path.join(contentRoot, relativePath), 'utf8'));
}

async function main() {
  const [categories, products, features] = await Promise.all([
    readJsonDirectory('product-categories'),
    readJsonDirectory('products'),
    readJsonFile(path.join('product-features', 'features.json')),
  ]);
  const errors = validateContentReferences({
    categories,
    products,
    features,
  });

  if (errors.length > 0) {
    for (const error of errors) {
      console.error(error);
    }
    process.exitCode = 1;
    return;
  }

  console.log('Content references are valid.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
