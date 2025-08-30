'use client';

import { useEffect, useRef, useState, useActionState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Send, ShieldAlert } from 'lucide-react';
import { moderateMessageAction } from '@/app/actions';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type ChatMessage = {
  id: number;
  user: string;
  avatar: string;
  message: string;
  moderated?: boolean;
};

const initialMessages: ChatMessage[] = [
  { id: 1, user: 'StreamBot', avatar: '/bot.png', message: 'Welcome to the stream! Please be respectful.' },
  { id: 2, user: 'Alice', avatar: 'https://picsum.photos/id/1011/32/32', message: 'So excited for this!' },
  { id: 3, user: 'Bob', avatar: 'https://picsum.photos/id/1025/32/32', message: 'Let\'s go! 🔥' },
];

const initialState = {
  message: '',
  user: '',
  moderated: false,
};

export function Chat({ streamId }: { streamId: string }) {
  const [state, formAction] = useActionState(moderateMessageAction, initialState);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const formRef = useRef<HTMLFormElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state?.message) {
      const newMessage: ChatMessage = {
        id: Date.now(),
        user: state.user,
        avatar: 'https://picsum.photos/id/1/32/32',
        message: state.message,
        moderated: state.moderated,
      };
      setMessages((prev) => [...prev, newMessage]);
      formRef.current?.reset();
    }
  }, [state]);

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Live Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full p-6" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={msg.avatar} />
                  <AvatarFallback>{msg.user.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{msg.user}</p>
                  <p className={cn(
                    "text-sm",
                    msg.moderated ? "text-destructive italic" : "text-muted-foreground"
                  )}>
                    {msg.moderated && <ShieldAlert className="inline-block w-4 h-4 mr-1"/>}
                    {msg.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <form ref={formRef} action={formAction} className="flex w-full items-center space-x-2">
          <Input id="message" name="message" placeholder="Send a message..." autoComplete="off" />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
