import fs from 'fs';
import path from 'path';
import type { Plugin } from 'vite';

export { generateDocMap, type DocEntry } from '../scripts/generateDocMap';
import { parseDoc } from '../scripts/generateDocMap';
import { generateDocMap } from '../scripts/generateDocMap';

export default function generateDocsPlugin(): Plugin {
  const DOCS_SOURCE_DIR = path.resolve(process.cwd(), 'public-docs');

  return {
    name: 'generate-docs',

    buildStart() {
      generateDocMap();
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
