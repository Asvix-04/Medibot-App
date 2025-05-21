'use client';

import type { FormEvent } from 'react';
import { useState, useRef } from 'react';
import { summarizeMedicalInformation } from '@/ai/flows/summarize-medical-info';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Loader2, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";


export function InfoSummarizerInterface() {
  const [query, setQuery] = useState('');
  const [summaryResult, setSummaryResult] = useState<{ summary: string; sources: string[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    setSummaryResult(null);

    try {
      const result = await summarizeMedicalInformation({ query: query.trim() });
      setSummaryResult(result);
    } catch (error) {
      console.error('Error getting summary:', error);
       toast({
        title: "Error",
        description: "Sorry, I couldn't process your request for a summary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.32))] md:h-[calc(100vh-theme(spacing.24))] space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Medical Information Summarizer</CardTitle>
          <CardDescription>
            Enter a medical topic or question, and I'll summarize information from reliable online sources.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., 'symptoms of flu' or 'managing diabetes'"
              className="flex-1 text-base"
              disabled={isLoading}
              aria-label="Medical query input"
            />
            <Button type="submit" disabled={isLoading || !query.trim()} size="icon" aria-label="Search for summary">
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Search className="h-5 w-5" />
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading && !summaryResult && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
           <p className="ml-3 text-muted-foreground">Fetching and summarizing information...</p>
        </div>
      )}

      {summaryResult && (
        <Card className="flex-1 shadow-lg overflow-hidden">
          <CardHeader>
            <CardTitle>Summary for: "{query}"</CardTitle>
          </CardHeader>
          <ScrollArea className="h-[calc(100%-100px)]"> {/* Adjust height as needed */}
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>{summaryResult.summary}</p>
              {summaryResult.sources && summaryResult.sources.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">Sources:</h3>
                  <ul className="space-y-2 list-disc pl-5">
                    {summaryResult.sources.map((source, index) => (
                      <li key={index}>
                        <a
                          href={source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent-foreground hover:underline flex items-center gap-1"
                        >
                          {source}
                          <ExternalLink className="h-4 w-4 inline-block ml-1" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </ScrollArea>
        </Card>
      )}
       {!isLoading && !summaryResult && query === '' && (
         <Alert className="bg-primary/10 border-primary/30">
          <Search className="h-4 w-4 !text-primary" />
          <AlertTitle className="text-primary">Ready to Summarize</AlertTitle>
          <AlertDescription>
            Enter a medical topic or question above to get started.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
