import fs from 'fs';
import path from 'path';
import type { Plugin } from 'vite';

interface DocEntry {
  short: string;
  hasLong: boolean;
}

const parseDoc = (content: string): { short: string; long: string; hasLong: boolean } => {
  const shortMatch = content.match(/-- Short --\s*\n([\s\S]*?)(?=\n-- Long --|$)/);
  const longMatch = content.match(/-- Long --\s*\n([\s\S]*)/);

  const short = shortMatch ? shortMatch[1].trim() : '';
  const long = longMatch ? longMatch[1].trim() : '';
  const hasLong = !!long;

  return { short, long, hasLong };
};

export default function generateDocsPlugin(): Plugin {
  let docMap: Record<string, DocEntry> = {};
  const DOCS_SOURCE_DIR = path.resolve(process.cwd(), 'public-docs');

  return {
    name: 'generate-docs',
    
    buildStart() {
      const TS_OUTPUT_FILE = path.resolve(process.cwd(), 'src/generated/docMap.ts');

      const generatedDir = path.dirname(TS_OUTPUT_FILE);
      if (!fs.existsSync(generatedDir)) {
        fs.mkdirSync(generatedDir, { recursive: true });
      }

      // Read all markdown files
      if (!fs.existsSync(DOCS_SOURCE_DIR)) {
        console.warn('⚠ Docs source directory not found:', DOCS_SOURCE_DIR);
        return;
      }

      const files = fs.readdirSync(DOCS_SOURCE_DIR).filter(f => f.endsWith('.md'));

      docMap = {};

      files.forEach(file => {
        const filePath = path.join(DOCS_SOURCE_DIR, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const { short, hasLong } = parseDoc(content);

        const key = path.basename(file, '.md');

        // Add to doc map
        docMap[key] = {
          short,
          hasLong
        };
      });

      // Generate TypeScript file
      const tsContent = `// This file is auto-generated. Do not edit manually.
// Generated from markdown files in public-docs/

export interface DocEntry {
  short: string;
  hasLong: boolean;
}

export const docMap: Record<string, DocEntry> = ${JSON.stringify(docMap, null, 2)} as const;
`;

      fs.writeFileSync(TS_OUTPUT_FILE, tsContent, 'utf-8');

      console.log(`✓ Generated ${Object.keys(docMap).length} documentation entries`);
      console.log(`  → TypeScript map: ${path.relative(process.cwd(), TS_OUTPUT_FILE)}`);
    },

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const match = req.url?.match(/^\/assets\/docs\/(.+\.md)$/);
        if (!match) return next();

        const filename = match[1];
        const filePath = path.join(DOCS_SOURCE_DIR, filename);

        if (!fs.existsSync(filePath)) {
          res.statusCode = 404;
          res.end('Not found');
          return;
        }

        const content = fs.readFileSync(filePath, 'utf-8');
        const { long, hasLong } = parseDoc(content);

        if (!hasLong) {
          res.statusCode = 404;
          res.end('No long content available');
          return;
        }

        res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
        res.end(long);
      });
    },

    generateBundle(_options, _bundle, isWrite) {
      if (!isWrite) return;

      const DOCS_OUTPUT_DIR = path.resolve(process.cwd(), 'dist/assets/docs');

      // Ensure output directory exists
      if (!fs.existsSync(DOCS_OUTPUT_DIR)) {
        fs.mkdirSync(DOCS_OUTPUT_DIR, { recursive: true });
      }

      const files = fs.readdirSync(DOCS_SOURCE_DIR).filter(f => f.endsWith('.md'));

      files.forEach(file => {
        const filePath = path.join(DOCS_SOURCE_DIR, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const { long, hasLong } = parseDoc(content);

        // Write cleaned markdown file (only long content, no markers)
        if (hasLong) {
          const outputPath = path.join(DOCS_OUTPUT_DIR, file);
          fs.writeFileSync(outputPath, long, 'utf-8');
        }
      });
    }
  };
}
