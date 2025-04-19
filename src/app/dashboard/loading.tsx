import { Loader2 } from 'lucide-react';

const Loading = () => {
  return (
    <div className="flex min-h-[400px] flex-1 items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
};

export default Loading;
