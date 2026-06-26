import { Component, ViewEncapsulation, signal } from '@angular/core';

import { KuiButtonDirective, KuiToastPosition, kuiToast } from '@kikita-labs/ui';

import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

@Component({
  selector: 'app-toast-page',
  templateUrl: './toast.page.html',
  styleUrl: './toast.page.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [KuiButtonDirective, PlaygroundPanelComponent],
})
export class ToastPage {
  private readonly toast = kuiToast();

  protected readonly position = signal<KuiToastPosition>('bottom-center');

  protected readonly positions: KuiToastPosition[] = [
    'top-start',
    'top-center',
    'top-end',
    'bottom-start',
    'bottom-center',
    'bottom-end',
  ];

  protected setPosition(p: KuiToastPosition): void {
    this.position.set(p);
    this.toast.setPosition(p);
  }

  protected openSuccess(): void {
    this.toast.open({
      title: 'Файл сохранён',
      message: 'Изменения применены к проекту',
      appearance: 'success',
      actionLabel: 'Отменить',
      showProgress: true,
    });
  }

  protected openDanger(): void {
    this.toast.open({
      title: 'Не удалось загрузить файл',
      message: 'Попробуйте ещё раз.',
      appearance: 'danger',
      persistent: true,
    });
  }

  protected openWarning(): void {
    this.toast.open({
      title: 'Сессия истекает',
      message: 'Через 2 минуты вы будете выведены',
      appearance: 'warning',
      persistent: true,
    });
  }

  protected openInfo(): void {
    this.toast.open({
      title: 'Доступна новая версия',
      message: 'Перезайдите для применения обновления',
      appearance: 'info',
      actionLabel: 'Обновить',
      duration: 8000,
    });
  }

  protected openNeutral(): void {
    this.toast.open({
      title: 'Письмо удалено',
      actionLabel: 'Отменить',
      duration: 6000,
    });
  }

  protected openTitleOnly(): void {
    this.toast.open({ title: 'Настройки сохранены' });
  }

  protected openWithProgress(): void {
    this.toast.open({
      title: 'Удаление через 5 секунд',
      appearance: 'danger',
      showProgress: true,
      duration: 5000,
    });
  }
}
