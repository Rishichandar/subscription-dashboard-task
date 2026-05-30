import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../utils/api'
import {
  CreditCard, Calendar, Clock, ArrowRight, AlertCircle,
  CheckCircle2, XCircle, Loader2, TrendingUp, Package
} from 'lucide-react'
import toast from 'react-hot-toast'

function StatusBadge({ status }) {
  const map = {
    active: { color: 'text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400', icon: CheckCircle2, label: 'Active' },
    expired: { color: 'text-amber-700 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400', icon: AlertCircle, label: 'Expired' },
    cancelled: { color: 'text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400', icon: XCircle, label: 'Cancelled' },
  }
  const s = map[status] || map.expired
  const Icon = s.icon
  return (
    <span className={`badge ${s.color}`}>
      <Icon size={12} /> {s.label}
    </span>
  )
}

function daysLeft(endDate) {
  const diff = new Date(endDate) - new Date()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export default function DashboardPage() {
  const { user } = useSelector((s) => s.auth)
  const [subscription, setSubscription] = useState(undefined)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [subRes, histRes] = await Promise.all([
        api.get('/my-subscription'),
        api.get('/my-subscription/history'),
      ])
      setSubscription(subRes.data.data)
      setHistory(histRes.data.data || [])
    } catch (err) {
      toast.error('Failed to load subscription data')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) return
    setCancelling(true)
    try {
      await api.post('/cancel-subscription')
      toast.success('Subscription cancelled')
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-brand-600" size={32} />
      </div>
    )
  }

  const remaining = subscription ? daysLeft(subscription.end_date) : 0
  const totalDays = subscription?.plan_id?.duration || 30
  const progress = Math.min(100, Math.round((remaining / totalDays) * 100))

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Here's your subscription overview
        </p>
      </div>


      {subscription ? (
        <div className="card p-6 animate-slide-up">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                  {subscription.plan_id?.name} Plan
                </h2>
                <StatusBadge status={subscription.status} />
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                ${subscription.plan_id?.price}/
                {subscription.plan_id?.duration === 365 ? 'year' : 'month'}
              </p>
            </div>
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="btn-secondary text-red-600 dark:text-red-400 border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-900/20 self-start"
            >
              {cancelling ? <Loader2 size={14} className="animate-spin" /> : null}
              Cancel subscription
            </button>
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-600 dark:text-slate-400 font-medium">
                {remaining} days remaining
              </span>
              <span className="text-slate-500 dark:text-slate-500">
                {totalDays} day plan
              </span>
            </div>
            <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  progress > 30 ? 'bg-brand-500' : progress > 10 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: Calendar,
                label: 'Start Date',
                value: new Date(subscription.start_date).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric'
                }),
              },
              {
                icon: Clock,
                label: 'Renewal Date',
                value: new Date(subscription.end_date).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric'
                }),
              },
              {
                icon: CreditCard,
                label: 'Amount Paid',
                value: subscription.amount_paid === 0 ? 'Free' : `$${subscription.amount_paid}`,
              },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div className="w-9 h-9 bg-brand-50 dark:bg-brand-900/30 rounded-lg flex items-center justify-center">
                  <Icon size={16} className="text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {subscription.plan_id?.features && (
            <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                Plan includes
              </p>
              <div className="flex flex-wrap gap-2">
                {subscription.plan_id.features.map((f) => (
                  <span
                    key={f}
                    className="px-2.5 py-1 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 text-xs rounded-lg"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="card p-10 text-center animate-slide-up">
          <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package size={24} className="text-slate-400" />
          </div>
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-2">
            No active subscription
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
            Choose a plan to get started with SubsTrack
          </p>
          <Link to="/plans" className="btn-primary inline-flex mx-auto">
            View Plans <ArrowRight size={16} />
          </Link>
        </div>
      )}

        {history.length > 0 && (
        <div className="card overflow-hidden animate-slide-up">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <TrendingUp size={16} className="text-slate-500" />
            <h3 className="font-semibold text-slate-900 dark:text-white">Subscription History</h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {history.map((sub) => (
              <div key={sub._id} className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                    <CreditCard size={14} className="text-slate-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {sub.plan_id?.name || 'Unknown'} Plan
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(sub.start_date).toLocaleDateString()} → {new Date(sub.end_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {sub.amount_paid === 0 ? 'Free' : `$${sub.amount_paid}`}
                  </span>
                  <StatusBadge status={sub.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
