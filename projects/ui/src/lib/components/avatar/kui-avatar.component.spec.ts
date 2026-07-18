import { Component } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { KuiAvatarComponent } from './kui-avatar.component';
import { KuiAvatarGroupComponent } from './kui-avatar-group.component';

@Component({
  imports: [KuiAvatarComponent],
  template: '<kui-avatar name="Nikita Repin" status="online" />',
})
class InitialsHost {}

@Component({
  imports: [KuiAvatarComponent],
  template: '<kui-avatar src="/broken.png" name="Nikita Repin" />',
})
class ImageHost {}

@Component({
  imports: [KuiAvatarComponent],
  template: '<kui-avatar loading name="Nikita Repin" />',
})
class LoadingHost {}

@Component({
  imports: [KuiAvatarGroupComponent],
  template: `
    <kui-avatar-group
      [avatars]="avatars"
      [max]="2"
      size="lg"
      shape="square"
      label="Project members"
    />
  `,
})
class GroupHost {
  protected readonly avatars = [
    { name: 'Nikita Repin', src: '/nikita.png' },
    { name: 'Anya Murashova' },
    { name: 'Timur Ognev' },
  ];
}

describe('KuiAvatarComponent', () => {
  it('renders initials with an accessible image role and status in the label', () => {
    const fixture = createFixture(InitialsHost);

    const avatar = fixture.nativeElement.querySelector('kui-avatar') as HTMLElement;

    expect(avatar.classList.contains('kui-avatar')).toBe(true);
    expect(avatar.getAttribute('role')).toBe('img');
    expect(avatar.getAttribute('aria-label')).toBe('Nikita Repin, online');
    expect(avatar.textContent?.trim()).toBe('NR');
    expect(avatar.querySelector('.kui-avatar__status')?.getAttribute('data-kui-status')).toBe(
      'online',
    );
  });

  it('falls back from a failed image to initials', () => {
    const fixture = createFixture(ImageHost);
    const avatar = fixture.nativeElement.querySelector('kui-avatar') as HTMLElement;
    const image = avatar.querySelector('img') as HTMLImageElement;

    image.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(avatar.querySelector('img')).toBeNull();
    expect(avatar.getAttribute('role')).toBe('img');
    expect(avatar.textContent?.trim()).toBe('NR');
  });

  it('hides content and accessibility label while loading', () => {
    const fixture = createFixture(LoadingHost);
    const avatar = fixture.nativeElement.querySelector('kui-avatar') as HTMLElement;

    expect(avatar.hasAttribute('data-kui-loading')).toBe(true);
    expect(avatar.getAttribute('role')).toBeNull();
    expect(avatar.getAttribute('aria-label')).toBeNull();
    expect(avatar.querySelector('.kui-avatar__skeleton.kui-skeleton')).not.toBeNull();
    expect(avatar.querySelector('.kui-avatar__skeleton')?.getAttribute('data-kui-shape')).toBe(
      'circle',
    );
  });
});

describe('KuiAvatarGroupComponent', () => {
  it('renders visible avatars and an overflow item', () => {
    const fixture = createFixture(GroupHost);

    const group = fixture.nativeElement.querySelector('kui-avatar-group') as HTMLElement;
    const avatars = group.querySelectorAll('kui-avatar');
    const overflow = group.querySelector('.kui-avatar--overflow') as HTMLElement;

    expect(group.getAttribute('role')).toBe('group');
    expect(group.getAttribute('aria-label')).toBe('Project members');
    expect(group.getAttribute('data-kui-size')).toBe('lg');
    expect(group.getAttribute('data-kui-shape')).toBe('square');
    expect(avatars.length).toBe(2);
    expect(overflow.textContent?.trim()).toBe('+1');
    expect(overflow.getAttribute('aria-label')).toBe('1 more');
  });
});

function createFixture<T>(component: new () => T): ComponentFixture<T> {
  TestBed.configureTestingModule({
    imports: [component],
  });

  const fixture = TestBed.createComponent(component);
  fixture.detectChanges();

  return fixture;
}
