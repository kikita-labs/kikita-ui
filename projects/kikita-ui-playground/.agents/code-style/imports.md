# Imports

Group imports in this order, with a blank line between groups (no blank line within a
group):

1. Angular core/common (`@angular/core`, `@angular/common`, ...).
2. RxJS and Angular interop (`rxjs`, `rxjs/operators`, `@angular/core/rxjs-interop`).
3. Third-party packages.

4. UI library (@kikita-labs/ui (workspace source)) imports.
5. Project path-alias imports (`@app/...`, `@shared/...`, see
   `../architecture/aliases-and-barrels.md`).
6. Local relative imports (same feature, `./`).
7. Type-only imports last within whichever group they belong to (`import type { ... }`).

```ts
import { Component, computed, input } from '@angular/core';

import { catchError, finalize } from 'rxjs';

import { z } from 'zod';

import { KuiButton } from '@kikita-labs/ui';

import { UserService } from '@app/user/user.service';

import { formatDisplayName } from './helpers';
import type { UserCardProps } from './types';
```

- Never deep-import past a barrel (`@app/user/internal/foo`) — import from the barrel
  (`@app/user`) instead.
- A barrel (`index.ts`) exports only symbols meant for outside consumers. No `export *`
  from a barrel — list exports explicitly so accidental surface growth is visible in review.
- Type-only exports from a barrel use `export type { Foo }`, not a plain `export { Foo }`
  — keeps type-only symbols erasable and makes the barrel's runtime surface accurate.
- A barrel must not import from its own parent folder (no import cycles through the barrel).
- This order isn't just hand-formatting discipline — `eslint-plugin-simple-import-sort` (or
  equivalent) plus `@typescript-eslint/consistent-type-imports` enforce it at lint time. See
  `../testing-and-quality.md`.

## Review Checklist

- [ ] Groups in the order above, blank line between groups.
- [ ] No deep imports past a barrel.
- [ ] Barrel exports are explicit, not `export *`; type-only exports use `export type`.
