import { Zap } from 'lucide-react'

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center animate-pulse-slow">
          <Zap size={24} className="text-white" />
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Loading SubsTrack...</p>
      </div>
    </div>
  )
}
