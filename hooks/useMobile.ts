// hooks/use-mobile.ts

'use client';

import { useState, useEffect } from 'react';


export function useIsMobile(breakpoint: number = 768): boolean {
    const [isMobile, setIsMobile] = useState<boolean>(false);

    useEffect(() => {
        const checkIsMobile = () => {
            if (typeof window !== 'undefined') {
                return window.innerWidth <= breakpoint;
            }
            return false;
        };

        setIsMobile(checkIsMobile());

        const mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`);

        const handleChange = (event: MediaQueryListEvent) => {
            setIsMobile(event.matches);
        };

        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleChange);
        } else {
            mediaQuery.addListener(handleChange);
        }

        return () => {
            if (mediaQuery.removeEventListener) {
                mediaQuery.removeEventListener('change', handleChange);
            } else {
                mediaQuery.removeListener(handleChange);
            }
        };
    }, [breakpoint]);

    return isMobile;
}
