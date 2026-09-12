import { isPlatformBrowser } from '@angular/common';
import {
  booleanAttribute,
  type ComponentRef,
  computed,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  PLATFORM_ID,
  Renderer2,
  ViewContainerRef,
} from '@angular/core';

import { KuiIconComponent, type KuiIconName } from '../icon';
import { KuiTextDirective } from '../typography';
import { KuiLinkExternalIconComponent } from './kui-link-external-icon.component';
import type { KuiLinkTone } from './kui-link-tone.type';
import type { KuiLinkUnderline } from './kui-link-underline.type';

type KuiLinkEndSlot =
  | { readonly kind: 'icon'; readonly ref: ComponentRef<KuiIconComponent> }
  | { readonly kind: 'external'; readonly ref: ComponentRef<KuiLinkExternalIconComponent> };

/**
 * Applies Kikita UI interactive link styling and behavior to a native `<a>` (real navigation) or
 * `<button type="button">` (JS-driven action with no navigation -- MUI's a11y guidance: a link
 * with no real `href` should render as a button, not an anchor).
 *
 * Composes `[kuiText]` as a host directive, exposing only its `variant` input for typography.
 * `[kuiText]`'s own `tone` is not exposed -- `tone` belongs to `[kuiLink]` alone. See `docs/link.md`
 * for the full rationale and usage examples.
 */
@Directive({
  selector: 'a[kuiLink], button[kuiLink]',
  hostDirectives: [{ directive: KuiTextDirective, inputs: ['variant'] }],
  host: {
    class: 'kui-link',
    '[attr.data-kui-tone]': 'tone()',
    '[attr.data-kui-underline]': 'underline()',
    '[attr.target]': 'target()',
    '[attr.rel]': 'effectiveRel()',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '[attr.tabindex]': 'disabled() ? "-1" : null',
    '[attr.disabled]': 'nativeDisabledAttribute()',
    '(click)': 'handleClick($event)',
  },
})
export class KuiLinkDirective {
  /** Semantic color intent. Unaffected by hover/focus/active -- only underline thickness and the
   * focus ring change between those states and rest. */
  readonly tone = input<KuiLinkTone>('primary');

  /** Underline behavior. Use `always` for a link inside a paragraph of body text, since color
   * alone is not a sufficient signal. */
  readonly underline = input<KuiLinkUnderline>('hover');

  /** Decorative icon rendered before the link's projected content. */
  readonly iconStart = input<KuiIconName | undefined>();

  /** Decorative icon rendered after the link's projected content. When `external` resolves to
   * `true` and this is unset, the library's own static external-link chrome glyph takes the slot
   * instead (see `KuiLinkExternalIconComponent`) -- not the async, name-resolved `kui-icon`. */
  readonly iconEnd = input<KuiIconName | undefined>();

  /** Native anchor `target`, reflected onto the host and used to auto-detect `external`. */
  readonly target = input<string | undefined>();

  /** Native anchor `rel`. Merged with `noopener noreferrer` when `external` resolves to `true`. */
  readonly rel = input<string | undefined>();

  /** Marks the link as leaving the app. Defaults to `target() === '_blank'` when unset. Adds
   * `rel="noopener noreferrer"`, the static external-link chrome glyph (unless `iconEnd` is set),
   * and a visually-hidden "(opens in a new tab)" suffix in the accessible name. */
  readonly external = input<boolean | undefined>();

  /** Disables the link: `aria-disabled` + removed from tab order + blocked click. `<a>` has no
   * native `disabled` attribute, so this is the same convention `[kuiButton]` already applies for
   * `as="a"`; a host `<button>` also gets the native `disabled` attribute. */
  readonly disabled = input(false, { transform: booleanAttribute });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly renderer = inject(Renderer2);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private iconStartRef: ComponentRef<KuiIconComponent> | null = null;
  private endSlot: KuiLinkEndSlot | null = null;
  private externalHintEl: HTMLElement | null = null;

  protected readonly isExternal = computed(() => this.external() ?? this.target() === '_blank');

  protected readonly effectiveRel = computed(() => {
    const custom = this.rel()?.trim();

    if (!this.isExternal()) {
      return custom || null;
    }

    const tokens = new Set(custom ? custom.split(/\s+/) : []);
    tokens.add('noopener');
    tokens.add('noreferrer');

    return Array.from(tokens).join(' ');
  });

  protected readonly nativeDisabledAttribute = computed(() =>
    this.disabled() && this.host.tagName.toLowerCase() === 'button' ? '' : null,
  );

  constructor() {
    // See KuiButtonDirective for why icon/hint DOM mutation is skipped during SSR: it would
    // insert markup the client's hydration pass does not expect and crash it. The client
    // inserts once hydrated instead.
    if (!this.isBrowser) {
      return;
    }

    effect(() => {
      this.iconStartRef = this.syncStartIcon(this.iconStart(), this.iconStartRef);
    });

    effect(() => {
      this.syncEndSlot(this.iconEnd(), this.isExternal());
    });

    effect(() => {
      this.syncExternalHint(this.isExternal());
    });
  }

  protected handleClick(event: Event): void {
    if (!this.disabled()) {
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();
  }

  private syncStartIcon(
    name: KuiIconName | undefined,
    existing: ComponentRef<KuiIconComponent> | null,
  ): ComponentRef<KuiIconComponent> | null {
    if (!name) {
      existing?.destroy();
      return null;
    }

    if (existing) {
      existing.setInput('name', name);
      return existing;
    }

    const created = this.viewContainerRef.createComponent(KuiIconComponent);
    created.setInput('name', name);
    this.renderer.addClass(created.location.nativeElement, 'kui-link__icon-start');
    this.renderer.insertBefore(this.host, created.location.nativeElement, this.host.firstChild);

    return created;
  }

  /**
   * The end slot holds either a consumer-chosen `kui-icon` (`iconEnd`) or, when `external`
   * resolves to `true` and `iconEnd` is unset, the library's own static external-link chrome
   * glyph (`KuiLinkExternalIconComponent`) -- never both. Rebuilds the slot only when which kind
   * it should hold changes; an icon *name* change while already showing an icon just updates the
   * existing component's input.
   */
  private syncEndSlot(iconEnd: KuiIconName | undefined, isExternal: boolean): void {
    const wantedKind = iconEnd ? 'icon' : isExternal ? 'external' : null;

    if (this.endSlot && this.endSlot.kind !== wantedKind) {
      this.endSlot.ref.destroy();
      this.endSlot = null;
    }

    if (wantedKind === null) {
      return;
    }

    if (wantedKind === 'icon') {
      if (this.endSlot) {
        this.endSlot.ref.setInput('name', iconEnd);
        return;
      }

      const ref = this.viewContainerRef.createComponent(KuiIconComponent);
      ref.setInput('name', iconEnd);
      this.renderer.addClass(ref.location.nativeElement, 'kui-link__icon-end');
      this.renderer.appendChild(this.host, ref.location.nativeElement);
      this.endSlot = { kind: 'icon', ref };
      return;
    }

    if (!this.endSlot) {
      const ref = this.viewContainerRef.createComponent(KuiLinkExternalIconComponent);
      this.renderer.appendChild(this.host, ref.location.nativeElement);
      this.endSlot = { kind: 'external', ref };
    }
  }

  private syncExternalHint(isExternal: boolean): void {
    if (!isExternal) {
      if (this.externalHintEl) {
        this.renderer.removeChild(this.host, this.externalHintEl);
        this.externalHintEl = null;
      }

      return;
    }

    if (this.externalHintEl) {
      return;
    }

    this.externalHintEl = this.renderer.createElement('span');
    this.renderer.addClass(this.externalHintEl, 'kui-link__sr-only');
    this.renderer.appendChild(
      this.externalHintEl,
      this.renderer.createText(' (opens in a new tab)'),
    );
    this.renderer.appendChild(this.host, this.externalHintEl);
  }
}
