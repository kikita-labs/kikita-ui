import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const browserRoot = resolve(root, 'dist/playground/browser');
const port = Number(process.env.PORT ?? 4173);

const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.ico', 'image/x-icon'],
]);

if (!existsSync(browserRoot)) {
  console.error(
    `Missing playground browser output at ${browserRoot}. Run pnpm.cmd build:playground first.`,
  );
  process.exit(1);
}

createServer((request, response) => {
  const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);
  const filePath = resolveFile(url.pathname);

  response.setHeader('Cache-Control', 'no-store');
  response.setHeader(
    'Content-Type',
    contentTypes.get(extname(filePath)) ?? 'application/octet-stream',
  );
  createReadStream(filePath).pipe(response);
}).listen(port, () => {
  console.log(`Serving playground dist at http://127.0.0.1:${port}`);
});

function resolveFile(pathname) {
  const normalized = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, '');
  const candidate = resolve(browserRoot, normalized.slice(1));

  if (candidate.startsWith(browserRoot) && existsSync(candidate) && statSync(candidate).isFile()) {
    return candidate;
  }

  const indexHtml = join(browserRoot, 'index.html');

  if (existsSync(indexHtml)) {
    return indexHtml;
  }

  return join(browserRoot, 'index.csr.html');
}
