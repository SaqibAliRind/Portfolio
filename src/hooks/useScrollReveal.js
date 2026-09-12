import { useEffect, useRef } from 'react';

/**
 * Custom hook for triggering CSS animations when an element enters the viewport.
 * 
 * @param {Object} options - IntersectionObserver options
 * @param {boolean} triggerOnce - If true, animation only plays the first time it enters viewport
 * @returns {React.RefObject} Ref to attach to the target element
 */
const useScrollReveal = (options = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }, triggerOnce = true) => {
  const ref = useRef(null);

  useEffect(() => {
    // Respect reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      if (ref.current) {
        ref.current.classList.add('reveal-visible');
      }
      return;
    }

    const currentRef = ref.current;
    
    if (!currentRef) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
          if (triggerOnce) {
            observer.unobserve(entry.target);
          }
        } else if (!triggerOnce) {
          entry.target.classList.remove('reveal-visible');
        }
      });
    }, options);

    observer.observe(currentRef);

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [options, triggerOnce]);

  return ref;
};

export default useScrollReveal;
