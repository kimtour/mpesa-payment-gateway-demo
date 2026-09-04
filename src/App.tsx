import { useEffect, useState } from 'react'
import './App.css'

type PaymentStatus = 'idle' | 'pending' | 'success' | 'failed'

type EventItem = {
  time: string
  title: string
  detail: string
  tone: 'green' | 'amber' | 'slate'
}

function App() {
  const [phone, setPhone] = useState('0712 345 678')
  const [amount, setAmount] = useState('2500')
  const [reference, setReference] = useState('ORDER-1048')
  const [status, setStatus] = useState<PaymentStatus>('idle')
  const [checkoutId, setCheckoutId] = useState('')
  const [events, setEvents] = useState<EventItem[]>([
    { time: '09:41:08', title: 'Webhook endpoint ready', detail: 'POST /api/v1/webhooks/mpesa', tone: 'green' },
    { time: '09:40:52', title: 'Gateway initialized', detail: 'Mock Daraja provider · sandbox mode', tone: 'slate' },
  ])

  useEffect(() => {
    if (status !== 'pending') return
    const timer = window.setTimeout(() => {
      setStatus('success')
      setEvents((current) => [
        { time: new Date().toLocaleTimeString('en-GB'), title: 'Payment confirmed', detail: 'Webhook signature verified · receipt QH72K8P4', tone: 'green' },
        ...current,
      ])
    }, 1800)
    return () => window.clearTimeout(timer)
  }, [status])

  const startCheckout = (event: React.FormEvent) => {
    event.preventDefault()
    setStatus('pending')
    const id = `ws_${Math.random().toString(36).slice(2, 10)}`
    setCheckoutId(id)
    setEvents((current) => [
      { time: new Date().toLocaleTimeString('en-GB'), title: 'STK Push dispatched', detail: `CheckoutRequestID ${id}`, tone: 'amber' },
      ...current,
    ])
  }

  const reset = () => {
    setStatus('idle')
    setCheckoutId('')
  }

  return (
    <main className="shell">
      <header className="topbar"><div className="brand"><span className="brand-mark">M</span><span>mpesa<span className="brand-dot">.</span>gateway</span></div><div className="top-actions"><span className="sandbox-pill"><span className="status-dot" /> Sandbox environment</span><button className="icon-button" aria-label="Notifications">⌁</button><div className="avatar">KT</div></div></header>
      <section className="page-heading"><div><p className="eyebrow">PAYMENTS / CHECKOUT</p><h1>Payment gateway console</h1><p className="subtitle">Initiate a secure M-Pesa STK Push and observe the complete payment lifecycle.</p></div><div className="system-health"><span className="status-dot" /> All systems operational</div></section>
      <section className="metric-strip"><div><span className="metric-label">TODAY'S VOLUME</span><strong>KES 184,250</strong><small className="positive">↑ 12.8% vs yesterday</small></div><div><span className="metric-label">SUCCESS RATE</span><strong>98.4%</strong><small className="positive">↑ 1.2% this week</small></div><div><span className="metric-label">AVG. RESPONSE</span><strong>1.8s</strong><small>Last 100 transactions</small></div><div><span className="metric-label">WEBHOOKS</span><strong>24 <small className="webhook-status">healthy</small></strong><small>Last event 12 sec ago</small></div></section>
      <div className="workspace-grid"><section className="panel checkout-panel"><div className="panel-heading"><div><span className="step-number">01</span><div><h2>Initiate payment</h2><p>Send an STK Push to a customer's phone</p></div></div><span className="api-badge">POST /v1/payments</span></div><form onSubmit={startCheckout}><label>Customer phone number <span>Required</span><input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="0712 345 678" required /></label><div className="form-row"><label>Amount <span>Required</span><div className="input-with-prefix"><b>KES</b><input value={amount} onChange={(event) => setAmount(event.target.value)} type="number" min="1" required /></div></label><label>Reference <span>Optional</span><input value={reference} onChange={(event) => setReference(event.target.value)} /></label></div><label className="select-label">Payment description <span>Optional</span><select defaultValue="Order payment"><option>Order payment</option><option>Invoice settlement</option><option>Subscription renewal</option></select></label><div className="security-note"><span>♢</span><div><b>Secure by design</b><p>Phone numbers are normalized and masked in logs. Credentials never leave the server.</p></div></div><button className="primary-button" disabled={status === 'pending'}>{status === 'pending' ? 'Waiting for customer…' : 'Initiate STK Push'} <span>→</span></button></form>{status !== 'idle' && <div className={`result-banner ${status}`}><div className="result-icon">{status === 'success' ? '✓' : '…'}</div><div><b>{status === 'success' ? 'Payment completed' : 'STK Push awaiting approval'}</b><p>{status === 'success' ? 'Receipt QH72K8P4 · Customer notified' : `Checkout ID ${checkoutId} · Ask customer to enter their PIN`}</p></div>{status === 'success' && <button onClick={reset}>New payment</button>}</div>}</section><section className="panel lifecycle-panel"><div className="panel-heading"><div><span className="step-number">02</span><div><h2>Payment lifecycle</h2><p>Real-time state machine</p></div></div><span className="live-pill"><span className="status-dot" /> Live</span></div><div className="timeline"><div className="timeline-step completed"><span>✓</span><div><b>Request received</b><small>Validation and idempotency check</small></div><em>09:41:12</em></div><div className={`timeline-step ${status === 'idle' ? '' : 'completed'}`}><span>{status === 'idle' ? '2' : '✓'}</span><div><b>STK Push sent</b><small>Safaricom API accepted request</small></div><em>{status === 'idle' ? '—' : '09:41:13'}</em></div><div className={`timeline-step ${status === 'success' ? 'completed' : status === 'pending' ? 'active' : ''}`}><span>{status === 'success' ? '✓' : '3'}</span><div><b>Customer approval</b><small>{status === 'success' ? 'PIN verified successfully' : 'Waiting for customer PIN'}</small></div><em>{status === 'success' ? '09:41:15' : '—'}</em></div><div className={`timeline-step ${status === 'success' ? 'completed' : ''}`}><span>{status === 'success' ? '✓' : '4'}</span><div><b>Payment confirmed</b><small>Receipt issued and webhook delivered</small></div><em>{status === 'success' ? '09:41:16' : '—'}</em></div></div><div className="state-footer"><span>Current state</span><strong className={status}>{status === 'idle' ? 'Ready for payment' : status === 'pending' ? 'Awaiting customer' : 'Completed'}</strong></div></section></div>
      <section className="panel events-panel"><div className="events-header"><div><h2>Webhook & API events</h2><p>Audit trail for this workspace</p></div><button className="ghost-button">View API docs ↗</button></div><div className="event-list">{events.map((item, index) => <div className="event-row" key={`${item.time}-${index}`}><span className={`event-dot ${item.tone}`} /><time>{item.time}</time><div><b>{item.title}</b><small>{item.detail}</small></div><span className="event-type">{item.title.includes('Webhook') ? 'WEBHOOK' : 'API'}</span></div>)}</div></section><footer><span>mpesa.gateway demo</span><span>Built for a production-minded payment conversation · Mock provider enabled</span></footer>
    </main>
  )
}

export default App
