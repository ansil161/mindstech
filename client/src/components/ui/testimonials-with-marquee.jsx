import React from "react"
import { cn } from "@/lib/utils"
import { TestimonialCard } from "@/components/ui/testimonial-card"

export function TestimonialsSection({ 
  title,
  description,
  testimonials = [],
  className 
}) {
  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  // Duplicate set enough times to ensure seamless infinite looping marquee
  const repeatCount = testimonials.length < 4 ? 4 : 2;

  return (
    <section className={cn(
      "text-[var(--white)] py-16 sm:py-20 px-0 relative overflow-hidden",
      className
    )}>
      <div className="mx-auto flex max-w-[1380px] flex-col items-center gap-6 text-center sm:gap-12">
        {(title || description) && (
          <div data-testimonials-head className="flex flex-col items-center gap-3 px-4 sm:gap-4">
            {title && (
              <h2 className="max-w-[750px] text-3xl font-bold leading-tight sm:text-4xl tracking-tight text-[var(--white)] font-display">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-sm max-w-[620px] font-medium text-[var(--grey)] sm:text-base">
                {description}
              </p>
            )}
          </div>
        )}

        <div data-testimonials-track className="relative flex w-full flex-col items-center justify-center overflow-hidden">
          <div className="group flex overflow-hidden p-2 [--gap:1.75rem] [gap:var(--gap)] flex-row [--duration:48s]">
            <div className="flex shrink-0 justify-around [gap:var(--gap)] animate-marquee flex-row group-hover:[animation-play-state:paused]">
              {[...Array(repeatCount)].map((_, setIndex) => (
                testimonials.map((testimonial, i) => (
                  <TestimonialCard 
                    key={`${setIndex}-${i}-${testimonial.author?.name || i}`}
                    {...testimonial}
                  />
                ))
              ))}
            </div>
          </div>

          {/* Side Gradients for smooth edge fade */}
          <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/4 bg-gradient-to-r from-[var(--ink,#060608)] to-transparent sm:block z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/4 bg-gradient-to-l from-[var(--ink,#060608)] to-transparent sm:block z-10" />
        </div>
      </div>
    </section>
  )
}
