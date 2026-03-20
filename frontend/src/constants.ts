// 生徒ステータス
export const STUDENT_STATUS_LABEL: Record<string, string> = {
  ACTIVE: '在籍', INACTIVE: '退塾', SUSPENDED: '休塾',
}
export const STUDENT_STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400',
  INACTIVE: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  SUSPENDED: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400',
}

// 出席ステータス
export const ATTEND_STATUSES = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const
export const ATTEND_LABEL: Record<string, string> = {
  PRESENT: '出席', ABSENT: '欠席', LATE: '遅刻', EXCUSED: '公欠',
}

// 授業ステータス
export const LESSON_STATUS_LABEL: Record<string, string> = {
  SCHEDULED: '予定', DONE: '完了', CANCELLED: 'キャンセル',
}
export const LESSON_STATUS_COLOR: Record<string, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400',
  DONE: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400',
  CANCELLED: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
}

// 請求ステータス
export const INVOICE_STATUS_LABEL: Record<string, string> = {
  UNPAID: '未入金', PAID: '入金済', OVERDUE: '期限超過', CANCELLED: 'キャンセル',
}
export const INVOICE_STATUS_COLOR: Record<string, string> = {
  UNPAID: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400',
  PAID: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400',
  OVERDUE: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-400',
  CANCELLED: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
}
