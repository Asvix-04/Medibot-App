
'use client';

import type { FormEvent } from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import type { Message } from '@/lib/types';
import { answerMedicalQuestions } from '@/ai/flows/answer-medical-questions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from './chat-message';
import { Send, Loader2, History, PlusCircle, MessageSquare } from 'lucide-react'; // Removed X
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  // SheetClose, // SheetClose is removed as the explicit X button is removed
} from "@/components/ui/sheet";
import { Separator } from '../ui/separator';

const MAX_HISTORY_LENGTH = 20; // Max messages kept in current session state
const MAX_DISPLAY_HISTORY_LENGTH = 50; // Max messages shown in history panel (could be different)

const initialGreetingMessage: Message = {
  id: 'initial-greeting', // Fixed ID for easy reset
  role: 'assistant',
  content: "Hello! I'm Medibot. How can I help you with your medical questions today? Please note, I am an AI assistant and not a medical professional. Always consult with a doctor for medical advice.",
  timestamp: new Date(),
};


export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([initialGreetingMessage]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // This would store all messages across sessions if we had persistence
  // For now, it's just the current session's messages, but structured for future use
  const [fullChatHistory, setFullChatHistory] = useState<Message[]>([initialGreetingMessage]);


  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom of main chat
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  }, [messages]);

  const addNewMessage = useCallback((message: Message) => {
    setMessages((prevMessages) => [...prevMessages, message].slice(-MAX_HISTORY_LENGTH));
    setFullChatHistory((prevHistory) => [...prevHistory, message].slice(-MAX_DISPLAY_HISTORY_LENGTH));
    // TODO: Point 6 - Persist chat history for model training
    // At certain intervals, or when a session "ends", this `fullChatHistory` (or new messages)
    // could be sent to a server action.
    // e.g., if (fullChatHistory.length % 10 === 0) { sendHistoryToServer(fullChatHistory); }
    // console.log("Current full chat history (for potential training data):", fullChatHistory);
  }, []);


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    addNewMessage(userMessage);
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
      addNewMessage(assistantMessage);
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
      addNewMessage(errorMessage);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const startNewChat = () => {
    // TODO: Point 6 - If there's significant history, this is a good point to send it for "training"
    // console.log("Starting new chat. Previous session history:", messages);
    // sendHistoryToServer(messages); // Example call

    setMessages([initialGreetingMessage]); // Reset to only initial greeting
    setFullChatHistory([initialGreetingMessage]); // Reset full history as well for this demo
    setInputValue('');
    setIsHistoryOpen(false); // Close history panel on new chat
    toast({ title: "New Chat Started", description: "Your previous conversation has been cleared from view." });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.32))] md:h-[calc(100vh-theme(spacing.24))] bg-background rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b flex justify-between items-center bg-card">
        <div className="flex items-center gap-2">
           <MessageSquare className="h-6 w-6 text-primary" />
           <h2 className="text-lg font-semibold text-foreground">Chat with Medibot</h2>
        </div>
        <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <History className="h-5 w-5" />
              <span className="sr-only">Toggle Chat History</span>
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:w-[400px] p-0 flex flex-col">
            <SheetHeader className="p-4 border-b">
              {/* The SheetClose X button has been removed from here */}
              <SheetTitle className="flex items-center justify-start">
                Chat History
              </SheetTitle>
            </SheetHeader>
            <div className="p-4 border-b">
              <Button onClick={startNewChat} className="w-full" variant="outline">
                <PlusCircle className="mr-2 h-4 w-4" /> New Chat
              </Button>
            </div>
            <ScrollArea className="flex-1 p-4">
              {fullChatHistory.length === 1 && fullChatHistory[0].id === 'initial-greeting' ? (
                <p className="text-sm text-muted-foreground text-center py-4">No chat history yet for this session.</p>
              ) : (
                <div className="space-y-4">
                  {fullChatHistory.map((msg) => (
                     <ChatMessage key={`${msg.id}-history`} message={msg} />
                  ))}
                </div>
              )}
            </ScrollArea>
             <div className="p-2 text-xs text-center text-muted-foreground border-t">
                Chat history is for the current session.
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {isLoading && messages[messages.length -1]?.role === 'user' && (
            <div className="flex items-start gap-3 my-4 justify-start">
               <Loader2 className="h-8 w-8 text-primary animate-spin shrink-0" />
               <span className="text-sm text-muted-foreground italic">Medibot is typing...</span>
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
