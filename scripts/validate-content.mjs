import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import yaml from 'js-yaml';

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
      return JSON.parse(await readFile(filePath, 'utf8'));
    }),
  );
}

function parseFrontmatter(source, filePath) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);

  if (!match) {
    throw new Error(`Missing YAML frontmatter: ${filePath}`);
  }

  const data = yaml.load(match[1]);

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error(`Invalid YAML frontmatter: ${filePath}`);
  }

  return data;
}

async function readMarkdownDirectory(directoryName) {
  const directory = path.join(contentRoot, directoryName);
  const filePaths = await findFiles(directory, ['.md', '.mdx']);

  return Promise.all(
    filePaths.map(async (filePath) => {
      return parseFrontmatter(await readFile(filePath, 'utf8'), filePath);
    }),
  );
}

async function main() {
  const [categories, products] = await Promise.all([
    readJsonDirectory('product-categories'),
    readMarkdownDirectory('products'),
  ]);
  const errors = validateContentReferences({
    categories,
    products,
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
