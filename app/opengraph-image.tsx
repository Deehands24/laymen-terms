import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const alt = 'Medical Terms Translator - Simplify Complex Medical Language'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 60,
          background: 'linear-gradient(to bottom right, #f0fdfa, #e5fafe)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(to right, #2dd4bf, #22d3ee)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            fontSize: 80,
            fontWeight: 'bold',
            marginBottom: 20,
          }}
        >
          Medical Terms Translator
        </div>
        <div
          style={{
            fontSize: 40,
            color: '#6b7280',
            textAlign: 'center',
            maxWidth: 900,
          }}
        >
          Instantly translate complex medical terminology into simple, easy-to-understand language
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 40,
            gap: 60,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div style={{ fontSize: 32, color: '#14b8a6', fontWeight: 'bold' }}>
              AI-Powered
            </div>
            <div style={{ fontSize: 20, color: '#9ca3af' }}>
              Instant Translation
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div style={{ fontSize: 32, color: '#14b8a6', fontWeight: 'bold' }}>
              Patient-Friendly
            </div>
            <div style={{ fontSize: 20, color: '#9ca3af' }}>
              Easy to Understand
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div style={{ fontSize: 32, color: '#14b8a6', fontWeight: 'bold' }}>
              24/7 Available
            </div>
            <div style={{ fontSize: 20, color: '#9ca3af' }}>
              Always Ready
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
