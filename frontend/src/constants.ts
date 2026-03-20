// 生徒ステータス
export const STUDENT_STATUS_LABEL: Record<string, string> = {
  ACTIVE: '在籍', INACTIVE: '退塾', SUSPENDED: '休塾',
}
export const STUDENT_STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'bg-green-900/50 text-green-400',
  INACTIVE: 'bg-gray-700 text-gray-300',
  SUSPENDED: 'bg-yellow-900/50 text-yellow-400',
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
  SCHEDULED: 'bg-blue-900/50 text-blue-400',
  DONE: 'bg-green-900/50 text-green-400',
  CANCELLED: 'bg-gray-700 text-gray-400',
}

// 請求ステータス
export const INVOICE_STATUS_LABEL: Record<string, string> = {
  UNPAID: '未入金', PAID: '入金済', OVERDUE: '期限超過', CANCELLED: 'キャンセル',
}
export const INVOICE_STATUS_COLOR: Record<string, string> = {
  UNPAID: 'bg-red-900/50 text-red-400',
  PAID: 'bg-green-900/50 text-green-400',
  OVERDUE: 'bg-orange-900/50 text-orange-400',
  CANCELLED: 'bg-gray-700 text-gray-400',
}
