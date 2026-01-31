import { Skeleton } from '@/components/ui/skeleton'

export function AgentCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-6">
      <Skeleton className="h-12 w-12 rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <Skeleton className="mt-auto h-4 w-28" />
    </div>
  )
}
