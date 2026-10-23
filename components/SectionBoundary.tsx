'use client'

import { Component, type ReactNode } from 'react'

// Decorative sections must never take the whole page down: if one throws, it is dropped and logged.
export class SectionBoundary extends Component<{ name: string; children: ReactNode; fallback?: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(error: unknown) { console.error(`[parche] section "${this.props.name}" failed and was hidden:`, error) }
  render() { return this.state.failed ? (this.props.fallback ?? null) : this.props.children }
}
