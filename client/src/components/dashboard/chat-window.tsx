import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Bot, User, Loader2 } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatWindowProps {
  analysisId: string;
  filename: string;
}

export interface ChatWindowHandle {
  setInputAndFocus: (sku: string) => void;
}

export const ChatWindow = forwardRef<ChatWindowHandle, ChatWindowProps>(
  function ChatWindow({ analysisId, filename }, ref) {
    if (!analysisId) {
      return null; // Or show a message: "No analysis selected."
    }

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Expose setInputAndFocus to parent
    useImperativeHandle(ref, () => ({
      setInputAndFocus: (sku: string) => {
        setInputMessage(sku);
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
    }));

    // Load chat history when component mounts
    const { data: chatHistory, isLoading: historyLoading } = useQuery({
      queryKey: ['/api/chat', analysisId],
      enabled: !!analysisId, // Only run if analysisId is truthy
      queryFn: async () => {
        const response = await apiRequest("GET", `/api/chat/${analysisId}`);
        return response.json();
      }
    });

    // Handle chat history data changes
    useEffect(() => {
      if (chatHistory) {
        // The API returns { analysis: ..., chat: [...] }
        const chatMessages = chatHistory?.chat || chatHistory || [];
        if (chatMessages && chatMessages.length > 0) {
          const formattedMessages = chatMessages.map((msg: any) => ({
            id: msg.id,
            type: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content,
            timestamp: new Date(msg.created_at || msg.createdAt)
          }));
          setMessages(formattedMessages);
        } else {
          // Set welcome message if no history exists
          setMessages([{
            id: '1',
            type: 'assistant',
            content: `Hello! I'm your ClaimsLion AI assistant. I've already analyzed your file "${filename}". Feel free to ask me any questions about your insurance claims data, fraud detection, or risk assessment insights.`,
            timestamp: new Date()
          }]);
        }
      } else if (!historyLoading) {
        // Set welcome message if there's an error loading history
        setMessages([{
          id: '1',
          type: 'assistant',
          content: `Hello! I'm your ClaimsLion AI assistant. I've already analyzed your file "${filename}". Feel free to ask me any questions about your insurance claims data, fraud detection, or risk assessment insights.`,
          timestamp: new Date()
        }]);
      }
    }, [chatHistory, historyLoading, filename]);

    const chatMutation = useMutation({
      mutationFn: async (message: string) => {
        const response = await apiRequest("POST", `/api/chat/${analysisId}`, {
          message
        });
        return response.json();
      },
      onSuccess: (data) => {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          type: 'assistant',
          content: data.response,
          timestamp: new Date()
        }]);
      }
    });

    const handleSendMessage = () => {
      if (!inputMessage.trim()) return;

      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: inputMessage,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);
      chatMutation.mutate(inputMessage);
      setInputMessage('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    };

    useEffect(() => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
      }
    }, [messages]);

    return (
      <Card className="flex flex-col resize-y overflow-auto min-h-[300px] h-auto">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center">
            <MessageCircle className="text-accent mr-2 h-5 w-5" />
            ClaimsLion AI Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-4 space-y-4">
          <div className="flex-1 min-h-0">
            <ScrollArea className="h-full max-h-[380px] pr-4" ref={scrollAreaRef}>
              <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-slate-100 text-slate-900'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.type === 'assistant' && (
                        <Bot className="h-4 w-4 mt-0.5 text-accent" />
                      )}
                      {message.type === 'user' && (
                        <User className="h-4 w-4 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {chatMutation.isPending && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Bot className="h-4 w-4 text-accent" />
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-slate-600">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              </div>
            </ScrollArea>
          </div>
          
          <div className="flex space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your insurance claims data..."
              className="flex-1"
              disabled={chatMutation.isPending}
              ref={inputRef}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || chatMutation.isPending}
              className="bg-accent hover:bg-accent/90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
);