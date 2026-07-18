import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vitest';

import { runStaticAudit } from './verify-static-audit.mjs';

describe('verify-static-audit', () => {
  it('accepts a minimal valid repository surface', () => {
    const root = makeValidRepo();

    expect(runStaticAudit(root)).toEqual([]);
  });

  it('reports invalid skills and missing component docs', () => {
    const root = makeValidRepo();
    mkdirSync(join(root, '.agents', 'skills', 'BadSkill'), { recursive: true });
    writeFileSync(
      join(root, '.agents', 'skills', 'BadSkill', 'SKILL.md'),
      '---\nname: BadSkill\n---\n\n# Bad\n',
    );
    mkdirSync(join(root, 'projects/ui/src/lib/components/missing-doc'), { recursive: true });

    const failures = runStaticAudit(root);

    expect(failures).toEqual(
      expect.arrayContaining([
        '.agents/skills/BadSkill is not lowercase hyphen-case',
        'docs/missing-doc.md is missing for public primitive missing-doc',
        'projects/ui/src/lib/components/missing-doc has no unit spec',
      ]),
    );
  });

  it('reports internal context exports from public primitive barrels', () => {
    const root = makeValidRepo();
    writeFileSync(
      join(root, 'projects/ui/src/lib/components/button/index.ts'),
      "export { KUI_BUTTON_CONTEXT } from './kui-button-context.token';\n",
    );

    expect(runStaticAudit(root)).toEqual(
      expect.arrayContaining([
        'projects/ui/src/lib/components/button/index.ts exports an internal context token',
      ]),
    );
  });
});

function makeValidRepo() {
  const root = mkdtempSync(join(tmpdir(), 'kui-audit-'));
  mkdirSync(join(root, '.agents', 'skills', 'kikita-ui-demo'), { recursive: true });
  mkdirSync(join(root, 'docs'), { recursive: true });
  mkdirSync(join(root, 'projects/ui/src/styles'), { recursive: true });
  mkdirSync(join(root, 'projects/ui/src/lib/components/button'), { recursive: true });
  mkdirSync(join(root, 'projects/playground/src/app'), { recursive: true });
  writeFileSync(join(root, 'AGENTS.md'), '- `.agents/workflow.md`\n');
  mkdirSync(join(root, '.agents'), { recursive: true });
  writeFileSync(join(root, '.agents', 'workflow.md'), '# Workflow\n');
  writeFileSync(
    join(root, '.agents', 'skills', 'kikita-ui-demo', 'SKILL.md'),
    '---\nname: kikita-ui-demo\ndescription: Demo skill.\n---\n\n# Demo\n',
  );
  writeFileSync(join(root, 'docs', 'button.md'), '# Button\n');
  writeFileSync(join(root, 'docs', 'state-coverage.md'), '| `/button` |\n');
  writeFileSync(join(root, 'projects/ui/src/styles/kikita-ui.css'), "@import './button.css';\n");
  writeFileSync(join(root, 'projects/ui/src/styles/button.css'), '.kui-button {}\n');
  writeFileSync(
    join(root, 'projects/ui/src/lib/components/button/kui-button.directive.ts'),
    '/** Button directive. */\nexport class KuiButtonDirective {}\n',
  );
  writeFileSync(
    join(root, 'projects/ui/src/lib/components/button/kui-button.directive.spec.ts'),
    "import { describe, it } from 'vitest';\n\ndescribe('button', () => { it('has a spec', () => {}); });\n",
  );
  writeFileSync(
    join(root, 'projects/ui/src/lib/components/button/index.ts'),
    "export { KuiButtonDirective } from './kui-button.directive';\n",
  );
  writeFileSync(
    join(root, 'projects/playground/src/app/app.ts'),
    "export const nav = [{ path: '/button' }];\n",
  );
  return root;
}
