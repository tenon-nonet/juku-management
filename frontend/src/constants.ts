// 生徒ステータス
export const STUDENT_STATUS_LABEL: Record<string, string> = {
  ACTIVE: '在籍', INACTIVE: '退塾', SUSPENDED: '休塾',
}
export const STUDENT_STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  INACTIVE: 'bg-gray-100 text-gray-600',
  SUSPENDED: 'bg-yellow-100 text-yellow-700',
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
  SCHEDULED: 'bg-blue-100 text-blue-700',
  DONE: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
}

// 請求ステータス
export const INVOICE_STATUS_LABEL: Record<string, string> = {
  UNPAID: '未入金', PAID: '入金済', OVERDUE: '期限超過', CANCELLED: 'キャンセル',
}
export const INVOICE_STATUS_COLOR: Record<string, string> = {
  UNPAID: 'bg-red-100 text-red-700',
  PAID: 'bg-green-100 text-green-700',
  OVERDUE: 'bg-orange-100 text-orange-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
}
