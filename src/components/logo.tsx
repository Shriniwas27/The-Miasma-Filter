import { Tv2 } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Tv2 className="h-8 w-8 text-primary" />
      <h1 className="text-2xl font-bold text-white hidden group-data-[state=expanded]:block">
        StreamVerse
      </h1>
    </div>
  );
}
