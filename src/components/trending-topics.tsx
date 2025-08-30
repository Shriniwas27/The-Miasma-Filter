'use client';

import { useEffect, useState } from 'react';
import { getTrendingTopicsAction } from '@/app/actions';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export function TrendingTopics() {
  const [topics, setTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTopics() {
      try {
        const result = await getTrendingTopicsAction();
        setTopics(result.trendingTopics || []);
      } catch (error) {
        console.error('Failed to fetch trending topics:', error);
        setTopics(['Gaming', 'News', 'Music', 'Tech']); // Fallback topics
      } finally {
        setLoading(false);
      }
    }
    fetchTopics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-wrap gap-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-6 w-24 rounded-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {topics.map((topic, index) => (
        <Badge
          key={index}
          variant="secondary"
          className="px-4 py-1 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          {topic}
        </Badge>
      ))}
    </div>
  );
}
