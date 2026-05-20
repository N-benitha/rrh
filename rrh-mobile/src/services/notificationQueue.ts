// Simple module-level queue so App.tsx can push alerts
// that AlertsScreen drains when it focuses.

import type { AlertItem } from "../screens/AlertsScreen";

const _queue: AlertItem[] = [];

export function enqueue(items: AlertItem[]) {
  _queue.unshift(...items); // newest first
}

export function drainQueue(): AlertItem[] {
  return _queue.splice(0, _queue.length);
}
