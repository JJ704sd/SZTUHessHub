import type { ReactNode } from 'react';

export function Badge({ children, tone = 'blue' }: { children: ReactNode; tone?: 'blue' | 'teal' | 'amber' | 'muted' | 'dark' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function StatusBadge({ status, label }: { status: 'available' | 'degraded' | 'unverified' | 'unavailable'; label: string }) {
  return <span className={`status-badge status-${status}`}><span className="status-badge-dot" aria-hidden="true" />{label}</span>;
}
