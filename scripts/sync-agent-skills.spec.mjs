import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vitest';

import { hashDirectory, runSkillSync } from './sync-agent-skills.mjs';

describe('sync-agent-skills', () => {
  it('copies missing repo skills in sync mode', async () => {
    const root = makeFixture();
    const result = await runSkillSync({
      sourceDir: join(root, 'repo'),
      targetDir: join(root, 'local'),
    });

    expect(result.missing).toEqual(['kikita-ui-demo']);
    expect(result.copied).toEqual(['kikita-ui-demo']);
    expect(readFileSync(join(root, 'local', 'kikita-ui-demo', 'SKILL.md'), 'utf8')).toContain(
      'kikita-ui-demo',
    );
  });

  it('reports differences without overwriting in check mode', async () => {
    const root = makeFixture();
    const localSkill = join(root, 'local', 'kikita-ui-demo');
    mkdirSync(localSkill, { recursive: true });
    writeFileSync(join(localSkill, 'SKILL.md'), 'local customization');

    const before = hashDirectory(localSkill);
    const result = await runSkillSync({
      check: true,
      sourceDir: join(root, 'repo'),
      targetDir: join(root, 'local'),
    });

    expect(result.different).toEqual(['kikita-ui-demo']);
    expect(hashDirectory(localSkill)).toBe(before);
  });
});

function makeFixture() {
  const root = mkdtempSync(join(tmpdir(), 'kui-skills-'));
  const skill = join(root, 'repo', 'kikita-ui-demo');
  mkdirSync(skill, { recursive: true });
  writeFileSync(
    join(skill, 'SKILL.md'),
    '---\nname: kikita-ui-demo\ndescription: Demo skill.\n---\n\n# Demo\n',
  );
  return root;
}
