import DomainSelector from '../components/DomainSelector'
import ChatInterface from '../components/ChatInterface'

export default function Home() {
  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Project Lawless</h1>
      <DomainSelector />
      <ChatInterface />
    </main>
  )
}
