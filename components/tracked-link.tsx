'use client';

import Link, { type LinkProps } from 'next/link';
import type { ReactNode } from 'react';
import { trackEvent, type AnalyticsEvent } from '@/lib/analytics';

type Props = LinkProps & { children: ReactNode; className?: string; event?: AnalyticsEvent; target?: string; rel?: string; 'aria-label'?: string };

export function TrackedLink({ event, children, ...props }: Props) {
  return <Link {...props} onClick={() => { if (event) trackEvent(event); }}>{children}</Link>;
}
