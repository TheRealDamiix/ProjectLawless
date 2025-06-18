'use client'
import { useState, useEffect } from 'react'

export default function DomainSelector() {
  const [domain, setDomain] = useState('legal')

  useEffect(() => {
    const savedDomain = localStorage.getItem('domain')
    if (savedDomain) setDomain(savedDomain)
  }, [])

  return (
    <div className="mb-4 flex gap-2">
      {['legal', 'business', 'coding'].map((d) => (
        <button
          key={d}
          onClick={() => {
            setDomain(d)
            localStorage.setItem('domain', d)
          }}
          className={\`px-4 py-2 rounded-xl \${domain === d ? 'bg-black text-white' : 'bg-gray-200'}\`}
        >
          {d.charAt(0).toUpperCase() + d.slice(1)}
        </button>
      ))}
    </div>
  )
}