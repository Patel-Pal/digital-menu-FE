import type { TableData } from '@/services/orderService';
import type { TableFilterType } from '@/types';

/**
 * Returns true if a table still needs attention (has active orders or unpaid bill).
 * Tables with a paid bill and no active orders are considered settled.
 */
function isTableActive(t: TableData): boolean {
  const hasActiveOrder = t.orders.some((o) => o.status === 'pending' || o.status === 'approved');
  const hasUnbilledCompleted = t.orders.some((o) => o.status === 'completed' && o.billingStatus === 'unbilled');
  const hasUnpaidBill = t.bill != null && t.bill.paymentStatus !== 'paid';
  return hasActiveOrder || hasUnbilledCompleted || hasUnpaidBill;
}

/**
 * Filters tables by order status category.
 * All filters exclude tables where the bill is fully paid and no active orders remain.
 * - 'all': returns all active tables
 * - 'pending': tables with at least one pending order
 * - 'approved': tables with at least one approved order
 */
export function filterTables(tables: TableData[], filter: TableFilterType): TableData[] {
  const active = tables.filter(isTableActive);
  switch (filter) {
    case 'pending':
      return active.filter((t) => t.orders.some((o) => o.status === 'pending'));
    case 'approved':
      return active.filter((t) => t.orders.some((o) => o.status === 'approved'));
    default:
      return active;
  }
}

/**
 * Searches tables by table number or customer name (case-insensitive).
 * Returns all tables if query is empty or whitespace-only.
 */
export function searchTables(tables: TableData[], query: string): TableData[] {
  if (!query.trim()) return tables;
  const q = query.toLowerCase();
  return tables.filter(
    (t) =>
      t.tableNumber.toLowerCase().includes(q) ||
      t.customerName.toLowerCase().includes(q),
  );
}

/** Formats elapsed time from an ISO timestamp to a human-readable string. */
export function getElapsedTime(t: string): string {
  const m = Math.floor((Date.now() - new Date(t).getTime()) / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return m % 60 > 0 ? `${h}h ${m % 60}m` : `${h}h`;
}

/** Returns the card accent border class based on table state priority. */
export function getCardAccent(table: TableData): string {
  if (table.orders.some((o) => o.status === 'pending')) return 'border-l-amber-500';
  if (table.orders.some((o) => o.status === 'approved')) return 'border-l-blue-500';
  if (table.orders.some((o) => o.status === 'completed' && o.billingStatus === 'unbilled')) return 'border-l-emerald-500';
  if (table.bill?.paymentStatus === 'pending') return 'border-l-purple-500';
  return 'border-l-gray-300';
}

/** Returns the status tag label and CSS class based on table state priority. */
export function getStatusTag(table: TableData): { label: string; cls: string } {
  if (table.orders.some((o) => o.status === 'pending'))
    return { label: 'New Orders', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' };
  if (table.orders.some((o) => o.status === 'approved'))
    return { label: 'In Progress', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' };
  if (table.orders.some((o) => o.status === 'completed' && o.billingStatus === 'unbilled'))
    return { label: 'Ready to Bill', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' };
  if (table.bill?.paymentStatus === 'pending')
    return { label: 'Awaiting Payment', cls: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400' };
  return { label: 'Active', cls: 'bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400' };
}
