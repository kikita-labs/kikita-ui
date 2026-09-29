import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, normalize, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/**
 * Serves the built library Playground for the SSR suite: static assets first, then the Angular
 * server handler for everything else.
 *
 * The Playground's own `server.mjs` only renders routes. It does not serve `dist/playground/browser`,
 * so the browser never receives its JavaScript and the page is never hydrated: every chunk request
 * is redirected to a route and answered with HTML. A suite that only loads pages passes in that
 * state. This wrapper makes the SSR suite exercise real hydration without changing the app.
 */
const root = fileURLToPath(new URL('..', import.meta.url));
const browserRoot = resolve(root, 'dist/playground/browser');
const serverEntry = resolve(root, 'dist/playground/server/server.mjs');
const port = Number(process.env.PORT ?? 4000);

const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.ico', 'image/x-icon'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.woff2', 'font/woff2'],
]);

if (!existsSync(serverEntry)) {
  console.error(`Missing SSR build at ${serverEntry}. Run pnpm.cmd build:playground first.`);
  process.exit(1);
}

const { default: handleWithAngular } = await import(pathToFileURL(serverEntry).href);

createServer((request, response) => {
  const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);
  const candidate = resolve(browserRoot, normalize(decodeURIComponent(url.pathname)).slice(1));
  const isAsset =
    candidate.startsWith(browserRoot + sep) &&
    !candidate.endsWith('index.csr.html') &&
    existsSync(candidate) &&
    statSync(candidate).isFile();

  if (isAsset) {
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader(
      'Content-Type',
      contentTypes.get(extname(candidate)) ?? 'application/octet-stream',
    );
    createReadStream(candidate).pipe(response);
    return;
  }

  handleWithAngular(request, response, (error) => {
    response.writeHead(error ? 500 : 404);
    response.end(error ? 'Server error' : 'Not found');
  });
}).listen(port, () => {
  console.log(`Serving playground SSR at http://127.0.0.1:${port}`);
});
