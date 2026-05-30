import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { Check, Zap, Crown, Building2, Rocket, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const planIcons = { Starter: Zap, Pro: Rocket, Business: Crown, Enterprise: Building2 }

export default function PlansPage() {
  const [plans, setPlans] = useState([])
  const [activeSub, setActiveSub] = useState(null)
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState(null)
  const { user } = useSelector((s) => s.auth)
  const navigate = useNavigate()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [plansRes, subRes] = await Promise.all([
        api.get('/plans'),
        api.get('/my-subscription'),
      ])
      setPlans(plansRes.data.data)
      setActiveSub(subRes.data.data)
    } catch (err) {
      toast.error('Failed to load plans')
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async (plan) => {
    setSubscribing(plan._id)
    console.log(plan,"plan")
    try {
      if (plan.price === 0) {
        const res = await api.post(`/subscribe/${plan._id}`)
        toast.success(res.data.message)
        setActiveSub(res.data.data)
        navigate('/dashboard')
        return
      }

      try {
        const intentRes = await api.post('/payment/create-intent', { planId: plan._id })
        console.log(intentRes)
        if (intentRes.data.free) {
          const res = await api.post(`/subscribe/${plan._id}`)
          toast.success(res.data.message)
          navigate('/dashboard')
          return
        }
        const confirmRes = await api.post('/payment/confirm', { planId: plan._id, paymentIntentId: null })
        toast.success('Payment simulated! Subscription activated.')
        navigate('/dashboard')
      } catch (stripeErr) {
        if (stripeErr.response?.data?.message?.includes('not configured')) {
         
          const res = await api.post(`/subscribe/${plan._id}`)
          toast.success(res.data.message)
          navigate('/dashboard')
        } else {
          throw stripeErr
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to subscribe')
    } finally {
      setSubscribing(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-brand-600" size={32} />
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-10 text-center">
        <h1 className="font-display text-4xl font-bold text-slate-900 dark:text-white mb-3">
          Choose your plan
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl mx-auto">
          Start free, upgrade when you need. All plans include core features.
        </p>
        {activeSub && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-full">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-green-700 dark:text-green-400 font-medium">
              Current plan: {activeSub.plan_id?.name}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const Icon = planIcons[plan.name] || Zap
          const isActive = activeSub?.plan_id?._id === plan._id
          const isLoading = subscribing === plan._id

          return (
            <div
              key={plan._id}
              className={`card p-6 flex flex-col relative transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
                plan.popular
                  ? 'ring-2 ring-brand-500 shadow-brand-100 dark:shadow-brand-900/20 shadow-lg'
                  : ''
              } ${isActive ? 'ring-2 ring-green-500' : ''}`}
            >
              {plan.popular && !isActive && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 bg-brand-600 text-white text-xs font-semibold rounded-full shadow-sm">
                    Most Popular
                  </span>
                </div>
              )}
              {isActive && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full shadow-sm">
                    Current Plan
                  </span>
                </div>
              )}

              <div className="mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: plan.color + '20' }}
                >
                  <Icon size={20} style={{ color: plan.color }} />
                </div>
                <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                  {plan.name}
                </h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-display text-3xl font-bold text-slate-900 dark:text-white">
                    {plan.price === 0 ? 'Free' : `$${plan.price}`}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-slate-500 dark:text-slate-400 text-sm">
                      /{plan.duration === 365 ? 'year' : 'month'}
                    </span>
                  )}
                </div>
              </div>

              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                    <Check size={15} className="text-green-500 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan)}
                disabled={isActive || isLoading}
                className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95 ${
                  isActive
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 cursor-default'
                    : plan.popular
                    ? 'bg-brand-600 hover:bg-brand-700 text-white'
                    : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={14} className="animate-spin" /> Processing...
                  </span>
                ) : isActive ? (
                  '✓ Active Plan'
                ) : plan.price === 0 ? (
                  'Get Started Free'
                ) : (
                  `Subscribe — $${plan.price}`
                )}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
