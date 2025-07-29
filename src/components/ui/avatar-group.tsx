import * as React from "react"

import { Avatar } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  limit?: number
}

export function AvatarGroup({
  className,
  limit = 3,
  ...props
}: AvatarGroupProps) {
  const slicedChildren = React.Children.toArray(props.children).slice(0, limit)
  const excess = React.Children.count(props.children) - limit

  return (
    <div className={cn("flex -space-x-2", className)} {...props}>
      {slicedChildren}
      {excess > 0 && (
        <Avatar className="bg-background flex h-8 w-8 ring-2 ring-background">
          <span className="flex h-full w-full items-center justify-center text-xs font-medium">
            +{excess}
          </span>
        </Avatar>
      )}
    </div>
  )
}