import fs from 'fs';
import path from 'path';

export interface DocEntry {
  short: string;
  hasLong: boolean;
}

export const parseDoc = (content: string): { short: string; long: string; hasLong: boolean } => {
  const shortMatch = content.match(/-- Short --\s*\n([\s\S]*?)(?=\n-- Long --|$)/);
  const longMatch = content.match(/-- Long --\s*\n([\s\S]*)/);

  const short = shortMatch ? shortMatch[1].trim() : '';
  const long = longMatch ? longMatch[1].trim() : '';
  const hasLong = !!long;

  return { short, long, hasLong };
};

export function generateDocMap(
  docsSourceDir = path.resolve(process.cwd(), 'public-docs'),
  tsOutputFile = path.resolve(process.cwd(), 'src/generated/docMap.ts'),
): Record<string, DocEntry> {
  const generatedDir = path.dirname(tsOutputFile);
  if (!fs.existsSync(generatedDir)) {
    fs.mkdirSync(generatedDir, { recursive: true });
  }

  if (!fs.existsSync(docsSourceDir)) {
    console.warn('⚠ Docs source directory not found:', docsSourceDir);
    return {};
  }

  const files = fs.readdirSync(docsSourceDir).filter(f => f.endsWith('.md'));

  const docMap: Record<string, DocEntry> = {};

  files.forEach(file => {
    const filePath = path.join(docsSourceDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const { short, hasLong } = parseDoc(content);

    const key = path.basename(file, '.md');

    docMap[key] = { short, hasLong };
  });

  const tsContent = `// This file is auto-generated. Do not edit manually.
// Generated from markdown files in public-docs/

export interface DocEntry {
  short: string;
  hasLong: boolean;
}

export const docMap: Record<string, DocEntry> = ${JSON.stringify(docMap, null, 2)} as const;
`;

  fs.writeFileSync(tsOutputFile, tsContent, 'utf-8');

  console.log(`✓ Generated ${Object.keys(docMap).length} documentation entries`);
  console.log(`  → TypeScript map: ${path.relative(process.cwd(), tsOutputFile)}`);

  return docMap;
}
