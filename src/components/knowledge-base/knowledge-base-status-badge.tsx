'use client'

import { Badge } from '@/components/ui/badge'
import type { WatsonKnowledgeBaseStatus } from '@/types/watson'
import { AlertCircle, CheckCircle2, Clock, Loader2 } from 'lucide-react'

interface KnowledgeBaseStatusBadgeProps {
  status: WatsonKnowledgeBaseStatus
  statusMsg?: string
  className?: string
}

const statusConfig: Record<
  WatsonKnowledgeBaseStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof CheckCircle2 }
> = {
  ready: {
    label: 'Ready',
    variant: 'default',
    icon: CheckCircle2,
  },
  not_ready: {
    label: 'Not Ready',
    variant: 'secondary',
    icon: Clock,
  },
  processing: {
    label: 'Processing',
    variant: 'outline',
    icon: Loader2,
  },
  error: {
    label: 'Error',
    variant: 'destructive',
    icon: AlertCircle,
  },
}

export function KnowledgeBaseStatusBadge({ status, statusMsg, className }: KnowledgeBaseStatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.not_ready
  const Icon = config.icon

  return (
    <Badge
      variant={config.variant}
      className={className}
      title={statusMsg ?? config.label}
    >
      <Icon
        className={`mr-1 h-3 w-3 ${status === 'processing' ? 'animate-spin' : ''}`}
      />
      {config.label}
    </Badge>
  )
}
