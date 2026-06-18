import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          alignItems: 'center',
          backgroundColor: '#141414',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '32px',
        }}>
          <img src="/logo.png" alt="ANIDOW" style={{ height: '48px', objectFit: 'contain' }} />
          <div style={{ color: '#A3A3A3', fontSize: '16px', textAlign: 'center' }}>Terjadi kesalahan. Silakan muat ulang halaman.</div>
          <button onClick={() => window.location.reload()} style={{
            backgroundColor: '#7C3AED',
            border: 'none',
            borderRadius: '4px',
            color: '#FFFFFF',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
            paddingBlock: '10px',
            paddingInline: '24px',
          }}>Muat Ulang</button>
        </div>
      )
    }

    return this.props.children
  }
}
