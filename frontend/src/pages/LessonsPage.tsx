import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getLessons, getStaff, getStudents, getCourses, createLesson, updateLesson, deleteLesson, rescheduleLesson, bulkCreateLessons, getSettings, updateSetting } from '../api'
import type { Lesson, Staff, Student, Course } from '../types'

// ─── Constants ───────────────────────────────────────────────────────────────

const START_HOUR = 8
const END_HOUR = 22
const PX_PER_HOUR = 60
const PX_PER_MIN = PX_PER_HOUR / 60
const TOTAL_HOURS = END_HOUR - START_HOUR

const DAYS_JP = ['月', '火', '水', '木', '金', '土', '日']
const PALETTE = [
  '#6366f1','#3b82f6','#10b981','#f59e0b',
  '#ef4444','#8b5cf6','#ec4899','#14b8a6',
  '#f97316','#84cc16','#06b6d4','#a855f7',
]

type ViewMode = 'day' | 'week' | 'month' | 'year' | 'teacher' | 'list'

const STATUS_LABEL: Record<string, string> = { SCHEDULED: '予定', DONE: '完了', CANCELLED: 'キャンセル' }
const STATUS_COLOR: Record<string, string> = {
  SCHEDULED: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  DONE: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  CANCELLED: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function courseColor(courseId: number): string {
  return PALETTE[(courseId - 1) % PALETTE.length] ?? PALETTE[0]
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}
function isToday(d: Date): boolean { return isSameDay(d, new Date()) }

function fmtTime(dt: Date): string {
  return `${dt.getHours()}:${String(dt.getMinutes()).padStart(2, '0')}`
}

function toLocalISOString(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`
}

function getWeekDates(base: Date): Date[] {
  const dow = base.getDay()
  const monday = new Date(base)
  monday.setDate(base.getDate() - (dow === 0 ? 6 : dow - 1))
  monday.setHours(0, 0, 0, 0)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday); d.setDate(monday.getDate() + i); return d
  })
}

function layoutLessons(lessons: Lesson[]) {
  const sorted = [...lessons].sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
  const colEnds: number[] = []
  const out: { lesson: Lesson; col: number; maxCols: number }[] = []
  for (const l of sorted) {
    const dt = new Date(l.scheduledAt)
    const start = dt.getHours() * 60 + dt.getMinutes()
    const end = start + l.durationMin
    let col = colEnds.findIndex(e => e <= start)
    if (col === -1) { col = colEnds.length; colEnds.push(end) } else colEnds[col] = end
    out.push({ lesson: l, col, maxCols: 1 })
  }
  const total = colEnds.length || 1
  return out.map(o => ({ ...o, maxCols: total }))
}

// ─── Booth utilities ─────────────────────────────────────────────────────────

/** 指定の日時に同時進行している授業数を返す */
function concurrentAt(lessons: Lesson[], slotStart: Date, slotEnd: Date): number {
  return lessons.filter(l => {
    if (l.status === 'CANCELLED') return false
    const s = new Date(l.scheduledAt)
    const e = new Date(s.getTime() + l.durationMin * 60_000)
    return s < slotEnd && e > slotStart
  }).length
}

function boothBarColor(used: number, max: number): string {
  if (max <= 0 || used === 0) return ''
  const pct = used / max
  if (pct >= 1) return 'bg-red-500'
  if (pct >= 0.7) return 'bg-amber-400'
  return 'bg-emerald-400'
}

function boothBgClass(used: number, max: number): string {
  if (max <= 0 || used === 0) return ''
  const pct = used / max
  if (pct >= 1) return 'bg-red-50/70 dark:bg-red-900/20'
  if (pct >= 0.7) return 'bg-amber-50/60 dark:bg-amber-900/10'
  return 'bg-emerald-50/40 dark:bg-emerald-900/10'
}

// ─── LessonBlock ─────────────────────────────────────────────────────────────

function LessonBlock({ lesson, col, maxCols, onClick }: {
  lesson: Lesson; col: number; maxCols: number; onClick: (l: Lesson) => void
}) {
  const dt = new Date(lesson.scheduledAt)
  const top = (dt.getHours() - START_HOUR) * PX_PER_HOUR + dt.getMinutes() * PX_PER_MIN
  const height = Math.max(lesson.durationMin * PX_PER_MIN, 26)
  const widthPct = 100 / maxCols
  const color = courseColor(lesson.courseId)
  const isCancel = lesson.status === 'CANCELLED'

  return (
    <div
      style={{
        position: 'absolute', top: `${top}px`, height: `${height}px`,
        left: `${col * widthPct + 0.5}%`, width: `${widthPct - 1}%`,
        backgroundColor: color, opacity: isCancel ? 0.35 : 0.9,
        borderRadius: 4, overflow: 'hidden', cursor: 'pointer', zIndex: 2,
      }}
      draggable={!isCancel}
      onDragStart={(e) => {
        e.stopPropagation()
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
        e.dataTransfer.setData('lessonId', String(lesson.id))
        e.dataTransfer.setData('offsetMin', String(Math.max(0, (e.clientY - rect.top) / PX_PER_MIN)))
        e.dataTransfer.effectAllowed = 'move'
      }}
      onClick={(e) => { e.stopPropagation(); onClick(lesson) }}
    >
      <div className="text-white px-1 py-0.5 text-xs leading-tight h-full overflow-hidden">
        <div className="font-semibold truncate">{lesson.courseName}</div>
        {height >= 34 && <div className="opacity-90 truncate">{fmtTime(dt)} ({lesson.durationMin}分)</div>}
        {height >= 48 && lesson.studentName && <div className="opacity-80 truncate">{lesson.studentName}</div>}
        {height >= 62 && lesson.teacherName && <div className="opacity-70 truncate">{lesson.teacherName}</div>}
        {isCancel && <div className="opacity-60 truncate line-through">キャンセル</div>}
      </div>
    </div>
  )
}

// ─── TimeGrid ─────────────────────────────────────────────────────────────────

function TimeGrid({ date, lessons, onReschedule, onSlotClick, onLessonClick, maxBooths = 0 }: {
  date: Date; lessons: Lesson[]
  onReschedule: (id: number, t: Date) => void
  onSlotClick: (t: Date) => void
  onLessonClick: (l: Lesson) => void
  maxBooths?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const laid = layoutLessons(lessons)

  const calcTime = (clientY: number, offsetMin = 0): Date => {
    if (!ref.current) return date
    const rect = ref.current.getBoundingClientRect()
    let min = Math.round((clientY - rect.top - offsetMin * PX_PER_MIN) / PX_PER_MIN) + START_HOUR * 60
    min = Math.round(min / 15) * 15
    min = Math.max(START_HOUR * 60, Math.min((END_HOUR - 1) * 60 + 45, min))
    const t = new Date(date)
    t.setHours(Math.floor(min / 60), min % 60, 0, 0)
    return t
  }

  return (
    <div
      ref={ref}
      style={{ position: 'relative', height: `${TOTAL_HOURS * PX_PER_HOUR}px` }}
      className="w-full"
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }}
      onDrop={(e) => {
        e.preventDefault()
        const lessonId = Number(e.dataTransfer.getData('lessonId'))
        const offsetMin = Number(e.dataTransfer.getData('offsetMin'))
        if (lessonId) onReschedule(lessonId, calcTime(e.clientY, offsetMin))
      }}
      onClick={(e) => { onSlotClick(calcTime(e.clientY)) }}
    >
      {/* ブース利用率オーバーレイ */}
      {maxBooths > 0 && Array.from({ length: TOTAL_HOURS }, (_, i) => {
        const slotStart = new Date(date); slotStart.setHours(START_HOUR + i, 0, 0, 0)
        const slotEnd   = new Date(date); slotEnd.setHours(START_HOUR + i + 1, 0, 0, 0)
        const used = concurrentAt(lessons, slotStart, slotEnd)
        const bgClass = boothBgClass(used, maxBooths)
        return bgClass ? (
          <div key={`b${i}`} style={{ position: 'absolute', top: `${i * PX_PER_HOUR}px`, left: 0, right: 0, height: PX_PER_HOUR }}
            className={bgClass} />
        ) : null
      })}
      {Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => (
        <div key={i} style={{ position: 'absolute', top: `${i * PX_PER_HOUR}px`, left: 0, right: 0, height: 1 }}
          className="bg-gray-100 dark:bg-gray-700/50" />
      ))}
      {Array.from({ length: TOTAL_HOURS }, (_, i) => (
        <div key={`h${i}`} style={{ position: 'absolute', top: `${i * PX_PER_HOUR + 30}px`, left: 0, right: 0, height: 1 }}
          className="bg-gray-100/50 dark:bg-gray-700/25" />
      ))}
      {laid.map(({ lesson, col, maxCols }) => (
        <LessonBlock key={lesson.id} lesson={lesson} col={col} maxCols={maxCols} onClick={onLessonClick} />
      ))}
    </div>
  )
}

function TimeLabels({ lessons = [], maxBooths = 0, date = new Date() }: {
  lessons?: Lesson[]; maxBooths?: number; date?: Date
}) {
  return (
    <div className="flex-shrink-0 relative border-r border-gray-200 dark:border-gray-700"
      style={{ width: maxBooths > 0 ? 64 : 52, height: `${TOTAL_HOURS * PX_PER_HOUR}px` }}>
      {Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => {
        const hour = START_HOUR + i
        let used = 0
        if (maxBooths > 0 && i < TOTAL_HOURS) {
          const s = new Date(date); s.setHours(hour, 0, 0, 0)
          const e = new Date(date); e.setHours(hour + 1, 0, 0, 0)
          used = concurrentAt(lessons, s, e)
        }
        return (
          <div key={i} style={{ position: 'absolute', top: `${i * PX_PER_HOUR - 7}px` }}
            className="w-full leading-none flex items-center justify-end gap-1 pr-2">
            {maxBooths > 0 && i < TOTAL_HOURS && used > 0 && (
              <span className={`text-xs font-semibold tabular-nums ${used >= maxBooths ? 'text-red-500' : used >= maxBooths * 0.7 ? 'text-amber-500' : 'text-emerald-500'}`}>
                {used}
              </span>
            )}
            <span className="text-xs text-gray-400 dark:text-gray-500">{hour}:00</span>
          </div>
        )
      })}
    </div>
  )
}

// ─── BoothBadge ───────────────────────────────────────────────────────────────

function BoothBadge({ used, max, label }: { used: number; max: number; label?: string }) {
  const pct = used / max
  const colorClass = pct >= 1 ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
    : pct >= 0.7 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${colorClass}`}>
      {label && <span className="opacity-70">{label}:</span>}
      {used}/{max} ブース
      {pct >= 1 && <span>⚠️</span>}
    </span>
  )
}

// ─── DayView ──────────────────────────────────────────────────────────────────

function DayView({ date, lessons, maxBooths, onReschedule, onSlotClick, onLessonClick }: {
  date: Date; lessons: Lesson[]; maxBooths: number
  onReschedule: (id: number, t: Date) => void
  onSlotClick: (t: Date) => void
  onLessonClick: (l: Lesson) => void
}) {
  const dayLessons = lessons.filter(l => isSameDay(new Date(l.scheduledAt), date))
  const peakUsed = maxBooths > 0
    ? Math.max(0, ...Array.from({ length: TOTAL_HOURS }, (_, i) => {
        const s = new Date(date); s.setHours(START_HOUR + i, 0, 0, 0)
        const e = new Date(date); e.setHours(START_HOUR + i + 1, 0, 0, 0)
        return concurrentAt(dayLessons, s, e)
      }))
    : 0

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className={`px-4 py-2.5 border-b border-gray-200 dark:border-gray-700 ${isToday(date) ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'bg-gray-50 dark:bg-gray-900'}`}>
        <div className="flex items-center gap-2 flex-wrap">
          <p className={`font-semibold ${isToday(date) ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-200'}`}>
            {date.getFullYear()}年{date.getMonth()+1}月{date.getDate()}日（{DAYS_JP[date.getDay() === 0 ? 6 : date.getDay()-1]}）
          </p>
          {isToday(date) && <span className="text-xs bg-indigo-600 text-white px-1.5 py-0.5 rounded-full">今日</span>}
          {maxBooths > 0 && (
            <BoothBadge used={peakUsed} max={maxBooths} label="ピーク" />
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{dayLessons.length}件 · 空きスロットをクリックして追加</p>
      </div>
      <div className="overflow-y-auto" style={{ maxHeight: '70vh' }}>
        <div className="flex">
          <TimeLabels lessons={dayLessons} maxBooths={maxBooths} date={date} />
          <div className="flex-1 pr-1">
            <TimeGrid date={date} lessons={dayLessons} maxBooths={maxBooths} onReschedule={onReschedule} onSlotClick={onSlotClick} onLessonClick={onLessonClick} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── WeekView ─────────────────────────────────────────────────────────────────

function WeekView({ weekDates, lessons, maxBooths, onReschedule, onSlotClick, onLessonClick }: {
  weekDates: Date[]; lessons: Lesson[]; maxBooths: number
  onReschedule: (id: number, t: Date) => void
  onSlotClick: (t: Date) => void
  onLessonClick: (l: Lesson) => void
}) {
  const labelWidth = maxBooths > 0 ? 64 : 52
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="grid border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
        style={{ gridTemplateColumns: `${labelWidth}px repeat(7, 1fr)` }}>
        <div />
        {weekDates.map((d, i) => {
          const dayLessons = lessons.filter(l => isSameDay(new Date(l.scheduledAt), d))
          const peak = maxBooths > 0
            ? Math.max(0, ...Array.from({ length: TOTAL_HOURS }, (_, h) => {
                const s = new Date(d); s.setHours(START_HOUR + h, 0, 0, 0)
                const e = new Date(d); e.setHours(START_HOUR + h + 1, 0, 0, 0)
                return concurrentAt(dayLessons, s, e)
              }))
            : 0
          return (
            <div key={i} className={`py-1.5 text-center border-l border-gray-200 dark:border-gray-700 ${isToday(d) ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}>
              <p className={`text-xs ${i === 5 ? 'text-blue-500' : i === 6 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>{DAYS_JP[i]}</p>
              <p className={`text-sm font-semibold ${isToday(d) ? 'text-indigo-600 dark:text-indigo-400' : i === 5 ? 'text-blue-600' : i === 6 ? 'text-red-600' : 'text-gray-700 dark:text-gray-200'}`}>
                {d.getDate()}
              </p>
              {maxBooths > 0 && peak > 0 && (
                <div className="flex justify-center mt-0.5">
                  <span className={`text-xs font-medium ${peak >= maxBooths ? 'text-red-500' : peak >= maxBooths * 0.7 ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {peak}/{maxBooths}
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div className="overflow-y-auto overflow-x-auto" style={{ maxHeight: '70vh' }}>
        <div className="grid min-w-[560px]" style={{ gridTemplateColumns: `${labelWidth}px repeat(7, 1fr)` }}>
          <TimeLabels lessons={lessons} maxBooths={0} />
          {weekDates.map((d, i) => {
            const dayLessons = lessons.filter(l => isSameDay(new Date(l.scheduledAt), d))
            return (
              <div key={i} className={`border-l border-gray-200 dark:border-gray-700 ${isToday(d) ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}>
                <TimeGrid date={d} lessons={dayLessons} maxBooths={maxBooths} onReschedule={onReschedule} onSlotClick={onSlotClick} onLessonClick={onLessonClick} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── MonthView ────────────────────────────────────────────────────────────────

function MonthView({ year, month, lessons, onDayClick }: {
  year: number; month: number; lessons: Lesson[]
  onDayClick: (d: Date) => void
}) {
  const firstDow = new Date(year, month, 1).getDay()
  const offset = firstDow === 0 ? 6 : firstDow - 1
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = Array.from({ length: Math.ceil((offset + daysInMonth) / 7) * 7 }, (_, i) => {
    const day = i - offset + 1
    return day >= 1 && day <= daysInMonth ? day : null
  })

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        {DAYS_JP.map((d, i) => (
          <div key={d} className={`py-2 text-center text-xs font-medium ${i === 5 ? 'text-blue-500' : i === 6 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          if (!day) return <div key={i} className="border-b border-r border-gray-100 dark:border-gray-700/50 h-28 bg-gray-50/30 dark:bg-gray-900/20" />
          const cellDate = new Date(year, month, day)
          const dayLessons = lessons.filter(l => isSameDay(new Date(l.scheduledAt), cellDate))
          const dow = i % 7
          return (
            <div key={i}
              className={`border-b border-r border-gray-100 dark:border-gray-700/50 h-28 p-1 cursor-pointer hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10 transition-colors
                ${isToday(cellDate) ? 'bg-indigo-50/60 dark:bg-indigo-900/20' : ''}`}
              onClick={() => onDayClick(cellDate)}>
              <span className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full
                ${isToday(cellDate) ? 'bg-indigo-600 text-white' : dow === 5 ? 'text-blue-500' : dow === 6 ? 'text-red-500' : 'text-gray-700 dark:text-gray-200'}`}>
                {day}
              </span>
              <div className="mt-0.5 space-y-0.5 overflow-hidden">
                {dayLessons.slice(0, 3).map(l => (
                  <div key={l.id} className="text-xs truncate rounded px-1 leading-tight text-white"
                    style={{ backgroundColor: courseColor(l.courseId), opacity: 0.85 }}>
                    {fmtTime(new Date(l.scheduledAt))} {l.courseName}
                  </div>
                ))}
                {dayLessons.length > 3 && <p className="text-xs text-gray-400 dark:text-gray-500 pl-1">+{dayLessons.length - 3}</p>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── YearView ─────────────────────────────────────────────────────────────────

function YearView({ year, lessons, onMonthClick }: {
  year: number; lessons: Lesson[]; onMonthClick: (month: number) => void
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 12 }, (_, m) => {
        const daysInMonth = new Date(year, m + 1, 0).getDate()
        const firstDow = new Date(year, m, 1).getDay()
        const offset = firstDow === 0 ? 6 : firstDow - 1
        const dayCounts = Array.from({ length: daysInMonth }, (_, d) => {
          const date = new Date(year, m, d + 1)
          return { d: d + 1, count: lessons.filter(l => isSameDay(new Date(l.scheduledAt), date)).length }
        })
        const total = dayCounts.reduce((s, d) => s + d.count, 0)
        const max = Math.max(1, ...dayCounts.map(d => d.count))

        return (
          <div key={m}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors"
            onClick={() => onMonthClick(m)}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{m + 1}月</p>
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{total}件</span>
            </div>
            <div className="grid grid-cols-7 gap-px">
              {DAYS_JP.map((d, i) => (
                <div key={d} className={`text-center text-gray-400 ${i === 5 ? 'text-blue-400' : i === 6 ? 'text-red-400' : ''}`} style={{ fontSize: 8 }}>{d[0]}</div>
              ))}
              {Array.from({ length: offset }, (_, i) => <div key={`e${i}`} />)}
              {dayCounts.map(({ d, count }) => {
                const intensity = count === 0 ? 0 : Math.min(4, Math.ceil((count / max) * 4))
                const colors = ['bg-gray-100 dark:bg-gray-700','bg-indigo-100 dark:bg-indigo-900/50','bg-indigo-300 dark:bg-indigo-700','bg-indigo-500 dark:bg-indigo-500','bg-indigo-700 dark:bg-indigo-300']
                return (
                  <div key={d} className={`rounded-sm ${colors[intensity]} ${isToday(new Date(year, m, d)) ? 'ring-1 ring-indigo-500' : ''}`}
                    style={{ aspectRatio: '1' }} title={`${m+1}/${d}: ${count}件`} />
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── TeacherView ──────────────────────────────────────────────────────────────

function TeacherView({ date, teachers, lessons, maxBooths, onReschedule, onSlotClick, onLessonClick }: {
  date: Date; teachers: Staff[]; lessons: Lesson[]; maxBooths: number
  onReschedule: (id: number, t: Date) => void
  onSlotClick: (t: Date, teacherId?: number) => void
  onLessonClick: (l: Lesson) => void
}) {
  const dayLessons = lessons.filter(l => isSameDay(new Date(l.scheduledAt), date))
  const filtered = teachers.filter(t => t.role === 'TEACHER')
  if (!filtered.length) return <div className="text-center py-12 text-gray-400 dark:text-gray-500">講師が登録されていません</div>

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className={`px-4 py-2 border-b border-gray-200 dark:border-gray-700 ${isToday(date) ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'bg-gray-50 dark:bg-gray-900'}`}>
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          {date.getMonth()+1}月{date.getDate()}日 講師別時間割
        </p>
      </div>
      <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: '70vh' }}>
        <div className="flex min-w-max">
          <TimeLabels />
          {filtered.map(teacher => {
            const tLessons = dayLessons.filter(l => l.teacherId === teacher.id)
            return (
              <div key={teacher.id} className="flex-shrink-0 border-l border-gray-200 dark:border-gray-700" style={{ width: 140 }}>
                <div className="px-2 py-1.5 text-center border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 sticky top-0">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-300 truncate">{teacher.fullName}</p>
                  <p className="text-xs text-gray-400">{tLessons.length}件</p>
                </div>
                <TimeGrid
                  date={date}
                  lessons={tLessons}
                  onReschedule={onReschedule}
                  onSlotClick={(t) => onSlotClick(t, teacher.id)}
                  onLessonClick={onLessonClick}
                />
              </div>
            )
          })}
          {/* Unassigned column */}
          <div className="flex-shrink-0 border-l border-gray-200 dark:border-gray-700" style={{ width: 140 }}>
            <div className="px-2 py-1.5 text-center border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 sticky top-0">
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500">未割当</p>
            </div>
            <TimeGrid
              date={date}
              lessons={dayLessons.filter(l => !l.teacherId)}
              onReschedule={onReschedule}
              onSlotClick={onSlotClick}
              onLessonClick={onLessonClick}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── LessonModal (create / quick-edit) ────────────────────────────────────────

interface ModalLesson {
  id?: number
  courseId: number | ''
  teacherId: number | ''
  studentId: number | ''
  classroom: string
  scheduledAt: string
  durationMin: number
  status: string
  note: string
  repeatWeeks: number
}

function LessonModal({ initial, courses, teachers, students, allLessons, maxBooths, onSave, onDelete, onClose, navigate }: {
  initial: Partial<ModalLesson>
  courses: Course[]; teachers: Staff[]; students: Student[]
  allLessons: Lesson[]; maxBooths: number
  onSave: (data: ModalLesson, isNew: boolean) => void
  onDelete?: () => void
  onClose: () => void
  navigate: (path: string) => void
}) {
  const [form, setForm] = useState<ModalLesson>({
    courseId: '', teacherId: '', studentId: '',
    classroom: '', scheduledAt: '', durationMin: 60,
    status: 'SCHEDULED', note: '', repeatWeeks: 1,
    ...initial,
  })
  const isNew = !form.id
  const set = (key: keyof ModalLesson, val: unknown) => setForm(f => ({ ...f, [key]: val }))

  // ブース利用数チェック
  const boothWarning = (() => {
    if (maxBooths <= 0 || !form.scheduledAt) return null
    const start = new Date(form.scheduledAt)
    if (isNaN(start.getTime())) return null
    const end = new Date(start.getTime() + form.durationMin * 60_000)
    // 新規: 全件対象 / 編集中: 自身を除外
    const others = allLessons.filter(l => l.status !== 'CANCELLED' && (isNew || l.id !== form.id))
    const concurrent = others.filter(l => {
      const s = new Date(l.scheduledAt)
      const e = new Date(s.getTime() + l.durationMin * 60_000)
      return s < end && e > start
    }).length
    if (concurrent >= maxBooths) return `満室（${concurrent}/${maxBooths} ブース使用中）`
    if (concurrent >= maxBooths * 0.7) return `残り ${maxBooths - concurrent} ブース`
    return null
  })()

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">{isNew ? '授業を追加' : '授業を編集'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none">×</button>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">コース *</label>
            <select value={form.courseId} onChange={e => set('courseId', Number(e.target.value))}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100">
              <option value="">選択してください</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">日時 *</label>
            <input type="datetime-local" value={form.scheduledAt} onChange={e => set('scheduledAt', e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" />
            {boothWarning && (
              <p className={`mt-1 text-xs font-medium flex items-center gap-1 ${boothWarning.startsWith('満室') ? 'text-red-500' : 'text-amber-500'}`}>
                {boothWarning.startsWith('満室') ? '🚫' : '⚠️'} {boothWarning}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">時間（分）</label>
              <input type="number" min={15} max={300} step={15} value={form.durationMin} onChange={e => set('durationMin', Number(e.target.value))}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">教室</label>
              <input type="text" value={form.classroom} onChange={e => set('classroom', e.target.value)} placeholder="A教室"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">担当講師</label>
            <select value={form.teacherId} onChange={e => set('teacherId', e.target.value ? Number(e.target.value) : '')}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100">
              <option value="">未割当</option>
              {teachers.filter(t => t.role === 'TEACHER').map(t => <option key={t.id} value={t.id}>{t.fullName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">生徒</label>
            <select value={form.studentId} onChange={e => set('studentId', e.target.value ? Number(e.target.value) : '')}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100">
              <option value="">未設定</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
            </select>
          </div>
          {!isNew && (
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">ステータス</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100">
                {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">メモ</label>
            <textarea value={form.note} onChange={e => set('note', e.target.value)} rows={2} placeholder="任意"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" />
          </div>
          {isNew && (
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3">
              <label className="block text-xs font-medium text-indigo-700 dark:text-indigo-300 mb-1">繰り返し登録（週単位）</label>
              <div className="flex items-center gap-2">
                <input type="range" min={1} max={20} value={form.repeatWeeks} onChange={e => set('repeatWeeks', Number(e.target.value))}
                  className="flex-1" />
                <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 w-16 text-right">
                  {form.repeatWeeks === 1 ? '繰り返しなし' : `${form.repeatWeeks}週分`}
                </span>
              </div>
              {form.repeatWeeks > 1 && (
                <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">{form.repeatWeeks}件の授業を一括登録</p>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 px-5 py-4 border-t border-gray-200 dark:border-gray-700 flex-wrap">
          {!isNew && (
            <>
              <button onClick={() => navigate(`/lessons/${form.id}`)}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">詳細を開く</button>
              <div className="flex-1" />
              {onDelete && (
                <button onClick={onDelete} className="text-sm text-red-500 hover:underline">削除</button>
              )}
            </>
          )}
          {isNew && <div className="flex-1" />}
          <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            キャンセル
          </button>
          <button
            onClick={() => {
              if (!form.courseId || !form.scheduledAt) return
              onSave(form, isNew)
            }}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
            {isNew ? (form.repeatWeeks > 1 ? `${form.repeatWeeks}件登録` : '登録') : '更新'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function LessonsPage() {
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<ViewMode>('week')
  const [baseDate, setBaseDate] = useState(new Date())
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [teachers, setTeachers] = useState<Staff[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [filterTeacherId, setFilterTeacherId] = useState('')
  const [filterCourseId, setFilterCourseId] = useState('')
  const [modalLesson, setModalLesson] = useState<Partial<ModalLesson> | null>(null)
  const [loading, setLoading] = useState(false)
  const [maxBooths, setMaxBooths] = useState(0)
  const [showBoothSettings, setShowBoothSettings] = useState(false)
  const [boothInput, setBoothInput] = useState('0')

  // Load static lists once
  useEffect(() => {
    getStaff().then(r => setTeachers(r.data))
    getStudents({}).then(r => setStudents(r.data))
    getCourses().then(r => setCourses(r.data))
    getSettings().then(r => {
      const val = parseInt(r.data['max_booths'] ?? '0', 10)
      setMaxBooths(isNaN(val) ? 0 : val)
      setBoothInput(String(isNaN(val) ? 0 : val))
    })
  }, [])

  // Compute date range based on view
  const getRange = useCallback((): { from: Date; to: Date } => {
    const d = new Date(baseDate)
    if (viewMode === 'day' || viewMode === 'teacher') {
      const from = new Date(d); from.setHours(0, 0, 0, 0)
      const to = new Date(d); to.setHours(23, 59, 59, 999)
      return { from, to }
    }
    if (viewMode === 'week') {
      const dates = getWeekDates(d)
      const from = new Date(dates[0]); from.setHours(0, 0, 0, 0)
      const to = new Date(dates[6]); to.setHours(23, 59, 59, 999)
      return { from, to }
    }
    if (viewMode === 'month') {
      const from = new Date(d.getFullYear(), d.getMonth(), 1)
      const to = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
      return { from, to }
    }
    if (viewMode === 'year') {
      const from = new Date(d.getFullYear(), 0, 1)
      const to = new Date(d.getFullYear(), 11, 31, 23, 59, 59)
      return { from, to }
    }
    // list: week
    const dates = getWeekDates(d)
    const from = new Date(dates[0]); from.setHours(0, 0, 0, 0)
    const to = new Date(dates[6]); to.setHours(23, 59, 59, 999)
    return { from, to }
  }, [viewMode, baseDate])

  const fetchLessons = useCallback(() => {
    const { from, to } = getRange()
    setLoading(true)
    getLessons(from.toISOString(), to.toISOString(), {
      teacherId: filterTeacherId ? Number(filterTeacherId) : undefined,
      courseId: filterCourseId ? Number(filterCourseId) : undefined,
    }).then(r => setLessons(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [getRange, filterTeacherId, filterCourseId])

  useEffect(() => { fetchLessons() }, [fetchLessons])

  // Navigation
  const navigate_ = (dir: 1 | -1) => {
    setBaseDate(prev => {
      const d = new Date(prev)
      if (viewMode === 'day' || viewMode === 'teacher') d.setDate(d.getDate() + dir)
      else if (viewMode === 'week' || viewMode === 'list') d.setDate(d.getDate() + dir * 7)
      else if (viewMode === 'month') d.setMonth(d.getMonth() + dir)
      else if (viewMode === 'year') d.setFullYear(d.getFullYear() + dir)
      return d
    })
  }

  const periodLabel = () => {
    const d = baseDate
    if (viewMode === 'day' || viewMode === 'teacher') return `${d.getMonth()+1}月${d.getDate()}日`
    if (viewMode === 'week' || viewMode === 'list') {
      const dates = getWeekDates(d)
      return `${dates[0].getMonth()+1}/${dates[0].getDate()} 〜 ${dates[6].getMonth()+1}/${dates[6].getDate()}`
    }
    if (viewMode === 'month') return `${d.getFullYear()}年${d.getMonth()+1}月`
    if (viewMode === 'year') return `${d.getFullYear()}年`
    return ''
  }

  const goToday = () => setBaseDate(new Date())

  // DnD reschedule
  const handleReschedule = async (lessonId: number, newTime: Date) => {
    try {
      await rescheduleLesson(lessonId, toLocalISOString(newTime))
      fetchLessons()
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'ブースが満員のため移動できません'
      alert(msg)
    }
  }

  // Slot click → open create modal
  const handleSlotClick = (time: Date, teacherId?: number) => {
    const pad = (n: number) => String(n).padStart(2, '0')
    const dt = `${time.getFullYear()}-${pad(time.getMonth()+1)}-${pad(time.getDate())}T${pad(time.getHours())}:${pad(time.getMinutes())}`
    setModalLesson({
      scheduledAt: dt,
      teacherId: teacherId ?? (filterTeacherId ? Number(filterTeacherId) : ''),
      courseId: filterCourseId ? Number(filterCourseId) : '',
    })
  }

  // Lesson click → open edit modal
  const handleLessonClick = (lesson: Lesson) => {
    const dt = new Date(lesson.scheduledAt)
    const pad = (n: number) => String(n).padStart(2, '0')
    setModalLesson({
      id: lesson.id,
      courseId: lesson.courseId,
      teacherId: lesson.teacherId ?? '',
      studentId: lesson.studentId ?? '',
      classroom: lesson.classroom ?? '',
      scheduledAt: `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`,
      durationMin: lesson.durationMin,
      status: lesson.status,
      note: lesson.note ?? '',
      repeatWeeks: 1,
    })
  }

  // Save modal
  const handleSave = async (data: ModalLesson, isNew: boolean) => {
    const payload = {
      courseId: Number(data.courseId),
      teacherId: data.teacherId ? Number(data.teacherId) : undefined,
      studentId: data.studentId ? Number(data.studentId) : undefined,
      classroom: data.classroom || undefined,
      scheduledAt: data.scheduledAt,
      durationMin: data.durationMin,
      status: data.status,
      note: data.note || undefined,
    }
    try {
      if (isNew) {
        if (data.repeatWeeks > 1) {
          await bulkCreateLessons(payload, data.repeatWeeks)
        } else {
          await createLesson(payload)
        }
      } else {
        await updateLesson(data.id!, payload)
      }
      setModalLesson(null)
      fetchLessons()
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? '保存に失敗しました'
      alert(msg)
    }
  }

  const handleSaveBooths = async () => {
    const val = Math.max(0, parseInt(boothInput, 10) || 0)
    try {
      await updateSetting('max_booths', String(val))
      setMaxBooths(val)
      setShowBoothSettings(false)
    } catch {
      alert('設定の保存に失敗しました')
    }
  }

  const handleDelete = async () => {
    if (!modalLesson?.id) return
    if (!confirm('この授業を削除しますか？')) return
    try {
      await deleteLesson(modalLesson.id)
      setModalLesson(null)
      fetchLessons()
    } catch {
      alert('削除に失敗しました')
    }
  }

  const weekDates = getWeekDates(baseDate)

  const VIEW_BUTTONS: { mode: ViewMode; label: string }[] = [
    { mode: 'day', label: '日' },
    { mode: 'week', label: '週' },
    { mode: 'month', label: '月' },
    { mode: 'year', label: '年' },
    { mode: 'teacher', label: '講師別' },
    { mode: 'list', label: 'リスト' },
  ]

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">授業スケジュール</h1>
        <button onClick={() => setModalLesson({})}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 min-h-[44px] flex items-center gap-1">
          + 授業追加
        </button>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 mb-4 flex flex-wrap gap-3 items-center">
        {/* Navigation */}
        <div className="flex items-center gap-1">
          <button onClick={() => navigate_(-1)}
            className="min-w-[36px] min-h-[36px] flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold">‹</button>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200 w-44 text-center">{periodLabel()}</span>
          <button onClick={() => navigate_(1)}
            className="min-w-[36px] min-h-[36px] flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold">›</button>
          <button onClick={goToday} className="ml-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline px-1">今日</button>
        </div>

        {/* View mode */}
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {VIEW_BUTTONS.map(({ mode, label }) => (
            <button key={mode} onClick={() => setViewMode(mode)}
              className={`px-2.5 py-1.5 text-xs font-medium transition-colors ${viewMode === mode
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <select value={filterTeacherId} onChange={e => setFilterTeacherId(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-xs bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100">
          <option value="">全講師</option>
          {teachers.filter(t => t.role === 'TEACHER').map(t => <option key={t.id} value={t.id}>{t.fullName}</option>)}
        </select>
        <select value={filterCourseId} onChange={e => setFilterCourseId(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-xs bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100">
          <option value="">全コース</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <div className="ml-auto flex items-center gap-2">
          {loading && <span className="text-xs text-gray-400 dark:text-gray-500">読み込み中...</span>}
          <span className="text-xs text-gray-500 dark:text-gray-400">{lessons.length}件</span>
          <button onClick={() => { setBoothInput(String(maxBooths)); setShowBoothSettings(true) }}
            className="flex items-center gap-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2.5 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
            title="ブース設定">
            <span>🏫</span>
            <span>{maxBooths > 0 ? `${maxBooths}ブース` : 'ブース設定'}</span>
          </button>
        </div>
      </div>

      {/* Course color legend */}
      {courses.length > 0 && (viewMode === 'day' || viewMode === 'week' || viewMode === 'teacher') && (
        <div className="flex flex-wrap gap-2 mb-3">
          {courses.map(c => (
            <span key={c.id} className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
              <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: courseColor(c.id) }} />
              {c.name}
            </span>
          ))}
        </div>
      )}

      {/* Views */}
      {viewMode === 'day' && (
        <DayView date={baseDate} lessons={lessons} maxBooths={maxBooths} onReschedule={handleReschedule} onSlotClick={handleSlotClick} onLessonClick={handleLessonClick} />
      )}

      {viewMode === 'week' && (
        <WeekView weekDates={weekDates} lessons={lessons} maxBooths={maxBooths} onReschedule={handleReschedule} onSlotClick={handleSlotClick} onLessonClick={handleLessonClick} />
      )}

      {viewMode === 'month' && (
        <MonthView
          year={baseDate.getFullYear()} month={baseDate.getMonth()} lessons={lessons}
          onDayClick={(d) => { setBaseDate(d); setViewMode('day') }}
        />
      )}

      {viewMode === 'year' && (
        <YearView
          year={baseDate.getFullYear()} lessons={lessons}
          onMonthClick={(m) => { const d = new Date(baseDate); d.setMonth(m); setBaseDate(d); setViewMode('month') }}
        />
      )}

      {viewMode === 'teacher' && (
        <TeacherView date={baseDate} teachers={teachers} lessons={lessons} maxBooths={maxBooths} onReschedule={handleReschedule} onSlotClick={handleSlotClick} onLessonClick={handleLessonClick} />
      )}

      {viewMode === 'list' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                {['日時','コース','生徒','担当','時間','ステータス',''].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {lessons.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">授業がありません</td></tr>
              )}
              {[...lessons].sort((a,b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()).map(l => {
                const dt = new Date(l.scheduledAt)
                return (
                  <tr key={l.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" onClick={() => handleLessonClick(l)}>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-100 whitespace-nowrap">
                      <span className="w-2 h-2 rounded-full inline-block mr-2 flex-shrink-0" style={{ backgroundColor: courseColor(l.courseId) }} />
                      {dt.getMonth()+1}/{dt.getDate()}（{DAYS_JP[dt.getDay() === 0 ? 6 : dt.getDay()-1]}）
                      <span className="ml-1 text-gray-500 dark:text-gray-400">{fmtTime(dt)}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{l.courseName}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{l.studentName ?? '-'}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{l.teacherName ?? '-'}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{l.durationMin}分</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[l.status]}`}>{STATUS_LABEL[l.status]}</span>
                    </td>
                    <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                      <button onClick={() => navigate(`/lessons/${l.id}`)} className="text-indigo-600 dark:text-indigo-400 hover:underline text-xs">詳細</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalLesson !== null && (
        <LessonModal
          initial={modalLesson}
          courses={courses} teachers={teachers} students={students}
          allLessons={lessons} maxBooths={maxBooths}
          onSave={handleSave}
          onDelete={modalLesson.id ? handleDelete : undefined}
          onClose={() => setModalLesson(null)}
          navigate={navigate}
        />
      )}

      {/* ブース設定モーダル */}
      {showBoothSettings && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowBoothSettings(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-800 dark:text-gray-100">ブース設定</h2>
              <button onClick={() => setShowBoothSettings(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">最大ブース数</label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  同時に授業可能な部屋・ブースの数を設定します。0 に設定すると制限なしになります。
                </p>
                <div className="flex items-center gap-3">
                  <input type="number" min={0} max={99} value={boothInput}
                    onChange={e => setBoothInput(e.target.value)}
                    className="w-24 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-lg font-semibold text-center bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" />
                  <span className="text-gray-500 dark:text-gray-400 text-sm">ブース</span>
                </div>
                {parseInt(boothInput) > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {Array.from({ length: Math.min(parseInt(boothInput), 20) }, (_, i) => (
                      <span key={i} className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-lg flex items-center justify-center text-xs font-medium">
                        {i + 1}
                      </span>
                    ))}
                    {parseInt(boothInput) > 20 && <span className="text-xs text-gray-400">…</span>}
                  </div>
                )}
                {parseInt(boothInput) === 0 && (
                  <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">制限なし（ブース管理を使用しない）</p>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-200 dark:border-gray-700">
              <button onClick={() => setShowBoothSettings(false)}
                className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                キャンセル
              </button>
              <button onClick={handleSaveBooths}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
