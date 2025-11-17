import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

function DevtoolsLoader() {
  const [Devtools, setDevtools] = useState<any>(null)

  useEffect(() => {
    if (!import.meta.env.DEV) return
    let mounted = true
    import('@tanstack/react-query-devtools').then((mod) => {
      if (mounted) setDevtools(() => mod.ReactQueryDevtools)
    }).catch(() => {
      // ignore failures to load devtools in weird environments
    })
    return () => { mounted = false }
  }, [])

  if (!Devtools) return null
  return <Devtools initialIsOpen={false} />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <DevtoolsLoader />
    </QueryClientProvider>
  </StrictMode>,
)
