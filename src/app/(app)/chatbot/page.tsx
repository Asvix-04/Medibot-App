import { ChatInterface } from '@/components/chat/chat-interface';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function ChatbotPage() {
  return (
    <div className="container mx-auto py-2 h-full">
        <ChatInterface />
    </div>
  );
}
