import { useEffect, useRef, useState } from 'react';

const useInView = <R extends HTMLElement = HTMLDivElement>(
  options?: IntersectionObserverInit,
): [React.RefObject<R | null>, boolean] => {
  const [isInView, setIsInView] = useState<boolean>(false);
  const ref = useRef<R | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      {
        threshold: 0.1, // Adjust this threshold as needed
        ...options,
      },
    );

    const element = ref.current;
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [options]);

  return [ref, isInView];
};

export default useInView;
