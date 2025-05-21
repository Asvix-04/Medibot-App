'use client';

import type { FormEvent } from 'react';
import { useState, useRef, useEffect } from 'react';
import type { Message } from '@/lib/types';
import { answerMedicalQuestions } from '@/ai/flows/answer-medical-questions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from './chat-message';
import { Send, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";


const MAX_HISTORY_LENGTH = 20;

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Set initial greeting message
    setMessages([
      {
        id: crypto.randomUUID(), // Safe to use here as it's in useEffect
        role: 'assistant',
        content: "Hello! I'm MediAssistant. How can I help you with your medical questions today? Please note, I am an AI assistant and not a medical professional. Always consult with a doctor for medical advice.",
        timestamp: new Date(),
      },
    ]);
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage].slice(-MAX_HISTORY_LENGTH));
    setInputValue('');
    setIsLoading(true);

    try {
      const aiResponse = await answerMedicalQuestions({ question: userMessage.content });
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: aiResponse.answer,
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, assistantMessage].slice(-MAX_HISTORY_LENGTH));
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast({
        title: "Error",
        description: "Sorry, I couldn't process your request. Please try again.",
        variant: "destructive",
      });
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again later.",
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage].slice(-MAX_HISTORY_LENGTH));
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.32))] md:h-[calc(100vh-theme(spacing.24))] bg-background rounded-lg shadow-lg overflow-hidden">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {isLoading && messages[messages.length -1]?.role === 'user' && (
            <div className="flex items-start gap-3 my-4 justify-start">
               <Loader2 className="h-8 w-8 text-primary animate-spin shrink-0" />
               <span className="text-sm text-muted-foreground italic">MediAssistant is typing...</span>
            </div>
          )}
        </div>
      </ScrollArea>
      <form
        onSubmit={handleSubmit}
        className="border-t bg-card p-4 flex items-center gap-2"
      >
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask a medical question..."
          className="flex-1 text-base"
          disabled={isLoading}
          aria-label="Medical question input"
        />
        <Button type="submit" disabled={isLoading || !inputValue.trim()} size="icon" aria-label="Send message">
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </form>
    </div>
  );
}
