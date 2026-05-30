import { useEffect, useState } from 'react'
import api from '../utils/api'
import {
  Users, TrendingUp, CreditCard, AlertCircle,
  Loader2, Search, Filter, DollarSign
} from 'lucide-react'
import toast from 'react-hot-toast'

function StatusBadge({ status }) {
  const map = {
    active: 'text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400',
    expired: 'text-amber-700 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400',
    cancelled: 'text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400',
    pending: 'text-blue-700 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400',
  }
  return (
    <span className={`badge ${map[status] || map.expired} capitalize`}>
      {status}
    </span>
  )
}

export default function AdminPage() {
  const [stats, setStats] = useState(null)
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchData()
  }, [filter])

  const fetchData = async () => {
    try {
      const [statsRes, subRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get(`/admin/subscriptions${filter ? `?status=${filter}` : ''}`),
      ])
      setStats(statsRes.data.data)
      setSubscriptions(subRes.data.data)
    } catch (err) {
      toast.error('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const filtered = subscriptions.filter((sub) => {
    if (!search) return true
    const name = sub.user_id?.name?.toLowerCase() || ''
    const email = sub.user_id?.email?.toLowerCase() || ''
    const plan = sub.plan_id?.name?.toLowerCase() || ''
    const q = search.toLowerCase()
    return name.includes(q) || email.includes(q) || plan.includes(q)
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-brand-600" size={32} />
      </div>
    )
  }

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Active Subscriptions', value: stats?.activeSubscriptions || 0, icon: TrendingUp, color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
    { label: 'Expired', value: stats?.expiredSubscriptions || 0, icon: AlertCircle, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Total Revenue', value: `$${stats?.totalRevenue || 0}`, icon: DollarSign, color: 'text-brand-600 bg-brand-50 dark:bg-brand-900/20' },
  ]

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Manage all subscriptions and users
        </p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon size={18} />
            </div>
            <p className="font-display text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search users, plans..."
              className="input pl-9 py-2"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-slate-400" />
            <select
              className="input py-2 w-auto"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50">
                {['User', 'Plan', 'Amount', 'Start Date', 'End Date', 'Status'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-400 dark:text-slate-600">
                    No subscriptions found
                  </td>
                </tr>
              ) : (
                filtered.map((sub) => (
                  <tr key={sub._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3.5">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{sub.user_id?.name || '—'}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{sub.user_id?.email || '—'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-medium text-slate-900 dark:text-white">
                        {sub.plan_id?.name || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-700 dark:text-slate-300">
                      {sub.amount_paid === 0 ? 'Free' : `$${sub.amount_paid}`}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400">
                      {new Date(sub.start_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400">
                      {new Date(sub.end_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={sub.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Showing {filtered.length} of {subscriptions.length} subscriptions
          </p>
        </div>
      </div>
    </div>
  )
}
