import { useEffect, useState } from 'react'
import { getNextYearPlan, saveNextYearPlan, getCourses, getStudents } from '../api'
import type { Course, Student } from '../types'

interface CoursePlan {
  courseId: number
  courseName: string
  currentCount: number
  capacity: number
  targetNew: number
  targetTotal: number
  memo: string
}

interface YearPlan {
  targetYear: number
  totalCapacity: number
  totalTargetNew: number
  totalTargetTotal: number
  coursePlans: CoursePlan[]
  memo: string
}

export default function NextYearPlanPage() {
  const nextYear = new Date().getFullYear() + 1
  const [targetYear, setTargetYear] = useState(nextYear)
  const [courses, setCourses] = useState<Course[]>([])
  const [currentStudents, setCurrentStudents] = useState<Student[]>([])
  const [plans, setPlans] = useState<Record<number, CoursePlan>>({})
  const [yearMemo, setYearMemo] = useState('')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getCourses(true),
      getStudents({ status: 'ACTIVE' }),
      getNextYearPlan(targetYear).catch(() => null),
    ]).then(([coursesRes, studentsRes, planRes]) => {
      const cs = coursesRes.data
      const sts = studentsRes.data
      setCourses(cs)
      setCurrentStudents(sts)

      const initPlans: Record<number, CoursePlan> = {}
      cs.forEach(c => {
        const currentCount = 0 // 実際の受講者数はコース別に別途取得が必要
        initPlans[c.id] = {
          courseId: c.id,
          courseName: c.name,
          currentCount,
          capacity: 20,
          targetNew: 5,
          targetTotal: 0,
          memo: '',
        }
      })

      if (planRes?.data) {
        const saved = planRes.data as YearPlan
        setYearMemo(saved.memo ?? '')
        saved.coursePlans?.forEach((cp: CoursePlan) => {
          if (initPlans[cp.courseId]) {
            initPlans[cp.courseId] = { ...initPlans[cp.courseId], ...cp }
          }
        })
      }
      setPlans(initPlans)
      setLoading(false)
    })
  }, [targetYear])

  const updatePlan = (courseId: number, field: keyof CoursePlan, value: number | string) => {
    setPlans(prev => ({
      ...prev,
      [courseId]: { ...prev[courseId], [field]: value }
    }))
  }

  const handleSave = async () => {
    const yearPlan: YearPlan = {
      targetYear,
      totalCapacity: Object.values(plans).reduce((s, p) => s + p.capacity, 0),
      totalTargetNew: Object.values(plans).reduce((s, p) => s + p.targetNew, 0),
      totalTargetTotal: Object.values(plans).reduce((s, p) => s + p.targetTotal, 0),
      coursePlans: Object.values(plans),
      memo: yearMemo,
    }
    await saveNextYearPlan(yearPlan)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const totalCurrentActive = currentStudents.length
  const totalCapacity = Object.values(plans).reduce((s, p) => s + p.capacity, 0)
  const totalTargetNew = Object.values(plans).reduce((s, p) => s + p.targetNew, 0)
  const totalTargetTotal = Object.values(plans).reduce((s, p) => s + (p.targetTotal || p.capacity), 0)

  if (loading) return <div className="text-gray-400 text-center py-12">読み込み中...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">来年度計画</h1>
        <div className="flex items-center gap-3">
          <select value={targetYear} onChange={e => setTargetYear(Number(e.target.value))}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100">
            {[nextYear, nextYear + 1, nextYear + 2].map(y => (
              <option key={y} value={y}>{y}年度</option>
            ))}
          </select>
          <button onClick={handleSave}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 min-h-[44px]">
            {saved ? '✓ 保存済み' : '保存'}
          </button>
        </div>
      </div>

      {/* サマリ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: '現在の在籍数', value: totalCurrentActive, unit: '名', color: 'text-gray-700 dark:text-gray-200' },
          { label: '定員合計', value: totalCapacity, unit: '名', color: 'text-indigo-600 dark:text-indigo-400' },
          { label: '新規目標', value: totalTargetNew, unit: '名', color: 'text-green-600 dark:text-green-400' },
          { label: '在籍目標合計', value: totalTargetTotal, unit: '名', color: 'text-blue-600 dark:text-blue-400' },
        ].map(card => (
          <div key={card.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">{card.label}</p>
            <p className={`text-2xl font-bold mt-1 ${card.color}`}>
              {card.value}<span className="text-sm font-normal text-gray-500 ml-1">{card.unit}</span>
            </p>
          </div>
        ))}
      </div>

      {/* コース別計画 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              {['コース名', '現在の在籍', '定員', '新規目標', '在籍目標', '稼働率', 'メモ'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {courses.map(course => {
              const plan = plans[course.id]
              if (!plan) return null
              const target = plan.targetTotal || plan.capacity
              const utilizationRate = plan.capacity > 0 ? Math.round(target / plan.capacity * 100) : 0
              return (
                <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{course.name}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{plan.currentCount}名</td>
                  <td className="px-4 py-3">
                    <input type="number" min={0} value={plan.capacity}
                      onChange={e => updatePlan(course.id, 'capacity', Number(e.target.value))}
                      className="w-20 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" />
                  </td>
                  <td className="px-4 py-3">
                    <input type="number" min={0} value={plan.targetNew}
                      onChange={e => updatePlan(course.id, 'targetNew', Number(e.target.value))}
                      className="w-20 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" />
                  </td>
                  <td className="px-4 py-3">
                    <input type="number" min={0} value={plan.targetTotal || plan.capacity}
                      onChange={e => updatePlan(course.id, 'targetTotal', Number(e.target.value))}
                      className="w-20 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${Math.min(utilizationRate, 100)}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{utilizationRate}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <input value={plan.memo}
                      onChange={e => updatePlan(course.id, 'memo', e.target.value)}
                      placeholder="メモ"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* 全体メモ */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{targetYear}年度 方針・備考</label>
        <textarea value={yearMemo} onChange={e => setYearMemo(e.target.value)} rows={4}
          placeholder="来年度の経営方針、重点施策などを記入..."
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" />
      </div>
    </div>
  )
}
