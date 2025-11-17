import { useEffect, useState, type ComponentType } from 'react'

export default function DevtoolsLoader() {
  const [Devtools, setDevtools] = useState<ComponentType<{ initialIsOpen?: boolean }> | null>(null)

  useEffect(() => {
    if (!import.meta.env.DEV) return
    let mounted = true
    import('@tanstack/react-query-devtools')
      .then((mod) => {
        if (mounted) setDevtools(() => mod.ReactQueryDevtools as ComponentType<{ initialIsOpen?: boolean }>)
      })
      .catch(() => {
        // ignore failures to load devtools in weird environments
      })
    return () => {
      mounted = false
    }
  }, [])

  if (!Devtools) return null
  return <Devtools initialIsOpen={true} />
}
