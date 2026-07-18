import { Component } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { KuiBreadcrumbItemDirective } from './kui-breadcrumb-item.directive';
import { KuiBreadcrumbSeparatorComponent } from './kui-breadcrumb-separator.component';
import { KuiBreadcrumbsDirective } from './kui-breadcrumbs.directive';

@Component({
  imports: [KuiBreadcrumbsDirective, KuiBreadcrumbItemDirective, KuiBreadcrumbSeparatorComponent],
  template: `
    <nav aria-label="Breadcrumb">
      <ol kuiBreadcrumbs size="sm">
        <li><a kuiBreadcrumbItem href="/components">Components</a></li>
        <li kuiBreadcrumbSeparator></li>
        <li><a kuiBreadcrumbItem href="/components/actions">Actions</a></li>
        <li kuiBreadcrumbSeparator></li>
        <li><span kuiBreadcrumbItem current>Icon Button</span></li>
      </ol>
    </nav>
  `,
})
class BreadcrumbsHost {}

@Component({
  imports: [KuiBreadcrumbsDirective, KuiBreadcrumbItemDirective],
  template: `
    <ol kuiBreadcrumbs>
      <li><a kuiBreadcrumbItem href="/catalog">Catalog</a></li>
      <li><span kuiBreadcrumbItem>Electronics</span></li>
      <li><span kuiBreadcrumbItem current>Headphones</span></li>
    </ol>
  `,
})
class PlainCrumbHost {}

describe('KuiBreadcrumbsDirective', () => {
  function createFixture<T>(component: new () => T): ComponentFixture<T> {
    TestBed.configureTestingModule({ imports: [component] });
    const fixture = TestBed.createComponent(component);
    fixture.detectChanges();
    return fixture;
  }

  it('applies list role and size attribute to the host', () => {
    const fixture = createFixture(BreadcrumbsHost);
    const ol = fixture.nativeElement.querySelector('ol') as HTMLOListElement;

    expect(ol.classList.contains('kui-breadcrumbs')).toBe(true);
    expect(ol.getAttribute('role')).toBe('list');
    expect(ol.getAttribute('data-kui-size')).toBe('sm');
  });

  it('renders links as kui-breadcrumb-link without aria-current', () => {
    const fixture = createFixture(BreadcrumbsHost);
    const links = fixture.nativeElement.querySelectorAll('a') as NodeListOf<HTMLAnchorElement>;

    expect(links.length).toBe(2);
    links.forEach((link) => {
      expect(link.classList.contains('kui-breadcrumb-link')).toBe(true);
      expect(link.hasAttribute('aria-current')).toBe(false);
    });
  });

  it('marks the current crumb with aria-current="page" and no href', () => {
    const fixture = createFixture(BreadcrumbsHost);
    const current = fixture.nativeElement.querySelector('span') as HTMLSpanElement;

    expect(current.classList.contains('kui-breadcrumb-current')).toBe(true);
    expect(current.getAttribute('aria-current')).toBe('page');
  });

  it('renders separators as decorative, aria-hidden list items', () => {
    const fixture = createFixture(BreadcrumbsHost);
    const seps = fixture.nativeElement.querySelectorAll(
      '.kui-breadcrumb-sep',
    ) as NodeListOf<HTMLElement>;

    expect(seps.length).toBe(2);
    seps.forEach((sep) => {
      expect(sep.tagName).toBe('LI');
      expect(sep.getAttribute('aria-hidden')).toBe('true');
      expect(sep.querySelector('svg')).not.toBeNull();
    });
  });

  it('renders a non-current, non-link span as kui-breadcrumb-plain', () => {
    const fixture = createFixture(PlainCrumbHost);
    const spans = fixture.nativeElement.querySelectorAll('span') as NodeListOf<HTMLSpanElement>;

    expect(spans[0].classList.contains('kui-breadcrumb-plain')).toBe(true);
    expect(spans[0].hasAttribute('aria-current')).toBe(false);
    expect(spans[1].classList.contains('kui-breadcrumb-current')).toBe(true);
  });
});
