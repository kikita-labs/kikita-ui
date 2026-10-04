import type { Type } from '@angular/core';
import { Component, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { KuiAvatar } from '../components/avatar/kui-avatar';
import { KuiAvatarGroup } from '../components/avatar/kui-avatar-group';
import type { KuiAvatarItem } from '../components/avatar/kui-avatar-item.interface';
import type { KuiAvatarShape } from '../components/avatar/kui-avatar-shape.type';
import type { KuiAvatarSize } from '../components/avatar/kui-avatar-size.type';
import type {
  KuiFileUploadMode,
  KuiFileUploadVariant,
} from '../components/file-upload/kui-file-upload';
import { KuiFileUpload } from '../components/file-upload/kui-file-upload';
import { KuiLink } from '../components/link/kui-link';
import type { KuiLinkTone } from '../components/link/kui-link-tone.type';
import type { KuiLinkUnderline } from '../components/link/kui-link-underline.type';
import { KuiOtpInput } from '../components/otp-input/kui-otp-input';
import type { KuiProgressColor, KuiProgressSize } from '../components/progress/kui-progress';
import { KuiProgress } from '../components/progress/kui-progress';
import { KuiSeparator } from '../components/separator/kui-separator';
import type { KuiSeparatorAppearance } from '../components/separator/kui-separator-appearance.type';
import type { KuiSeparatorOrientation } from '../components/separator/kui-separator-orientation.type';
import type { KuiSeparatorSpacing } from '../components/separator/kui-separator-spacing.type';
import { KuiSkeleton } from '../components/skeleton/kui-skeleton';
import type { KuiSkeletonAnimation } from '../components/skeleton/kui-skeleton-animation.type';
import type { KuiSkeletonShape } from '../components/skeleton/kui-skeleton-shape.type';
import { provideKikitaUi } from '../root';
import type { KuiSize } from '../types';
import { KuiDefaults } from './kui-defaults';
import type { KuiDefaultsLayer } from './kui-defaults.interface';

const ITEMS: readonly KuiAvatarItem[] = [
  { name: 'Ada Lovelace' },
  { name: 'Grace Hopper' },
  { name: 'Alan Turing' },
  { name: 'Linus Torvalds' },
  { name: 'Barbara Liskov' },
  { name: 'Ken Thompson' },
];

@Component({
  imports: [KuiAvatar],
  template: `<kui-avatar name="Ada Lovelace" [size]="size()" [shape]="shape()" />`,
})
class AvatarHost {
  readonly size = signal<KuiAvatarSize | undefined>(undefined);
  readonly shape = signal<KuiAvatarShape | undefined>(undefined);
}

@Component({
  imports: [KuiAvatarGroup],
  template: `<kui-avatar-group
    [avatars]="items"
    [size]="size()"
    [shape]="shape()"
    [max]="max()"
  />`,
})
class AvatarGroupHost {
  readonly items = ITEMS;
  readonly size = signal<KuiAvatarSize | undefined>(undefined);
  readonly shape = signal<KuiAvatarShape | undefined>(undefined);
  readonly max = signal<number | undefined>(undefined);
}

@Component({
  imports: [KuiLink],
  template: `<a kuiLink href="/x" [tone]="tone()" [underline]="underline()">Link</a>`,
})
class LinkHost {
  readonly tone = signal<KuiLinkTone | undefined>(undefined);
  readonly underline = signal<KuiLinkUnderline | undefined>(undefined);
}

@Component({
  imports: [KuiProgress],
  template: `<kui-progress [value]="40" [size]="size()" [color]="color()" />`,
})
class ProgressHost {
  readonly size = signal<KuiProgressSize | undefined>(undefined);
  readonly color = signal<KuiProgressColor | undefined>(undefined);
}

@Component({
  imports: [KuiSeparator],
  template: `<hr
    kuiSeparator
    [appearance]="appearance()"
    [orientation]="orientation()"
    [spacing]="spacing()"
  />`,
})
class SeparatorHost {
  readonly appearance = signal<KuiSeparatorAppearance | undefined>(undefined);
  readonly orientation = signal<KuiSeparatorOrientation | undefined>(undefined);
  readonly spacing = signal<KuiSeparatorSpacing | undefined>(undefined);
}

@Component({
  imports: [KuiSkeleton],
  template: `<div kuiSkeleton [shape]="shape()" [animation]="animation()"></div>`,
})
class SkeletonHost {
  readonly shape = signal<KuiSkeletonShape | undefined>(undefined);
  readonly animation = signal<KuiSkeletonAnimation | undefined>(undefined);
}

@Component({
  imports: [KuiFileUpload],
  template: `<kui-file-upload [size]="size()" [variant]="variant()" [mode]="mode()" />`,
})
class FileUploadHost {
  readonly size = signal<KuiSize | undefined>(undefined);
  readonly variant = signal<KuiFileUploadVariant | undefined>(undefined);
  readonly mode = signal<KuiFileUploadMode | undefined>(undefined);
}

@Component({
  imports: [KuiOtpInput],
  template: `<kui-otp-input
    [length]="4"
    [size]="size()"
    [mask]="mask()"
    [integerOnly]="integerOnly()"
  />`,
})
class OtpInputHost {
  readonly size = signal<KuiSize | undefined>(undefined);
  readonly mask = signal<boolean | undefined>(undefined);
  readonly integerOnly = signal<boolean | undefined>(undefined);
}

function render<T>(host: Type<T>, defaults?: KuiDefaultsLayer): ComponentFixture<T> {
  TestBed.configureTestingModule({
    providers: [provideKikitaUi(defaults ? { defaults } : undefined)],
  });

  const fixture = TestBed.createComponent(host);
  fixture.detectChanges();

  return fixture;
}

function el(fixture: ComponentFixture<unknown>, selector: string): HTMLElement {
  const found = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(selector);

  if (!found) throw new Error(`Missing element: ${selector}`);

  return found;
}

describe('component defaults: content components', () => {
  describe('avatar', () => {
    it('keeps the built-in size and shape without defaults', () => {
      const host = el(render(AvatarHost), 'kui-avatar');

      expect(host.getAttribute('data-kui-size')).toBe('md');
      expect(host.getAttribute('data-kui-shape')).toBe('circle');
    });

    it('applies configured size and shape', () => {
      const host = el(
        render(AvatarHost, { avatar: { size: 'xl', shape: 'square' } }),
        'kui-avatar',
      );

      expect(host.getAttribute('data-kui-size')).toBe('xl');
      expect(host.getAttribute('data-kui-shape')).toBe('square');
    });

    it('lets local inputs win over defaults', () => {
      const fixture = render(AvatarHost, { avatar: { size: 'xl', shape: 'square' } });
      fixture.componentInstance.size.set('sm');
      fixture.componentInstance.shape.set('circle');
      fixture.detectChanges();
      const host = el(fixture, 'kui-avatar');

      expect(host.getAttribute('data-kui-size')).toBe('sm');
      expect(host.getAttribute('data-kui-shape')).toBe('circle');
    });

    it('follows runtime default changes', () => {
      const fixture = render(AvatarHost);
      TestBed.inject(KuiDefaults).set('avatar', { size: 'lg', shape: 'square' });
      fixture.detectChanges();
      const host = el(fixture, 'kui-avatar');

      expect(host.getAttribute('data-kui-size')).toBe('lg');
      expect(host.getAttribute('data-kui-shape')).toBe('square');
    });
  });

  describe('avatar group', () => {
    function avatars(fixture: ComponentFixture<unknown>): HTMLElement[] {
      return Array.from(
        (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('kui-avatar'),
      );
    }

    it('keeps the built-in size, shape and max without defaults', () => {
      const fixture = render(AvatarGroupHost);
      const group = el(fixture, 'kui-avatar-group');

      expect(group.getAttribute('data-kui-size')).toBe('md');
      expect(group.getAttribute('data-kui-shape')).toBe('circle');
      expect(avatars(fixture).length).toBe(4);
      expect(el(fixture, '.kui-avatar--overflow').textContent?.trim()).toBe('+2');
    });

    it('applies configured size, shape and max, passing size and shape to the children', () => {
      const fixture = render(AvatarGroupHost, {
        avatarGroup: { size: 'lg', shape: 'square', max: 2 },
      });
      const group = el(fixture, 'kui-avatar-group');
      const children = avatars(fixture);

      expect(group.getAttribute('data-kui-size')).toBe('lg');
      expect(group.getAttribute('data-kui-shape')).toBe('square');
      expect(children.length).toBe(2);
      expect(children.every((child) => child.getAttribute('data-kui-size') === 'lg')).toBe(true);
      expect(children.every((child) => child.getAttribute('data-kui-shape') === 'square')).toBe(
        true,
      );
      expect(el(fixture, '.kui-avatar--overflow').textContent?.trim()).toBe('+4');
    });

    it('lets local inputs win over defaults', () => {
      const fixture = render(AvatarGroupHost, {
        avatarGroup: { size: 'lg', shape: 'square', max: 2 },
      });
      fixture.componentInstance.size.set('xs');
      fixture.componentInstance.shape.set('circle');
      fixture.componentInstance.max.set(3);
      fixture.detectChanges();
      const group = el(fixture, 'kui-avatar-group');

      expect(group.getAttribute('data-kui-size')).toBe('xs');
      expect(group.getAttribute('data-kui-shape')).toBe('circle');
      expect(avatars(fixture).length).toBe(3);
    });

    it('follows runtime default changes', () => {
      const fixture = render(AvatarGroupHost);
      TestBed.inject(KuiDefaults).set('avatarGroup', { size: 'sm', shape: 'square', max: 5 });
      fixture.detectChanges();
      const group = el(fixture, 'kui-avatar-group');

      expect(group.getAttribute('data-kui-size')).toBe('sm');
      expect(group.getAttribute('data-kui-shape')).toBe('square');
      expect(avatars(fixture).length).toBe(5);
    });
  });

  describe('link', () => {
    it('keeps the built-in tone and underline without defaults', () => {
      const link = el(render(LinkHost), 'a');

      expect(link.getAttribute('data-kui-tone')).toBe('primary');
      expect(link.getAttribute('data-kui-underline')).toBe('hover');
    });

    it('applies configured tone and underline', () => {
      const link = el(render(LinkHost, { link: { tone: 'danger', underline: 'always' } }), 'a');

      expect(link.getAttribute('data-kui-tone')).toBe('danger');
      expect(link.getAttribute('data-kui-underline')).toBe('always');
    });

    it('lets local inputs win over defaults', () => {
      const fixture = render(LinkHost, { link: { tone: 'danger', underline: 'always' } });
      fixture.componentInstance.tone.set('muted');
      fixture.componentInstance.underline.set('none');
      fixture.detectChanges();
      const link = el(fixture, 'a');

      expect(link.getAttribute('data-kui-tone')).toBe('muted');
      expect(link.getAttribute('data-kui-underline')).toBe('none');
    });

    it('follows runtime default changes', () => {
      const fixture = render(LinkHost);
      TestBed.inject(KuiDefaults).set('link', { tone: 'success', underline: 'none' });
      fixture.detectChanges();
      const link = el(fixture, 'a');

      expect(link.getAttribute('data-kui-tone')).toBe('success');
      expect(link.getAttribute('data-kui-underline')).toBe('none');
    });
  });

  describe('progress', () => {
    it('keeps the built-in size and color without defaults', () => {
      const host = el(render(ProgressHost), 'kui-progress');

      expect(host.getAttribute('data-kui-size')).toBe('md');
      expect(host.getAttribute('data-kui-color')).toBe('primary');
    });

    it('applies configured size and color', () => {
      const host = el(
        render(ProgressHost, { progress: { size: 'lg', color: 'success' } }),
        'kui-progress',
      );

      expect(host.getAttribute('data-kui-size')).toBe('lg');
      expect(host.getAttribute('data-kui-color')).toBe('success');
    });

    it('lets local inputs win over defaults', () => {
      const fixture = render(ProgressHost, { progress: { size: 'lg', color: 'success' } });
      fixture.componentInstance.size.set('xs');
      fixture.componentInstance.color.set('danger');
      fixture.detectChanges();
      const host = el(fixture, 'kui-progress');

      expect(host.getAttribute('data-kui-size')).toBe('xs');
      expect(host.getAttribute('data-kui-color')).toBe('danger');
    });

    it('follows runtime default changes', () => {
      const fixture = render(ProgressHost);
      TestBed.inject(KuiDefaults).set('progress', { size: 'sm', color: 'warning' });
      fixture.detectChanges();
      const host = el(fixture, 'kui-progress');

      expect(host.getAttribute('data-kui-size')).toBe('sm');
      expect(host.getAttribute('data-kui-color')).toBe('warning');
    });
  });

  describe('separator', () => {
    it('keeps the built-in appearance, orientation and spacing without defaults', () => {
      const hr = el(render(SeparatorHost), 'hr');

      expect(hr.getAttribute('data-kui-appearance')).toBe('default');
      expect(hr.getAttribute('data-kui-orientation')).toBe('horizontal');
      expect(hr.getAttribute('data-kui-spacing')).toBe('sm');
      expect(hr.hasAttribute('aria-orientation')).toBe(false);
    });

    it('applies configured values and derives aria-orientation from the effective orientation', () => {
      const hr = el(
        render(SeparatorHost, {
          separator: { appearance: 'strong', orientation: 'vertical', spacing: 'lg' },
        }),
        'hr',
      );

      expect(hr.getAttribute('data-kui-appearance')).toBe('strong');
      expect(hr.getAttribute('data-kui-orientation')).toBe('vertical');
      expect(hr.getAttribute('data-kui-spacing')).toBe('lg');
      expect(hr.getAttribute('aria-orientation')).toBe('vertical');
    });

    it('lets local inputs win over defaults', () => {
      const fixture = render(SeparatorHost, {
        separator: { appearance: 'strong', orientation: 'vertical', spacing: 'lg' },
      });
      fixture.componentInstance.appearance.set('subtle');
      fixture.componentInstance.orientation.set('horizontal');
      fixture.componentInstance.spacing.set('none');
      fixture.detectChanges();
      const hr = el(fixture, 'hr');

      expect(hr.getAttribute('data-kui-appearance')).toBe('subtle');
      expect(hr.getAttribute('data-kui-orientation')).toBe('horizontal');
      expect(hr.getAttribute('data-kui-spacing')).toBe('none');
      expect(hr.hasAttribute('aria-orientation')).toBe(false);
    });

    it('follows runtime default changes', () => {
      const fixture = render(SeparatorHost);
      TestBed.inject(KuiDefaults).set('separator', {
        appearance: 'subtle',
        orientation: 'vertical',
        spacing: 'md',
      });
      fixture.detectChanges();
      const hr = el(fixture, 'hr');

      expect(hr.getAttribute('data-kui-appearance')).toBe('subtle');
      expect(hr.getAttribute('data-kui-orientation')).toBe('vertical');
      expect(hr.getAttribute('data-kui-spacing')).toBe('md');
      expect(hr.getAttribute('aria-orientation')).toBe('vertical');
    });
  });

  describe('skeleton', () => {
    it('keeps the built-in shape and animation without defaults', () => {
      const node = el(render(SkeletonHost), '[kuiSkeleton]');

      expect(node.getAttribute('data-kui-shape')).toBe('rect');
      expect(node.getAttribute('data-kui-animation')).toBe('shimmer');
    });

    it('applies configured shape and animation', () => {
      const node = el(
        render(SkeletonHost, { skeleton: { shape: 'circle', animation: 'pulse' } }),
        '[kuiSkeleton]',
      );

      expect(node.getAttribute('data-kui-shape')).toBe('circle');
      expect(node.getAttribute('data-kui-animation')).toBe('pulse');
    });

    it('lets local inputs win over defaults', () => {
      const fixture = render(SkeletonHost, { skeleton: { shape: 'circle', animation: 'pulse' } });
      fixture.componentInstance.shape.set('text');
      fixture.componentInstance.animation.set('none');
      fixture.detectChanges();
      const node = el(fixture, '[kuiSkeleton]');

      expect(node.getAttribute('data-kui-shape')).toBe('text');
      expect(node.getAttribute('data-kui-animation')).toBe('none');
    });

    it('follows runtime default changes', () => {
      const fixture = render(SkeletonHost);
      TestBed.inject(KuiDefaults).set('skeleton', { shape: 'badge', animation: 'none' });
      fixture.detectChanges();
      const node = el(fixture, '[kuiSkeleton]');

      expect(node.getAttribute('data-kui-shape')).toBe('badge');
      expect(node.getAttribute('data-kui-animation')).toBe('none');
    });
  });

  describe('file upload', () => {
    it('keeps the built-in size, variant and mode without defaults', () => {
      const fixture = render(FileUploadHost);
      const host = el(fixture, 'kui-file-upload');

      expect(host.getAttribute('data-kui-size')).toBe('md');
      expect(host.getAttribute('data-kui-variant')).toBe('dropzone');
      expect(fixture.nativeElement.querySelector('.kui-file-upload-dropzone')).not.toBeNull();
      expect(el(fixture, 'input[type="file"]').hasAttribute('multiple')).toBe(true);
    });

    it('applies configured size, variant and mode', () => {
      const fixture = render(FileUploadHost, {
        fileUpload: { size: 'lg', variant: 'compact', mode: 'single' },
      });
      const host = el(fixture, 'kui-file-upload');

      expect(host.getAttribute('data-kui-size')).toBe('lg');
      expect(host.getAttribute('data-kui-variant')).toBe('compact');
      expect(fixture.nativeElement.querySelector('.kui-file-upload-dropzone')).toBeNull();
      expect(el(fixture, 'input[type="file"]').hasAttribute('multiple')).toBe(false);
    });

    it('lets local inputs win over defaults', () => {
      const fixture = render(FileUploadHost, {
        fileUpload: { size: 'lg', variant: 'compact', mode: 'single' },
      });
      fixture.componentInstance.size.set('sm');
      fixture.componentInstance.variant.set('dropzone');
      fixture.componentInstance.mode.set('multiple');
      fixture.detectChanges();
      const host = el(fixture, 'kui-file-upload');

      expect(host.getAttribute('data-kui-size')).toBe('sm');
      expect(host.getAttribute('data-kui-variant')).toBe('dropzone');
      expect(fixture.nativeElement.querySelector('.kui-file-upload-dropzone')).not.toBeNull();
      expect(el(fixture, 'input[type="file"]').hasAttribute('multiple')).toBe(true);
    });

    it('follows runtime default changes', () => {
      const fixture = render(FileUploadHost);
      TestBed.inject(KuiDefaults).set('fileUpload', {
        size: 'sm',
        variant: 'compact',
        mode: 'single',
      });
      fixture.detectChanges();
      const host = el(fixture, 'kui-file-upload');

      expect(host.getAttribute('data-kui-size')).toBe('sm');
      expect(host.getAttribute('data-kui-variant')).toBe('compact');
      expect(el(fixture, 'input[type="file"]').hasAttribute('multiple')).toBe(false);
    });
  });

  describe('otp input', () => {
    function cells(fixture: ComponentFixture<unknown>): HTMLInputElement[] {
      return Array.from(
        (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLInputElement>(
          '.kui-otp-input__cell',
        ),
      );
    }

    it('keeps the built-in size, mask and integer-only behavior without defaults', () => {
      const fixture = render(OtpInputHost);
      const host = el(fixture, 'kui-otp-input');

      expect(host.getAttribute('data-kui-size')).toBe('md');
      expect(host.hasAttribute('data-kui-alpha')).toBe(false);
      expect(cells(fixture).length).toBe(4);
      expect(cells(fixture).every((cell) => cell.type === 'text')).toBe(true);
      expect(cells(fixture).every((cell) => cell.getAttribute('inputmode') === 'numeric')).toBe(
        true,
      );
    });

    it('applies configured size, mask and integerOnly', () => {
      const fixture = render(OtpInputHost, {
        otpInput: { size: 'lg', mask: true, integerOnly: false },
      });
      const host = el(fixture, 'kui-otp-input');

      expect(host.getAttribute('data-kui-size')).toBe('lg');
      expect(host.hasAttribute('data-kui-alpha')).toBe(true);
      expect(cells(fixture).every((cell) => cell.type === 'password')).toBe(true);
      expect(cells(fixture).every((cell) => cell.getAttribute('inputmode') === 'text')).toBe(true);
    });

    it('lets local inputs win over defaults', () => {
      const fixture = render(OtpInputHost, {
        otpInput: { size: 'lg', mask: true, integerOnly: false },
      });
      fixture.componentInstance.size.set('sm');
      fixture.componentInstance.mask.set(false);
      fixture.componentInstance.integerOnly.set(true);
      fixture.detectChanges();
      const host = el(fixture, 'kui-otp-input');

      expect(host.getAttribute('data-kui-size')).toBe('sm');
      expect(host.hasAttribute('data-kui-alpha')).toBe(false);
      expect(cells(fixture).every((cell) => cell.type === 'text')).toBe(true);
    });

    it('follows runtime default changes', () => {
      const fixture = render(OtpInputHost);
      TestBed.inject(KuiDefaults).set('otpInput', { size: 'sm', mask: true, integerOnly: false });
      fixture.detectChanges();
      const host = el(fixture, 'kui-otp-input');

      expect(host.getAttribute('data-kui-size')).toBe('sm');
      expect(host.hasAttribute('data-kui-alpha')).toBe(true);
      expect(cells(fixture).every((cell) => cell.type === 'password')).toBe(true);
    });
  });
});
