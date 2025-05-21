
'use client';

import type { Message } from '@/lib/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Bot, User, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const [displayTime, setDisplayTime] = useState<string | null>(null);

  useEffect(() => {
    if (message.timestamp) {
      setDisplayTime(message.timestamp.toLocaleTimeString());
    }
  }, [message.timestamp]);

  return (
    <div className={cn('flex items-start gap-3 my-4', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback>
            <Bot className="h-5 w-5 text-primary" />
          </AvatarFallback>
        </Avatar>
      )}
      <Card className={cn('max-w-[75%] shadow-md', isUser ? 'bg-primary/20' : 'bg-card')}>
        <CardContent className="p-3">
          <p className="text-sm text-foreground whitespace-pre-wrap">{message.content}</p>
          {message.sources && message.sources.length > 0 && (
            <div className="mt-2 pt-2 border-t border-border">
              <h4 className="text-xs font-semibold text-muted-foreground mb-1">Sources:</h4>
              <ul className="space-y-1">
                {message.sources.map((source, index) => (
                  <li key={index} className="text-xs">
                    <a
                      href={source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-foreground hover:underline flex items-center gap-1"
                    >
                      {new URL(source).hostname}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
        {displayTime && (
           <CardFooter className="text-xs text-muted-foreground px-3 pb-2 pt-0 justify-end">
            {displayTime}
          </CardFooter>
        )}
      </Card>
      {isUser && (
         <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback>
            <User className="h-5 w-5 text-foreground" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
