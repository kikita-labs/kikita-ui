/** Fixed translated content passed to a page-owned Dialog example. */
export interface DialogExampleData {
  readonly title: string | null;
  readonly body: string;
  readonly bodyLines: readonly string[];
  readonly showIcon: boolean;
  readonly cancelLabel: string;
  readonly confirmLabel: string;
}

/** Results returned by the page-owned Dialog actions. */
export type DialogExampleResult = 'cancelled' | 'saved';
