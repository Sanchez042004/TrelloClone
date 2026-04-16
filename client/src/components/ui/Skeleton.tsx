import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'rect' | 'circle';
}

const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'rect' }) => {
    const baseClasses = "bg-[#ffffff10] animate-pulse";
    
    const variantClasses = {
        text: "h-3 w-full rounded",
        rect: "w-full rounded-[8px]",
        circle: "rounded-full"
    };

    return (
        <div 
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        />
    );
};

export default Skeleton;
