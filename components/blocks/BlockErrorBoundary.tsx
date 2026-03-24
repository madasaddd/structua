'use client'

import React from 'react'

type Props = {
  children: React.ReactNode
}

type State = {
  hasError: boolean
  error?: Error
}

export default class BlockErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="my-6 rounded-xl border border-red-100 bg-red-50 p-6 text-center">
          <div className="mb-2 text-2xl">⚠️</div>
          <p className="text-sm font-medium text-red-700">
            This content block could not be displayed.
          </p>
          <p className="mt-1 text-xs text-red-500">
            The content may be corrupted or in an unsupported format.
          </p>
        </div>
      )
    }

    return this.props.children
  }
}
