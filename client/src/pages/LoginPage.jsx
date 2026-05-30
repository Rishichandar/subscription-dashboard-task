import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser } from '../store/authSlice'
import { toggleTheme } from '../store/themeSlice'
import { Eye, EyeOff, Zap, Sun, Moon, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading } = useSelector((s) => s.auth)
  const { mode } = useSelector((s) => s.theme)
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await dispatch(loginUser(form))
    if (loginUser.fulfilled.match(res)) {
      toast.success('Welcome back!')
      navigate('/dashboard')
    } else {
      toast.error(res.payload)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      <div className="hidden lg:flex lg:w-1/2 bg-brand-600 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-brand-300 blur-3xl" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>
            <span className="font-display text-xl font-bold text-white">SubsTrack</span>
          </div>
        </div>
        <div className="relative">
          <h2 className="font-display text-4xl font-bold text-white mb-4">
            Manage subscriptions<br />with clarity.
          </h2>
          <p className="text-brand-200 text-lg">
            Track plans, monitor usage, and stay in control of your billing — all in one place.
          </p>
        </div>
        <div className="relative flex gap-3">
          {['Pro Plan', 'Active', '14 days left'].map((tag) => (
            <span key={tag} className="px-3 py-1.5 bg-white/10 rounded-full text-white/80 text-sm">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center p-6">
          <div className="flex lg:hidden items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-slate-900 dark:text-white">SubsTrack</span>
          </div>
          <div className="ml-auto">
            <button
              onClick={() => dispatch(toggleTheme())}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              {mode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-md animate-slide-up">
            <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Welcome back
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mb-8">Sign in to your account</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  className="input"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="input pr-11"
                    placeholder="Your password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-primary w-full justify-center py-3" disabled={loading}>
                {loading ? 'Signing in...' : (
                  <>Sign in <ArrowRight size={16} /></>
                )}
              </button>
            </form>

            <div className="mt-6 p-4 rounded-xl bg-slate-100 dark:bg-slate-800/50">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-2">Demo credentials</p>
              <p className="text-xs font-mono text-slate-600 dark:text-slate-300">Admin: admin@example.com / admin123</p>
              <p className="text-xs font-mono text-slate-600 dark:text-slate-300">User: user@example.com / user1234</p>
            </div>

            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-brand-600 hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
