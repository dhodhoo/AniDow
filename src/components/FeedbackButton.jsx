import { useState, useRef, useEffect } from 'react'

const FEEDBACK_URL = '/api/feedback'
const COOLDOWN_MS = 30000
const STORAGE_KEY = 'anidow_feedback_last_sent'

export default function FeedbackButton() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const textareaRef = useRef(null)

  useEffect(() => {
    if (open) {
      setSuccess(false)
      setError('')
      setName('')
      setMessage('')
      setTimeout(() => textareaRef.current?.focus(), 100)
    }
  }, [open])

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') setOpen(false) }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  function getCooldown() {
    const last = localStorage.getItem(STORAGE_KEY)
    if (!last) return 0
    const remaining = COOLDOWN_MS - (Date.now() - parseInt(last, 10))
    return Math.max(0, Math.ceil(remaining / 1000))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const trimmed = message.trim()
    if (!trimmed) return

    const cooldown = getCooldown()
    if (cooldown > 0) {
      setError(`Tunggu ${cooldown} detik lagi sebelum mengirim lagi.`)
      return
    }

    setSending(true)
    setError('')

    try {
      const res = await fetch(FEEDBACK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: [
            '**🟣 ANIDOW FEEDBACK**',
            name.trim() ? `**Dari:** ${name.trim()}` : '',
            `**Pesan:** ${trimmed}`,
          ].filter(Boolean).join('\n'),
        }),
      })

      if (!res.ok) throw new Error(`Discord returned ${res.status}`)

      localStorage.setItem(STORAGE_KEY, String(Date.now()))
      setSuccess(true)
      setError('')
    } catch (err) {
      setError('Gagal mengirim. Coba lagi nanti.')
    } finally {
      setSending(false)
    }
  }

  function handleBackdrop(e) {
    if (e.target === e.currentTarget) setOpen(false)
  }

  const cooldown = getCooldown()

  return (
    <>
      {/* FAB */}
      {!open && (
        <button
          className="fab-btn"
          onClick={() => setOpen(true)}
          aria-label="Kirim masukan"
          title="Kirim saran / kritik / laporan bug"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 999,
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#7C3AED',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(124,58,237,0.45)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </button>
      )}

      {/* Modal */}
      {open && (
        <div
          onClick={handleBackdrop}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            backgroundColor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#1F1F1F',
              border: '1px solid #2D2D2D',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '420px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: 700, margin: 0 }}>
                {success ? 'Terkirim!' : 'Kirim Masukan'}
              </h3>
              <button
                onClick={() => setOpen(false)}
                style={{ color: '#A3A3A3', cursor: 'pointer', padding: '4px', borderRadius: '4px', transition: 'color 0.15s' }}
                title="Tutup"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A3A3A3" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {success ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '12px 0' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#46D369" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><path d="M9 12l2 2 4-4" />
                </svg>
                <p style={{ color: '#A3A3A3', fontSize: '14px', textAlign: 'center', margin: 0 }}>
                  Terima kasih! Masukanmu telah dikirim ke developer.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ color: '#A3A3A3', fontSize: '12px', fontWeight: 600 }}>Nama (opsional)</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Anonim"
                    maxLength={50}
                    style={{
                      backgroundColor: '#141414',
                      border: '1px solid #2D2D2D',
                      borderRadius: '6px',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none',
                      padding: '10px 12px',
                      transition: 'border-color 0.15s',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ color: '#A3A3A3', fontSize: '12px', fontWeight: 600 }}>
                    Pesan <span style={{ color: '#E50914' }}>*</span>
                  </label>
                  <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Saran, kritik, atau laporan bug..."
                    maxLength={1000}
                    rows={4}
                    style={{
                      backgroundColor: '#141414',
                      border: '1px solid #2D2D2D',
                      borderRadius: '6px',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      outline: 'none',
                      padding: '10px 12px',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      transition: 'border-color 0.15s',
                    }}
                  />
                  <span style={{ color: '#555', fontSize: '11px', textAlign: 'right' }}>{message.length}/1000</span>
                </div>

                {error && (
                  <p style={{ color: '#E50914', fontSize: '12px', margin: 0 }}>{error}</p>
                )}

                <button
                  type="submit"
                  disabled={sending || !message.trim()}
                  style={{
                    backgroundColor: sending || !message.trim() ? '#3A1F7A' : '#7C3AED',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#FFFFFF',
                    cursor: sending || !message.trim() ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: 700,
                    padding: '12px',
                    transition: 'background-color 0.15s, opacity 0.15s',
                    opacity: sending ? 0.7 : 1,
                  }}
                >
                  {sending ? 'Mengirim...' : cooldown > 0 ? `Kirim (${cooldown}s)` : 'Kirim'}
                </button>

                <p style={{ color: '#555', fontSize: '11px', textAlign: 'center', margin: 0 }}>
                  Masukanmu akan dikirim ke Discord developer. Jangan kirim data pribadi.
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
