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
        "group/card relative flex flex-col justify-between overflow-hidden",
        "rounded-[2px] border border-[var(--line-soft)] bg-[var(--ink-2)]",
        "p-7 sm:p-8 text-start min-h-[195px] sm:min-h-[210px]",
        "w-[380px] sm:w-[440px] shrink-0 h-auto",
        "transition-all duration-[450ms] ease-[var(--ease)]",
        "hover:-translate-y-1.5 hover:border-red hover:shadow-[0_24px_48px_-18px_rgba(204,0,1,0.35)]",
        className
      )}
    >
      {/* Decorative accent quote mark — grows and warms on hover */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-5 top-2 select-none font-display text-[72px] leading-none text-red/10 transition-all duration-500 ease-[var(--ease)] group-hover/card:scale-110 group-hover/card:text-red/25"
      >
        &rdquo;
      </span>

      {/* Quote Message */}
      <p className="relative text-sm sm:text-[15px] text-[var(--grey)] leading-relaxed font-normal">
        {text}
      </p>

      {/* Accent rule — widens on hover */}
      <div className="my-5 h-px w-10 bg-red transition-all duration-500 ease-[var(--ease)] group-hover/card:w-16" />

      {/* Footer: Avatar + Author Info */}
      <div className="relative flex items-center gap-3.5">
        <Avatar className="h-11 w-11 border border-[var(--line-soft)] shrink-0">
          <AvatarImage src={author?.avatar} alt={author?.name || 'Client'} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-start min-w-0">
          <h3 className="text-sm sm:text-base font-semibold leading-tight text-white font-display tracking-tight truncate w-full">
            {author?.name}
          </h3>
          <p className="text-xs font-medium text-[var(--grey)] truncate w-full mt-0.5">
            {author?.handle}
          </p>
        </div>
      </div>
    </Card>
  )
}
