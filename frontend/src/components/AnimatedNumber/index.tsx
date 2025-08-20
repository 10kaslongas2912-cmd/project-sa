
import { useState, useEffect, useRef } from 'react';

interface AnimatedNumberProps {
    finalNumber: number;
    duration?: number; // Animation duration in milliseconds
}

const AnimatedNumber = ({ finalNumber, duration = 2000 }: AnimatedNumberProps) => {
    const [currentNumber, setCurrentNumber] = useState(0);
    const [hasAnimated, setHasAnimated] = useState(false);
    const numberRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated) {
                    setHasAnimated(true);
                }
            },
            { threshold: 0.5 } // Trigger when 50% of the component is visible
        );

        if (numberRef.current) {
            observer.observe(numberRef.current);
        }

        return () => {
            if (numberRef.current) {
                observer.unobserve(numberRef.current);
            }
        };
    }, [hasAnimated]);

    useEffect(() => {
        if (!hasAnimated) return; // Only animate if visible and not animated yet

        let startTime: number;
        const animationFrame = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const progressRatio = Math.min(progress / duration, 1);
            const displayNumber = Math.floor(finalNumber * progressRatio);

            setCurrentNumber(displayNumber);

            if (progress < duration) {
                requestAnimationFrame(animationFrame);
            } else {
                setCurrentNumber(finalNumber);
            }
        };

        const frameId = requestAnimationFrame(animationFrame);

        return () => cancelAnimationFrame(frameId);
    }, [finalNumber, duration, hasAnimated]);

    return <span ref={numberRef}>{currentNumber.toLocaleString()}</span>;
};

export default AnimatedNumber;
