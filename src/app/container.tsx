import React from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps {
  children: React.ReactNode;
  className?: string; // Optional className prop to pass additional classes
}

const Container = ({ children, className }: ContainerProps) => {
  return <div className={cn('mx-auto max-w-[1440px]', className)}>{children}</div>;
};

export default Container;
