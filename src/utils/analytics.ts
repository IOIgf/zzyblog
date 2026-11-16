// This site does not collect analytics. The helper stays as a no-op so UI
// components can keep their semantic event markers without a tracking backend.
export function trackEvent(_name: string, _data?: Record<string, unknown>): void {}
