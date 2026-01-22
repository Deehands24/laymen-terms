"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"

interface FadeInSectionProps {
  children: React.ReactNode
  delay?: number
}

// Shared observer management
const observerCallbacks = new WeakMap<Element, (entry: IntersectionObserverEntry) => void>();
let sharedObserver: IntersectionObserver | null = null;

function getSharedObserver() {
  // IntersectionObserver is not available on the server
  if (typeof window === "undefined") return null;

  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const callback = observerCallbacks.get(entry.target);
          if (callback) callback(entry);
        }
      });
    });
  }
  return sharedObserver;
}

export function FadeInSection({ children, delay = 0 }: FadeInSectionProps) {
  const [isVisible, setIsVisible] = useState(false)
  const domRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const { current } = domRef;
    if (!current) return;

    const observer = getSharedObserver();
    if (!observer) return;

    observerCallbacks.set(current, (entry) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          setIsVisible(true)
        }, delay)

        // Performance: Stop observing once visible to free up resources
        observer.unobserve(entry.target);
        observerCallbacks.delete(entry.target);
      }
    });

    observer.observe(current);

    return () => {
      // It's safe to call unobserve even if already unobserved
      observer.unobserve(current);
      observerCallbacks.delete(current);
    };
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
