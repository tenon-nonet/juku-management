import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

const pageTitles: Record<string, string> = {
  '/': 'ダッシュボード',
  '/students': '生徒管理',
  '/guardians': '保護者管理',
  '/lessons': '授業スケジュール',
  '/exam-results': '成績記録',
  '/invoices': '請求・支払い',
  '/announcements': 'お知らせ',
  '/settings': '設定',
}

function getTitle(pathname: string): string {
  if (pathname.startsWith('/students/')) return '生徒詳細'
  if (pathname.startsWith('/guardians/')) return '保護者詳細'
  if (pathname.startsWith('/lessons/')) return '授業詳細'
  if (pathname.startsWith('/invoices/')) return '請求詳細'
  return pageTitles[pathname] ?? 'ページ'
}

export default function AppLayout() {
  const { pathname } = useLocation()
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={getTitle(pathname)} />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
