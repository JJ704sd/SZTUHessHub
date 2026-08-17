'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';

export function TaskAreaViewed() {
  useEffect(() => { trackEvent({ name: 'task_area_viewed', surface: 'home', sessionId: 'anonymous' }); }, []);
  return null;
}
