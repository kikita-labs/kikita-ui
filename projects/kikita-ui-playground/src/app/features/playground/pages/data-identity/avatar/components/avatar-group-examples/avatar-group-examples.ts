import { Component, computed, inject } from '@angular/core';

import { toSignal } from '@angular/core/rxjs-interop';

import { KuiAvatarGroupComponent, KuiTextDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import type { KuiAvatarItem, KuiAvatarSize } from '@kikita-labs/ui';

const MEMBER_KEYS = [
  'people.groupFirst',
  'people.groupSecond',
  'people.groupThird',
  'people.groupFourth',
  'people.groupFifth',
] as const;

const GROUP_SIZES = [
  { value: 'xs', label: 'avatar.groups.sizeXs' },
  { value: 'sm', label: 'avatar.groups.sizeSm' },
  { value: 'md', label: 'avatar.groups.sizeMd' },
  { value: 'lg', label: 'avatar.groups.sizeLg' },
  { value: 'xl', label: 'avatar.groups.sizeXl' },
  { value: '2xl', label: 'avatar.groups.size2xl' },
] as const satisfies readonly { value: KuiAvatarSize; label: string }[];

@Component({
  selector: 'app-avatar-group-examples',
  imports: [KuiAvatarGroupComponent, KuiTextDirective, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './avatar-group-examples.html',
  styleUrl: './avatar-group-examples.scss',
})
export class AvatarGroupExamples {
  private readonly transloco = inject(TranslocoService);

  private readonly memberNames = toSignal(
    this.transloco.selectTranslate<string[]>([...MEMBER_KEYS], {}, { scope: 'avatar' }),
    { initialValue: [] },
  );

  protected readonly groupSizes = GROUP_SIZES;

  protected readonly groupMembers = computed<readonly KuiAvatarItem[]>(() => {
    const [first, second, third, fourth, fifth] = this.memberNames();

    if (!first || !second || !third || !fourth || !fifth) return [];

    return [
      { name: first, status: 'online' },
      {
        name: second,
        initials: this.transloco.translate('avatar.people.groupSecondInitials'),
        status: 'away',
        paletteIndex: 2,
      },
      {
        name: third,
        src: '/assets/avatar-example.svg',
        alt: this.transloco.translate('avatar.people.groupImage'),
      },
      { name: fourth, status: 'busy', paletteIndex: 7 },
      {
        name: fifth,
        initials: this.transloco.translate('avatar.people.groupFifthInitials'),
      },
    ];
  });

  protected readonly completeGroup = computed(() => this.groupMembers().slice(0, 3));
}
