"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"

interface FadeInSectionProps {
  children: React.ReactNode
  delay?: number
}

// Shared observer state
const observerCallbacks = new WeakMap<Element, (entry: IntersectionObserverEntry) => void>()
let sharedObserver: IntersectionObserver | null = null

function getObserver() {
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const callback = observerCallbacks.get(entry.target)
          if (callback) callback(entry)
        }
      })
    })
  }
  return sharedObserver
}

/**
 * A component that fades in its children when they enter the viewport.
 *
 * Optimization:
 * - Uses a single shared IntersectionObserver instance for all components.
 * - Reduces memory overhead by avoiding N observer instances.
 * - Disconnects observation immediately after intersection.
 */
export function FadeInSection({ children, delay = 0 }: FadeInSectionProps) {
  const [isVisible, setIsVisible] = useState(false)
  const domRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = domRef.current
    if (!element) return

    const observer = getObserver()

    const handleIntersection = () => {
      // Stop observing this element
      observer.unobserve(element)
      observerCallbacks.delete(element)

      // Apply visibility with optional delay
      if (delay > 0) {
        setTimeout(() => {
          setIsVisible(true)
        }, delay)
      } else {
        setIsVisible(true)
      }
    }

    // Register callback
    observerCallbacks.set(element, handleIntersection)
    observer.observe(element)

    return () => {
      observer.unobserve(element)
      observerCallbacks.delete(element)
    }
  }, [delay])

  return (
    <div
      ref={domRef}
      className={`transition-opacity duration-1000 ease-in-out ${isVisible ? "opacity-100" : "opacity-0"}`}
    >
      {children}
    </div>
  )
}
