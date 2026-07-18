import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import { createServer } from 'node:http';

const angularApp = new AngularNodeAppEngine({
  allowedHosts: ['127.0.0.1', 'localhost'],
});
const port = Number(process.env['PORT'] ?? 4000);

if (isMainModule(import.meta.url)) {
  createServer(async (request, response) => {
    try {
      const angularResponse = await angularApp.handle(request);

      if (angularResponse) {
        await writeResponseToNodeResponse(angularResponse, response);
      } else {
        response.writeHead(404);
        response.end('Not found');
      }
    } catch (error) {
      console.error(error);
      response.writeHead(500);
      response.end('Server error');
    }
  }).listen(port, () => {
    console.log(`Playground SSR server listening on http://localhost:${port}`);
  });
}

export default createNodeRequestHandler(async (request, response) => {
  const angularResponse = await angularApp.handle(request);

  if (angularResponse) {
    await writeResponseToNodeResponse(angularResponse, response);
  } else {
    response.writeHead(404);
    response.end('Not found');
  }
});
