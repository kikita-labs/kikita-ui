import type { KuiCommandGroup } from '@kikita-labs/ui';

/** Creates localized command groups used by the page's live palette scenarios. */
export function createCommandGroups(
  translate: (key: string) => string,
): readonly KuiCommandGroup[] {
  return [
    {
      heading: translate('groups.navigation'),
      items: [
        {
          id: 'projects',
          label: translate('commands.projects'),
          description: translate('descriptions.projects'),
          shortcut: ['G', 'P'],
          keywords: [translate('keywords.workspace')],
        },
        {
          id: 'components',
          label: translate('commands.components'),
          description: translate('descriptions.components'),
          shortcut: ['G', 'C'],
          keywords: [translate('keywords.library')],
        },
      ],
    },
    {
      heading: translate('groups.actions'),
      items: [
        {
          id: 'create-task',
          label: translate('commands.createTask'),
          badge: translate('badges.new'),
          shortcut: ['C'],
          icon: '+',
        },
        {
          id: 'export',
          label: translate('commands.export'),
          meta: translate('meta.unavailable'),
          disabled: true,
        },
        {
          id: 'delete',
          label: translate('commands.delete'),
          danger: true,
          keywords: [translate('keywords.remove')],
        },
      ],
    },
  ];
}
