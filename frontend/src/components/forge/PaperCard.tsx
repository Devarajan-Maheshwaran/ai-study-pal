import { ReactNode, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface PaperCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  interactive?: boolean;
  flush?: boolean;
}

export default function PaperCard({
  children,
  interactive = false,
  flush = false,
  className,
  ...rest
}: PaperCardProps) {
  return (
    <div
      className={cn(
        interactive ? 'card-paper-interactive' : 'card-paper',
        !flush && 'p-4 sm:p-5',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
