import { createContext, useContext, useEffect, useState } from 'react'
import { getFeatureFlags } from '../api'
import { isLoggedIn } from '../auth'

interface FeatureFlag {
  id: number
  featureKey: string
  isEnabled: boolean
  planLevel: string
  description: string
}

interface FeatureFlagContextValue {
  flags: Record<string, boolean>
  flagDetails: FeatureFlag[]
  isEnabled: (key: string) => boolean
  reload: () => void
  loading: boolean
}

const FeatureFlagContext = createContext<FeatureFlagContextValue>({
  flags: {},
  flagDetails: [],
  isEnabled: () => true,
  reload: () => {},
  loading: false,
})

export function FeatureFlagProvider({ children }: { children: React.ReactNode }) {
  const [flags, setFlags] = useState<Record<string, boolean>>({})
  const [flagDetails, setFlagDetails] = useState<FeatureFlag[]>([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    if (!isLoggedIn()) return
    setLoading(true)
    try {
      const res = await getFeatureFlags()
      const map: Record<string, boolean> = {}
      res.data.forEach((f: FeatureFlag) => { map[f.featureKey] = f.isEnabled })
      setFlags(map)
      setFlagDetails(res.data)
    } catch {
      // If feature flags API fails, allow all features (graceful fallback)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const isEnabled = (key: string) => {
    // If not loaded yet or key not found, default to true (show feature)
    if (Object.keys(flags).length === 0) return true
    return flags[key] ?? true
  }

  return (
    <FeatureFlagContext.Provider value={{ flags, flagDetails, isEnabled, reload: load, loading }}>
      {children}
    </FeatureFlagContext.Provider>
  )
}

export const useFeatureFlags = () => useContext(FeatureFlagContext)

export function FeatureGate({ feature, children }: { feature: string; children: React.ReactNode }) {
  const { isEnabled } = useFeatureFlags()
  if (!isEnabled(feature)) return null
  return <>{children}</>
}
