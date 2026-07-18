import { createHash } from 'node:crypto';
import { createInterface } from 'node:readline/promises';
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
} from 'node:fs';
import { homedir } from 'node:os';
import { basename, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const repoSkillsDir = join(repoRoot, '.agents', 'skills');

if (isMain()) {
  const options = parseArgs(process.argv.slice(2));
  const result = await runSkillSync({
    check: options.check,
    yes: options.yes,
    targetDir: options.targetDir,
    cwd: repoRoot,
  });

  printReport(result);
}

export async function runSkillSync(options = {}) {
  const cwd = options.cwd ? resolve(options.cwd) : repoRoot;
  const sourceDir = options.sourceDir ? resolve(options.sourceDir) : join(cwd, '.agents', 'skills');
  const targetDir = resolveTargetDir(options.targetDir);
  const repoSkills = listSkillNames(sourceDir);
  const localSkills = existsSync(targetDir) ? listSkillNames(targetDir) : [];
  const report = {
    sourceDir,
    targetDir,
    same: [],
    missing: [],
    different: [],
    localOnly: [],
    copied: [],
    skipped: [],
  };

  for (const skill of repoSkills) {
    const sourceSkill = join(sourceDir, skill);
    const targetSkill = join(targetDir, skill);

    if (!existsSync(targetSkill)) {
      report.missing.push(skill);

      if (!options.check) {
        mkdirSync(targetDir, { recursive: true });
        cpSync(sourceSkill, targetSkill, { recursive: true });
        report.copied.push(skill);
      }

      continue;
    }

    if (hashDirectory(sourceSkill) === hashDirectory(targetSkill)) {
      report.same.push(skill);
      continue;
    }

    report.different.push(skill);

    if (options.check) {
      continue;
    }

    const shouldOverwrite = options.yes || (await askOverwrite(skill, targetSkill));

    if (shouldOverwrite) {
      assertInside(targetSkill, targetDir);
      rmSync(targetSkill, { recursive: true, force: true });
      cpSync(sourceSkill, targetSkill, { recursive: true });
      report.copied.push(skill);
    } else {
      report.skipped.push(skill);
    }
  }

  for (const skill of localSkills) {
    if (!repoSkills.includes(skill)) {
      report.localOnly.push(skill);
    }
  }

  return report;
}

export function resolveTargetDir(explicitTarget) {
  if (explicitTarget) {
    return resolve(explicitTarget);
  }

  if (process.env.CODEX_HOME) {
    return join(process.env.CODEX_HOME, 'skills');
  }

  return join(homedir(), '.codex', 'skills');
}

export function listSkillNames(directory) {
  if (!existsSync(directory)) {
    return [];
  }

  return readdirSync(directory)
    .filter((entry) => {
      const path = join(directory, entry);
      return statSync(path).isDirectory() && existsSync(join(path, 'SKILL.md'));
    })
    .sort();
}

export function hashDirectory(directory) {
  const hash = createHash('sha256');

  for (const file of collectFiles(directory)) {
    hash.update(relative(directory, file).replaceAll('\\', '/'));
    hash.update('\0');
    hash.update(readFileSync(file));
    hash.update('\0');
  }

  return hash.digest('hex');
}

function collectFiles(directory) {
  const files = [];

  for (const entry of readdirSync(directory).sort()) {
    const path = join(directory, entry);
    const stats = statSync(path);

    if (stats.isDirectory()) {
      files.push(...collectFiles(path));
    } else if (stats.isFile()) {
      files.push(path);
    }
  }

  return files;
}

function parseArgs(args) {
  const options = {
    check: false,
    yes: false,
    targetDir: undefined,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === '--check') {
      options.check = true;
    } else if (arg === '--yes') {
      options.yes = true;
    } else if (arg === '--target') {
      options.targetDir = args[index + 1];
      index += 1;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

async function askOverwrite(skill, targetSkill) {
  if (!process.stdin.isTTY) {
    return false;
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout });

  try {
    const answer = await rl.question(
      `Local skill "${skill}" differs at ${targetSkill}. Overwrite it with the repo copy? [y/N] `,
    );

    return answer.trim().toLowerCase() === 'y' || answer.trim().toLowerCase() === 'yes';
  } finally {
    rl.close();
  }
}

function printReport(report) {
  console.log(`Repo skills: ${report.sourceDir}`);
  console.log(`Local skills: ${report.targetDir}`);
  console.log(`same: ${formatList(report.same)}`);
  console.log(`missing: ${formatList(report.missing)}`);
  console.log(`different: ${formatList(report.different)}`);
  console.log(`local-only: ${formatList(report.localOnly)}`);

  if (report.copied.length > 0) {
    console.log(`copied: ${formatList(report.copied)}`);
  }

  if (report.skipped.length > 0) {
    console.log(`skipped: ${formatList(report.skipped)}`);
  }
}

function formatList(values) {
  return values.length > 0 ? values.join(', ') : 'none';
}

function assertInside(child, parent) {
  const childPath = resolve(child);
  const parentPath = resolve(parent);
  const relativePath = relative(parentPath, childPath);

  if (relativePath.startsWith('..') || relativePath === '' || relativePath.includes('..\\')) {
    throw new Error(`${basename(child)} is not inside ${parent}`);
  }
}

function isMain() {
  return process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
}
