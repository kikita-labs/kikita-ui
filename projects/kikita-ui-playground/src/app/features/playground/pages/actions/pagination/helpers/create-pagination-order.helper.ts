import { PAGINATION_ORDER_CUSTOMER_KEYS, PAGINATION_ORDER_STATUS_KEYS } from '../constants';
import type { PaginationOrder } from '../interfaces';

/** Builds the deterministic order at a zero-based position in the generated list. */
export function createPaginationOrder(index: number): PaginationOrder {
  return {
    id: `order-${index}`,
    number: 1001 + index,
    customerKey: PAGINATION_ORDER_CUSTOMER_KEYS[index % PAGINATION_ORDER_CUSTOMER_KEYS.length],
    statusKey: PAGINATION_ORDER_STATUS_KEYS[index % PAGINATION_ORDER_STATUS_KEYS.length],
  };
}
