import { Component, inject, signal } from '@angular/core';

import { toSignal } from '@angular/core/rxjs-interop';

import {
  KuiChipDirective,
  KuiDropdownComponent,
  KuiFieldComponent,
  KuiOptionDirective,
  KuiSelectDirective,
  KuiSelectValueDirective,
} from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { SELECT_ROLES } from '../../constants';
import { SELECT_PEOPLE } from './constants';
import type { SelectPerson } from './interfaces';

/** Shows primitive, object, and multiple-value Select presentations. */
@Component({
  selector: 'app-select-modes',
  imports: [
    KuiChipDirective,
    KuiDropdownComponent,
    KuiFieldComponent,
    KuiOptionDirective,
    KuiSelectDirective,
    KuiSelectValueDirective,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './select-modes.html',
  styleUrl: './select-modes.scss',
})
export class SelectModes {
  private readonly transloco = inject(TranslocoService);

  protected readonly people = SELECT_PEOPLE;
  protected readonly roles = SELECT_ROLES;
  private readonly teamValues = [...new Set(SELECT_PEOPLE.map(({ team }) => team))];
  private readonly roleLabels = toSignal(
    this.transloco.selectTranslate<string[]>(
      SELECT_ROLES.map(({ value }) => `options.${value}`),
      {},
      { scope: 'select' },
    ),
    { initialValue: [] },
  );
  private readonly teamLabels = toSignal(
    this.transloco.selectTranslate<string[]>(
      this.teamValues.map((team) => `teams.${team}`),
      {},
      { scope: 'select' },
    ),
    { initialValue: [] },
  );

  protected readonly selectedPerson = signal<SelectPerson | null>(SELECT_PEOPLE[1]);
  protected readonly defaultChipRoles = signal<readonly string[]>([
    'owner',
    'editor',
    'reviewer',
    'viewer',
  ]);
  protected readonly chipRoles = signal<readonly string[]>(['owner', 'editor', 'reviewer']);
  protected readonly textRoles = signal<readonly string[]>(['editor', 'viewer']);
  protected readonly customRoles = signal<readonly string[]>(['owner', 'reviewer', 'viewer']);

  protected readonly personLabel = (person: SelectPerson): string => person.name;
  protected readonly teamLabel = (team: SelectPerson['team']): string => {
    const teamIndex = this.teamValues.indexOf(team);
    return this.teamLabels()[teamIndex] ?? team;
  };
  protected readonly roleLabel = (value: string): string => {
    const roleIndex = SELECT_ROLES.findIndex((role) => role.value === value);
    return this.roleLabels()[roleIndex] ?? value;
  };
  protected readonly formatRoles = (items: readonly string[]): string =>
    items.map((item) => this.roleLabel(item)).join(' · ');
}
