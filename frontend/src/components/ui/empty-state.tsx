import type { LucideIcon } from 'lucide-react';
import { Button } from './button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="w-full py-20 px-6 flex flex-col items-center justify-center text-center bg-card/50 border border-border border-dashed rounded-[2rem]">
      <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center text-muted-foreground mb-6">
        <Icon className="w-10 h-10" />
      </div>
      <h3 className="text-2xl font-display font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md mb-8">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="rounded-xl h-12 px-8">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
