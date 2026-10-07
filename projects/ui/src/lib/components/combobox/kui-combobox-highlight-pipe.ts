import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';

/** Text segment rendered by `kuiComboboxHighlight`. */
export interface KuiComboboxHighlightSegment {
  /** Segment text. */
  readonly text: string;
  /** Whether this segment matches the search query. */
  readonly match: boolean;
}

/**
 * Splits option labels into plain and matched text segments for combobox option highlighting.
 *
 * @example
 * ```html
 * <span class="kui-combobox-match-label">
 *   @for (segment of label | kuiComboboxHighlight: query; track $index) {
 *     @if (segment.match) {
 *       <mark class="kui-combobox-highlight">{{ segment.text }}</mark>
 *     } @else {
 *       <span>{{ segment.text }}</span>
 *     }
 *   }
 * </span>
 * ```
 */
@Pipe({ name: 'kuiComboboxHighlight' })
export class KuiComboboxHighlightPipe implements PipeTransform {
  transform(
    label: string,
    query: string | null | undefined,
  ): readonly KuiComboboxHighlightSegment[] {
    const needle = query?.trim();

    if (!needle) return [{ text: label, match: false }];

    const normalizedLabel = label.toLocaleLowerCase();
    const normalizedNeedle = needle.toLocaleLowerCase();
    const segments: KuiComboboxHighlightSegment[] = [];
    let cursor = 0;

    while (cursor < label.length) {
      const index = normalizedLabel.indexOf(normalizedNeedle, cursor);

      if (index < 0) {
        segments.push({ text: label.slice(cursor), match: false });
        break;
      }

      if (index > cursor) {
        segments.push({ text: label.slice(cursor, index), match: false });
      }

      const end = index + normalizedNeedle.length;
      segments.push({ text: label.slice(index, end), match: true });
      cursor = end;
    }

    return segments.length ? segments : [{ text: label, match: false }];
  }
}
