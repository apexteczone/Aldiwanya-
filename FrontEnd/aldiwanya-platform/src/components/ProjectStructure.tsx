import React from 'react'
import { FolderTree, FileCode, CheckCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'

export const ProjectStructure: React.FC = () => {
  const structure = [
    {
      path: 'src/components/',
      desc: 'Reusable UI components, layouts, and feature widgets',
      highlight: true
    },
    {
      path: 'src/components/ui/',
      desc: 'Atomic design system tokens (Button, Card, Badge, etc.)',
      highlight: true
    },
    {
      path: 'src/hooks/',
      desc: 'Custom React hooks (e.g. useLocalStorage, useFetch)',
      highlight: false
    },
    {
      path: 'src/types/',
      desc: 'Shared TypeScript interfaces and type definitions',
      highlight: false
    },
    {
      path: 'src/utils/',
      desc: 'Utility helper functions (e.g. cn for Tailwind merge)',
      highlight: false
    },
    {
      path: 'src/assets/',
      desc: 'Static media, logos, and vector illustrations',
      highlight: false
    },
    {
      path: 'src/App.tsx',
      desc: 'Root React view and routing entrypoint',
      highlight: true
    },
    {
      path: 'src/index.css',
      desc: 'Global Tailwind v4 styling and custom CSS variables',
      highlight: true
    },
  ]

  return (
    <section id="project-structure" className="mt-14 scroll-mt-24">
      <div className="flex items-center gap-2 mb-2">
        <FolderTree className="w-5 h-5 text-cyan-400" />
        <h2 className="text-2xl font-bold tracking-tight text-white">Project Structure</h2>
      </div>
      <p className="text-sm text-slate-400 mb-6">
        Clean, modular architecture designed for rapid feature development and easy scaling.
      </p>

      <Card className="bg-slate-900/40 border-slate-800/80">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {structure.map((item) => (
            <div
              key={item.path}
              className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                item.highlight
                  ? 'bg-slate-900/80 border-cyan-500/20 hover:border-cyan-500/40'
                  : 'bg-slate-950/40 border-slate-800/60 hover:border-slate-700'
              }`}
            >
              <div className="p-2 rounded-lg bg-slate-800/80 text-cyan-400 mt-0.5">
                <FileCode className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-semibold text-slate-200">
                    {item.path}
                  </span>
                  {item.highlight && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/50">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Ready
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </section>
  )
}
