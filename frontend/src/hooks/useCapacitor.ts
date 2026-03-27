import { useEffect } from 'react'

// Capacitor が利用可能かどうか（ネイティブアプリ環境）
export const isNative = () => {
  return typeof (window as any).Capacitor !== 'undefined' &&
    (window as any).Capacitor?.isNativePlatform?.()
}

// Android 物理バックボタン制御
export function useAndroidBack(onBack: () => void) {
  useEffect(() => {
    if (!isNative()) return
    let App: any
    const setup = async () => {
      try {
        const mod = await import('@capacitor/app')
        App = mod.App
        App.addListener('backButton', onBack)
      } catch { /* Capacitor App plugin not available */ }
    }
    setup()
    return () => {
      App?.removeAllListeners?.()
    }
  }, [onBack])
}

// ステータスバーの色を設定（iOS/Android）
export async function setStatusBarColor(color: string, isDark: boolean) {
  if (!isNative()) return
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar')
    await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light })
    await StatusBar.setBackgroundColor({ color })
  } catch { /* StatusBar plugin not available */ }
}
