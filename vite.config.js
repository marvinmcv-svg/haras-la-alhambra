import { defineConfig } from 'vite';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = import.meta.dirname;

// Every folder with an index.html is a page: /linajes/, /noches/, …
const pages = { main: resolve(root, 'index.html') };
for (const dir of readdirSync(root, { withFileTypes: true })) {
  const html = resolve(root, dir.name, 'index.html');
  if (dir.isDirectory() && !['node_modules', 'dist', 'public', 'src', 'api'].includes(dir.name) && existsSync(html)) {
    pages[dir.name] = html;
  }
}

// <!-- @include nav --> pulls in src/partials/nav.html, so the header, footer and Spirit live in one place.
const partials = {
  name: 'partials',
  transformIndexHtml: {
    order: 'pre',
    handler: (html) => html.replace(/<!--\s*@include\s+([\w-]+)\s*-->/g, (_, name) =>
      readFileSync(resolve(root, 'src/partials', `${name}.html`), 'utf8')),
  },
};

export default defineConfig({
  plugins: [partials],
  build: { rollupOptions: { input: pages } },
});
