/** A deterministic Playground row with translated display fields and a stable email sort value. */
export interface TableMember {
  readonly id: string;
  readonly email: string;
  readonly nameKey: string;
  readonly roleKey: string;
  readonly departmentKey: string;
  readonly statusKey: string;
  readonly statusRank: number;
  readonly score: number;
}
