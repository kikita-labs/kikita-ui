import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  buildDockerArgs,
  playwrightImage,
  readPlaywrightVersion,
  visualSuites,
} from './visual-docker.mjs';

describe('visual-docker', () => {
  it('pins the image to the given Playwright version', () => {
    expect(playwrightImage('1.61.1')).toBe('mcr.microsoft.com/playwright:v1.61.1-noble');
  });

  it('runs the suite command without updating snapshots by default', () => {
    const args = buildDockerArgs({ suite: 'playground', update: false, version: '1.61.1' });
    const script = args[args.length - 1];

    expect(args).toContain('mcr.microsoft.com/playwright:v1.61.1-noble');
    expect(script).toContain(visualSuites.playground.test);
    expect(script).not.toContain('--update-snapshots');
  });

  it('appends --update-snapshots when updating baselines', () => {
    const args = buildDockerArgs({ suite: 'library', update: true, version: '1.61.1' });

    expect(args[args.length - 1]).toMatch(/--project=visual --update-snapshots$/);
  });

  it('keeps Linux dependencies and build output off the host checkout', () => {
    const args = buildDockerArgs({ suite: 'playground', update: false, version: '1.61.1' });

    expect(args).toContain('kikita-ui-node-modules:/work/node_modules');
    expect(args).toContain('kikita-ui-dist:/work/dist');
  });

  it('rejects an unknown suite', () => {
    expect(() => buildDockerArgs({ suite: 'nope', update: false, version: '1.61.1' })).toThrow(
      /Unknown visual suite "nope"/,
    );
  });

  it('uses the same Playwright image in every CI job as the installed Playwright version', () => {
    const workflow = readFileSync(resolve('.github/workflows/ci.yml'), 'utf8');
    const images = [...workflow.matchAll(/image:\s*(mcr\.microsoft\.com\/playwright:\S+)/g)].map(
      (match) => match[1],
    );

    expect(images.length).toBeGreaterThan(0);
    for (const image of images) {
      expect(image).toBe(playwrightImage(readPlaywrightVersion()));
    }
  });
});
