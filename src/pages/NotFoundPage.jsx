import { Link } from 'react-router-dom'
import { useEffect } from 'react'

export default function NotFoundPage() {
  useEffect(() => { document.title = 'Halaman Tidak Ditemukan — ANIDOW' }, [])

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
      <div style={{ color: '#7C3AED', fontSize: '72px', fontWeight: 900, lineHeight: '1' }}>404</div>
      <div style={{ color: '#A3A3A3', fontSize: '16px', textAlign: 'center' }}>Halaman yang kamu cari tidak ditemukan.</div>
      <Link to="/" style={{
        backgroundColor: '#7C3AED',
        borderRadius: '4px',
        color: '#FFFFFF',
        fontSize: '14px',
        fontWeight: 600,
        paddingBlock: '10px',
        paddingInline: '24px',
        textDecoration: 'none',
      }}>Kembali ke Beranda</Link>
    </div>
  )
}
