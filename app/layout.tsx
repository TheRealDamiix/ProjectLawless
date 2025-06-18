export const metadata = {
  title: 'Project Lawless',
  description: 'Your AI legal/business/coding assistant',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
