import { Component, ViewEncapsulation } from '@angular/core';

import { KuiAvatarComponent, KuiAvatarGroupComponent } from '@kikita-labs/ui';

import type { KuiAvatarItem } from '@kikita-labs/ui';

import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

@Component({
  selector: 'app-avatar-page',
  imports: [KuiAvatarComponent, KuiAvatarGroupComponent, PlaygroundPanelComponent],
  templateUrl: './avatar.page.html',
  styleUrl: './avatar.page.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AvatarPage {
  protected readonly imageUrl = 'https://i.pravatar.cc/200?img=11';

  protected readonly sizes = [
    { value: 'xs' as const, label: 'xs' },
    { value: 'sm' as const, label: 'sm' },
    { value: 'md' as const, label: 'md' },
    { value: 'lg' as const, label: 'lg' },
    { value: 'xl' as const, label: 'xl' },
    { value: '2xl' as const, label: '2xl' },
  ];

  protected readonly statuses = [
    { value: 'online' as const, label: 'Online' },
    { value: 'away' as const, label: 'Away' },
    { value: 'busy' as const, label: 'Busy' },
    { value: 'offline' as const, label: 'Offline' },
  ];

  protected readonly palette = [
    { index: 1, initials: 'NR', name: 'Nikita Repin' },
    { index: 2, initials: 'AM', name: 'Anya Murashova' },
    { index: 3, initials: 'TO', name: 'Timur Ognev' },
    { index: 4, initials: 'VS', name: 'Vera Saltykova' },
    { index: 5, initials: 'ID', name: 'Ilya Denisov' },
    { index: 6, initials: 'MK', name: 'Mira Kovaleva' },
    { index: 7, initials: 'SP', name: 'Sasha Petrov' },
  ];

  protected readonly members: readonly KuiAvatarItem[] = [
    { src: this.imageUrl, name: 'Nikita Repin', status: 'online' },
    { name: 'Anya Murashova', status: 'away' },
    { name: 'Timur Ognev', status: 'busy' },
    { name: 'Vera Saltykova' },
    { name: 'Ilya Denisov' },
    { name: 'Mira Kovaleva' },
  ];
}
