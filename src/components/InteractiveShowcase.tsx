import React, { useState } from 'react'
import { Plus, Minus, RotateCcw, Copy, Check, Terminal, Sparkles, Sliders } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useLocalStorage } from '@/hooks/useLocalStorage'

export const InteractiveShowcase: React.FC = () => {
  const [count, setCount] = useLocalStorage<number>('techzone_counter', 0)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'components' | 'terminal'>('components')

  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            Interactive Playground
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Test state management, TypeScript types, and Tailwind styles in real-time.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('components')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'components'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Components & State
          </button>
          <button
            onClick={() => setActiveTab('terminal')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'terminal'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Terminal Commands
          </button>
        </div>
      </div>

      {activeTab === 'components' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* State Demo Card */}
          <Card glow className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Reactive State</span>
                <h3 className="text-lg font-bold text-white mt-0.5">Persistent Counter</h3>
              </div>
              <Badge variant="cyan">Hook: useLocalStorage</Badge>
            </div>

            <p className="text-sm text-slate-400">
              State is persisted to <code className="text-cyan-300 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">localStorage</code> automatically. Refresh your browser to verify persistence!
            </p>

            <div className="flex items-center justify-center p-8 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <span className="text-6xl font-black font-mono tracking-tighter bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                {count}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                onClick={() => setCount((c) => c + 1)}
                className="flex-1"
              >
                <Plus className="w-4 h-4" />
                Increment
              </Button>
              <Button
                variant="secondary"
                onClick={() => setCount((c) => Math.max(0, c - 1))}
                className="flex-1"
              >
                <Minus className="w-4 h-4" />
                Decrement
              </Button>
              <Button
                variant="outline"
                onClick={() => setCount(0)}
                title="Reset counter"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </Card>

          {/* Design System UI Tokens Showcase */}
          <Card glow className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">Design System</span>
                <h3 className="text-lg font-bold text-white mt-0.5">Pre-built UI Elements</h3>
              </div>
              <Badge variant="purple">Tailwind v4</Badge>
            </div>

            <p className="text-sm text-slate-400">
              Modular components located in <code className="text-purple-300 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">src/components/ui/</code>.
            </p>

            {/* Buttons Preview */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-slate-400">Button Variants:</span>
              <div className="flex flex-wrap gap-2.5">
                <Button variant="primary" size="sm">Primary</Button>
                <Button variant="secondary" size="sm">Secondary</Button>
                <Button variant="outline" size="sm">Outline</Button>
                <Button variant="glow" size="sm">Glow</Button>
                <Button variant="ghost" size="sm">Ghost</Button>
              </div>
            </div>

            {/* Badges Preview */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-medium text-slate-400">Badges:</span>
              <div className="flex flex-wrap gap-2">
                <Badge variant="cyan">Cyan</Badge>
                <Badge variant="purple">Purple</Badge>
                <Badge variant="emerald">Emerald</Badge>
                <Badge variant="amber">Amber</Badge>
                <Badge variant="neutral">Neutral</Badge>
              </div>
            </div>

            <div className="pt-2 text-xs text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Fully styled with utility classes and zero runtime overhead.
            </div>
          </Card>
        </div>
      ) : (
        <Card className="bg-slate-950/80 border-slate-800">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-semibold text-white">Frontend Workflow Commands</span>
            </div>
            <span className="text-xs font-mono text-slate-500">npm scripts</span>
          </div>

          <div className="mt-4 space-y-3 font-mono text-xs">
            {[
              { cmd: 'npm run dev', desc: 'Start Vite development server with lightning-fast HMR' },
              { cmd: 'npm run build', desc: 'Type-check with tsc and compile production bundle' },
              { cmd: 'npm run preview', desc: 'Locally preview production build' },
              { cmd: 'npm run lint', desc: 'Run ultra-fast Oxlint check' },
            ].map((item) => (
              <div
                key={item.cmd}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800/70 hover:border-slate-700 transition-colors gap-2"
              >
                <div>
                  <span className="text-cyan-300 font-bold select-all">{item.cmd}</span>
                  <p className="font-sans text-slate-400 text-xs mt-0.5">{item.desc}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyCommand(item.cmd)}
                  className="self-end sm:self-center h-8"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </section>
  )
}
