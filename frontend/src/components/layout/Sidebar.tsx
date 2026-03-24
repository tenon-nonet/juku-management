import { NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useFeatureFlags } from '../../contexts/FeatureFlagContext'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, isAdmin } = useAuth()
  const { isEnabled } = useFeatureFlags()

  const isStaff = user?.userType === 'STAFF'
  const isStudent = user?.userType === 'STUDENT'
  const isGuardian = user?.userType === 'GUARDIAN'
  const canSeeInvoices = isAdmin() || user?.role === 'OFFICE_STAFF'

  const navItem = (to: string, label: string, icon: string, exact = false) => (
    <li key={to}>
      <NavLink
        to={to}
        end={exact}
        onClick={onClose}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors min-h-[44px] ${
            isActive
              ? 'bg-indigo-600 text-white'
              : 'text-gray-300 hover:bg-gray-800 hover:text-white'
          }`
        }
      >
        <span>{icon}</span>
        <span>{label}</span>
      </NavLink>
    </li>
  )

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-56 min-h-screen bg-gray-900 text-white flex flex-col
          transform transition-transform duration-200
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="px-4 py-5 border-b border-gray-700 flex items-center justify-between">
          <h1 className="text-lg font-bold text-white">塾管理システム</h1>
          {onClose && (
            <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white text-xl leading-none">×</button>
          )}
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {navItem('/', 'ダッシュボード', '🏠', true)}

            {/* Staff/Admin features */}
            {isStaff && isEnabled('CUSTOMER_MANAGEMENT') && (
              <>
                {navItem('/students', '生徒管理', '👨‍🎓')}
                {navItem('/guardians', '保護者管理', '👪')}
              </>
            )}
            {isStaff && isEnabled('SCHEDULE_MANAGEMENT') && navItem('/lessons', '授業スケジュール', '📅')}
            {isStaff && isEnabled('GRADE_MANAGEMENT') && navItem('/exam-results', '成績記録', '📊')}
            {isStaff && isEnabled('INVOICE_MANAGEMENT') && canSeeInvoices && navItem('/invoices', '請求・支払い', '💴')}
            {isStaff && isEnabled('ANNOUNCEMENT') && navItem('/announcements', 'お知らせ', '📢')}
            {isStaff && isEnabled('COMMUNICATION') && navItem('/messages', 'メッセージ', '💬')}
            {isStaff && navItem('/prospects', '体験生管理', '🎯')}
            {isStaff && navItem('/lesson-packs', '特別パック', '📦')}
            {isStaff && navItem('/sales', '売上分析', '📈')}
            {isAdmin() && navItem('/salary', '給与管理', '💰')}

            {/* Student portal */}
            {isStudent && (
              <>
                {navItem('/portal/student', 'マイページ', '👤', true)}
                {navItem('/announcements', 'お知らせ', '📢')}
                {isEnabled('COMMUNICATION') && navItem('/messages', 'メッセージ', '💬')}
              </>
            )}

            {/* Guardian portal */}
            {isGuardian && (
              <>
                {navItem('/portal/guardian', 'お子様情報', '👪', true)}
                {navItem('/announcements', 'お知らせ', '📢')}
                {isEnabled('COMMUNICATION') && navItem('/messages', 'メッセージ', '💬')}
              </>
            )}
          </ul>

          {/* Admin section */}
          {isAdmin() && (
            <>
              <div className="px-4 pt-4 pb-1">
                <p className="text-xs text-gray-500 uppercase tracking-wider">管理者</p>
              </div>
              <ul className="space-y-1 px-2">
                {navItem('/settings', '設定', '⚙️')}
              </ul>
            </>
          )}
        </nav>
      </aside>
    </>
  )
}
