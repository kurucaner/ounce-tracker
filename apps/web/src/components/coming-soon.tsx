import { Wrench } from 'lucide-react';

interface ComingSoonProps {
  title?: string;
  description?: string;
}

export const ComingSoon = ({ 
  title = "Coming Soon", 
  description = "We're working on something special. Check back soon!" 
}: ComingSoonProps) => {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-muted p-6">
            <Wrench className="h-12 w-12 text-muted-foreground" />
          </div>
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

ComingSoon.displayName = 'ComingSoon';

