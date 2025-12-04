import { useState, useEffect, useRef } from "react";

export const UseIntersectionObserver = (options?: IntersectionObserverInit) => {
  const [isIntersecting, setIntersecting] = useState(false);
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIntersecting(entry.isIntersecting);
    }, options);
    
    if (targetRef.current) {
      observer.observe(targetRef.current);
    }

    return () => observer.disconnect();
  },[options]);

  return { targetRef, isIntersecting };
};