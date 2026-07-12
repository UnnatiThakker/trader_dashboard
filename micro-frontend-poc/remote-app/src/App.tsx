import LiveFxTicker from './LiveFxTicker'

const containerStyles: React.CSSProperties = {
  display: 'grid',
  gap: 24,
  fontFamily: 'system-ui, sans-serif',
  color: '#0f172a',
}

const descriptionStyles: React.CSSProperties = {
  margin: 0,
  color: '#475569',
  lineHeight: 1.75,
}

function App() {
  return (
    <div style={containerStyles}>
      <p style={descriptionStyles}>
        Loaded from a separate remote Vite app over localhost.
      </p>
      <LiveFxTicker />
    </div>
  )
}

export default App
