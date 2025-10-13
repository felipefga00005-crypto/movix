import { Button } from "@/components/ui/button"
import { IconPlus } from "@tabler/icons-react"

interface EmptyStateProps {
  title: string
  description: string
  actionLabel: string
  onAction: () => void
  icon?: React.ReactNode
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="flex flex-col items-center text-center max-w-md space-y-4">
        {icon && (
          <div className="rounded-full bg-muted p-4 text-muted-foreground">
            {icon}
          </div>
        )}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button onClick={onAction} size="sm">
          <IconPlus className="h-4 w-4" />
          {actionLabel}
        </Button>
      </div>
    </div>
  )
}

