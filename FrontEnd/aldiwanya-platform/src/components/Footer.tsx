import React from 'react'
import { Sparkles, Terminal } from 'lucide-react'

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-slate-800/80 bg-slate-950 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span className="font-semibold text-slate-200">TechZone</span>
          <span>•</span>
          <span>Configured & Ready for Development</span>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            React 19 + TypeScript + Tailwind CSS v4
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-blue-400" />
            Vite 8 Powered
          </span>
        </div>
      </div>
    </footer>
  )
}
