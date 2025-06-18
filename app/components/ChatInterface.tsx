'use client'
import { useState } from 'react'

export default function ChatInterface() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)

  const askAI = async () => {
    if (!input.trim()) return
    setLoading(true)
    const domain = localStorage.getItem('domain') || 'legal'
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, domain }),
      })
      const data = await res.json()
      setOutput(data.output)
    } catch (error) {
      setOutput('An error occurred. Please try again later.')
    }
    setLoading(false)
  }

  return (
    <div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask your legal, business, or coding question..."
        className="w-full p-3 border rounded-xl mb-2"
      />
      <button onClick={askAI} className="px-4 py-2 bg-blue-600 text-white rounded-xl" disabled={loading}>
        {loading ? 'Thinking...' : 'Ask Lawless'}
      </button>
      {output && <div className="mt-4 p-3 border rounded-xl bg-gray-100 whitespace-pre-wrap">{output}</div>}
    </div>
  )
}