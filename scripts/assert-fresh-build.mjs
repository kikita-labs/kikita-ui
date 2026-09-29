import { existsSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

/** Files that never change what a build emits: tests and prose. */
const IGNORED_SOURCE = /(\.spec\.(ts|mjs)|\.md)$/;

/**
 * Returns the most recently modified file under the given paths, ignoring tests and prose.
 * A path may be a directory (scanned recursively) or a single file.
 */
export function findNewestSource(paths, root = process.cwd()) {
  let newest = null;

  const consider = (file) => {
    if (IGNORED_SOURCE.test(file)) return;
    const mtimeMs = statSync(file).mtimeMs;
    if (!newest || mtimeMs > newest.mtimeMs) newest = { file, mtimeMs };
  };

  for (const path of paths) {
    const absolute = resolve(root, path);
    if (!existsSync(absolute)) continue;

    if (statSync(absolute).isFile()) {
      consider(absolute);
      continue;
    }

    for (const entry of readdirSync(absolute, { recursive: true, withFileTypes: true })) {
      if (entry.isFile()) consider(join(entry.parentPath, entry.name));
    }
  }

  return newest;
}

/**
 * Checks that a build artifact is not older than the sources it is built from.
 *
 * A browser or SSR suite that runs against `dist/` must fail loudly when the artifact predates
 * the code under test. Otherwise a stale build passes and hides a regression.
 *
 * @returns an object with `stale` and a human-readable `message`.
 */
export function checkBuildFreshness({
  name,
  outputs,
  sources,
  buildCommand,
  root = process.cwd(),
}) {
  const missing = outputs.filter((output) => !existsSync(resolve(root, output)));

  if (missing.length > 0) {
    return {
      stale: true,
      message: `${name} build output is missing (${missing.join(', ')}). Run \`${buildCommand}\`.`,
    };
  }

  const oldestOutput = Math.min(
    ...outputs.map((output) => statSync(resolve(root, output)).mtimeMs),
  );
  const newestSource = findNewestSource(sources, root);

  if (newestSource && newestSource.mtimeMs > oldestOutput) {
    return {
      stale: true,
      message:
        `${name} build output is older than its sources (${newestSource.file}). ` +
        `Run \`${buildCommand}\` before this suite.`,
    };
  }

  return { stale: false, message: `${name} build output is current.` };
}

/** Throws when the build is stale. Used from Playwright `globalSetup`. */
export function assertFreshBuild(options) {
  const result = checkBuildFreshness(options);

  if (result.stale) throw new Error(result.message);
}
