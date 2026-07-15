import { Component, ViewEncapsulation } from '@angular/core';

import { KuiTextDirective } from '@kikita-labs/ui';

import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

interface TypeRoleRow {
  readonly role: string;
  readonly className: string;
  readonly element: string;
  readonly sample: string;
  readonly size: string;
  readonly lineHeight: string;
  readonly weight: string;
  readonly usage: string;
}

interface ToneRow {
  readonly label: string;
  readonly className: string;
}

@Component({
  selector: 'app-typography-page',
  imports: [PlaygroundPanelComponent, KuiTextDirective],
  templateUrl: './typography.page.html',
  styleUrl: './typography.page.scss',
  encapsulation: ViewEncapsulation.None,
})
export class TypographyPage {
  protected readonly roles: readonly TypeRoleRow[] = [
    {
      role: 'display',
      className: 'kui-display',
      element: 'h1',
      sample: 'Settings & Preferences',
      size: '36px',
      lineHeight: '1.15',
      weight: '700',
      usage: 'Rare docs/spec page title.',
    },
    {
      role: 'heading-lg',
      className: 'kui-heading-lg',
      element: 'h1 / h2',
      sample: 'Workspace overview',
      size: '28px',
      lineHeight: '1.2',
      weight: '700',
      usage: 'Main page or top-level section title.',
    },
    {
      role: 'heading-md',
      className: 'kui-heading-md',
      element: 'h2 / h3',
      sample: 'Edit team member',
      size: '22px',
      lineHeight: '1.25',
      weight: '600',
      usage: 'Panel, dialog, or drawer title.',
    },
    {
      role: 'heading-sm',
      className: 'kui-heading-sm',
      element: 'h3 / h4',
      sample: 'Billing history',
      size: '18px',
      lineHeight: '1.3',
      weight: '600',
      usage: 'Compact section, card, or table group title.',
    },
    {
      role: 'title',
      className: 'kui-title',
      element: 'h4 / span',
      sample: 'Notification preferences',
      size: '14px',
      lineHeight: '1.4',
      weight: '600',
      usage: 'Small emphasized UI title.',
    },
    {
      role: 'body-lg',
      className: 'kui-body-lg',
      element: 'p',
      sample: 'Relaxed paragraph text for spacious areas.',
      size: '15px',
      lineHeight: '1.6',
      weight: '400',
      usage: 'Empty states, dialogs, and calm reading areas.',
    },
    {
      role: 'body',
      className: 'kui-body',
      element: 'p',
      sample: 'Default product UI body text.',
      size: '14px',
      lineHeight: '1.5',
      weight: '400',
      usage: 'Default readable product UI copy.',
    },
    {
      role: 'body-sm',
      className: 'kui-body-sm',
      element: 'p / span',
      sample: 'Dense UI text and compact descriptions.',
      size: '13px',
      lineHeight: '1.5',
      weight: '400',
      usage: 'Dense descriptions and table adjunct text.',
    },
    {
      role: 'caption',
      className: 'kui-caption',
      element: 'small / span',
      sample: 'Hint, metadata, timestamp - 2 minutes ago',
      size: '11px',
      lineHeight: '1.5',
      weight: '400',
      usage: 'Hints, metadata, helper text, timestamps.',
    },
    {
      role: 'overline',
      className: 'kui-overline',
      element: 'span',
      sample: 'Section label',
      size: '9px',
      lineHeight: '1.4',
      weight: '600',
      usage: 'Optional uppercase group label. Use sparingly.',
    },
    {
      role: 'code',
      className: 'kui-code',
      element: 'code / span',
      sample: 'userId.slug',
      size: '13px',
      lineHeight: '1.5',
      weight: '400',
      usage: 'Inline monospace code and token text.',
    },
  ];

  protected readonly tones: readonly ToneRow[] = [
    { label: 'Default text', className: 'kui-text-default' },
    { label: 'Muted text', className: 'kui-text-muted' },
    { label: 'Disabled text', className: 'kui-text-disabled' },
    { label: 'Primary text', className: 'kui-text-primary' },
    { label: 'Success text', className: 'kui-text-success' },
    { label: 'Warning text', className: 'kui-text-warning' },
    { label: 'Danger text', className: 'kui-text-danger' },
  ];
}
