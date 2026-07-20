import React from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export function TestimonialCard({ 
  author,
  text,
  href,
  className
}) {
  const Card = href ? 'a' : 'div'
  
  const initials = author?.name
    ? author.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'AV'

  return (
    <Card
      {...(href ? { href, target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn(
        "flex flex-col rounded-2xl border border-white/10",
        "bg-zinc-900/80 backdrop-blur-md",
        "p-8 text-start min-h-[160px] sm:min-h-[175px]",
        "hover:border-red-500/40 hover:bg-zinc-900/95 hover:shadow-xl hover:shadow-red-600/10",
        "w-[420px] sm:w-[480px] shrink-0 h-auto",
        "transition-all duration-300 group/card",
        className
      )}
    >
      {/* Header: Avatar + Author Info */}
      <div className="flex items-center gap-4">
        <Avatar className="h-13 w-13 border border-white/15 shrink-0">
          <AvatarImage src={author?.avatar} alt={author?.name || 'Client'} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-start min-w-0">
          <h3 className="text-base sm:text-lg font-semibold leading-tight text-white tracking-tight truncate w-full">
            {author?.name}
          </h3>
          <p className="text-xs font-medium text-zinc-400 truncate w-full mt-0.5">
            {author?.handle}
          </p>
        </div>
      </div>

      {/* Quote Message */}
      <p className="text-sm sm:text-[15px] mt-4 text-zinc-200 leading-relaxed font-normal">
        "{text}"
      </p>
    </Card>
  )
}
