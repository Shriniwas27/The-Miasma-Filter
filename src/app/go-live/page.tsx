'use client';

import * as React from 'react';
import { useFormState } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { VideoPlayer } from '@/components/video-player';
import { streams } from '@/lib/data';
import { Clapperboard, Sparkles } from 'lucide-react';
import { generateTitlesAction } from '../actions';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const initialState = {
  suggestedTitles: [],
  suggestedDescriptions: [],
  error: undefined,
};

export default function GoLivePage() {
  const categories = [...new Set(streams.map((s) => s.category))];
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');

  const [state, formAction] = useFormState(generateTitlesAction, initialState);
  const { toast } = useToast();

  React.useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.error,
      });
    }
  }, [state, toast]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Go Live</h1>
        <p className="text-muted-foreground mt-2">Start your own broadcast to the world</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <Card>
          <CardHeader>
            <CardTitle>Stream Setup</CardTitle>
            <CardDescription>Configure your stream details before you start.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Stream Title</Label>
              <Input id="title" placeholder="e.g., My Awesome Live Stream" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <form action={formAction} className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="description">Description</Label>
                  <Button variant="outline" size="sm" type="submit">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Suggest Titles
                  </Button>
                </div>
                <Textarea id="description" name="description" placeholder="Tell viewers about your stream. The more detail, the better the AI suggestions!" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
              </div>
            </form>
            
            {state.suggestedTitles.length > 0 && (
              <div className="space-y-3 pt-2">
                <Label>AI Suggestions</Label>
                <div className="flex flex-wrap gap-2">
                  {state.suggestedTitles.map((suggestedTitle, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer hover:bg-primary/20 hover:border-primary text-left" onClick={() => setTitle(suggestedTitle)}>
                      {suggestedTitle}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category.toLowerCase()}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" size="lg">
              <Clapperboard className="mr-2 h-5 w-5" />
              Start Streaming
            </Button>
          </CardFooter>
        </Card>

        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Stream Preview</h2>
            <VideoPlayer />
        </div>
      </div>
    </div>
  );
}
