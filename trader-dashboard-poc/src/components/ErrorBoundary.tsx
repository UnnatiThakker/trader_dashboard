import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

type FallbackRenderProps = {
  error?: Error
  resetErrorBoundary: () => void
}

type ErrorBoundaryProps = {
  children: ReactNode
  fallbackRender: (props: FallbackRenderProps) => ReactNode
  onReset?: () => void
  resetKey?: unknown
}

type ErrorBoundaryState = {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
    this.resetErrorBoundary = this.resetErrorBoundary.bind(this)
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo)
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: undefined })
    }
  }

  resetErrorBoundary() {
    this.setState({ hasError: false, error: undefined })
    this.props.onReset?.()
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallbackRender({
        error: this.state.error,
        resetErrorBoundary: this.resetErrorBoundary,
      })
    }

    return this.props.children
  }
}

export default ErrorBoundary
