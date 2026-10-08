import React from 'react'
import { ExternalLink } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import type { TechStackItem } from '@/types'

export const TechStackCard: React.FC<{ item: TechStackItem }> = ({ item }) => {
  const getBadgeVariant = (category: TechStackItem['category']) => {
    switch (category) {
      case 'Framework':
        return 'cyan'
      case 'Language':
        return 'purple'
      case 'Styling':
        return 'emerald'
      case 'Tooling':
        return 'amber'
      default:
        return 'neutral'
    }
  }

  return (
    <Card glow className="flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge variant={getBadgeVariant(item.category)}>{item.category}</Badge>
          <span className="text-xs font-mono text-slate-400 bg-slate-950/60 px-2 py-0.5 rounded-md border border-slate-800">
            {item.version}
          </span>
        </div>
        <h3 className="text-lg font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
          {item.name}
        </h3>
        <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
          {item.description}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
        <a
          href={item.docsUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          Documentation
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </Card>
  )
}
