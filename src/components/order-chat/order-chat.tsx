'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { api } from '@/trpc/react';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { formatRelativeTime } from '@/lib/utils';
import toast from 'react-hot-toast';

// Define types for chat messages
interface ChatMessage {
  id: string;
  sender: 'CUSTOMER' | 'TAILOR' | 'SYSTEM';
  message: string;
  timestamp: string;
  senderName?: string;
}

interface OrderChatProps {
  orderId: number;
  isTailor?: boolean;
}

export function OrderChat({ orderId, isTailor = false }: OrderChatProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Fetch chat messages from the API
  const { 
    data, 
    isLoading,
    refetch 
  } = api.orderChat.getOrderChatMessages.useQuery(
    { orderId },
    { enabled: Boolean(orderId) && Boolean(user?.id) }
  );
  
  // Send message mutation
  const sendMessageMutation = api.orderChat.sendOrderChatMessage.useMutation({
    onSuccess: () => {
      setMessage('');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send message');
    }
  });
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [data?.messages]);
  
  // Handle sending a message
  const handleSendMessage = () => {
    if (!message.trim() || !orderId || !user?.id) return;
    
    sendMessageMutation.mutate({
      orderId,
      message: message.trim()
    });
  };
  
  // Identify message sender type for styling
  const getMessageClass = (type: string) => {
    if (type === 'SYSTEM') return 'bg-gray-700 text-gray-300';
    if ((type === 'TAILOR' && isTailor) || (type === 'CUSTOMER' && !isTailor)) {
      return 'bg-cyan-600 text-white ml-auto';
    }
    return 'bg-gray-800 text-white';
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-cyan-500" />
        <span className="ml-2 text-gray-400">Loading messages...</span>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <h3 className="text-lg font-medium text-white">Order Communication</h3>
        <p className="text-sm text-gray-400">
          {isTailor ? 'Chat with your customer' : 'Chat with your tailor'}
        </p>
      </div>
      
      {/* Messages Container */}
      <div className="p-4 h-96 overflow-y-auto bg-gray-900">
        {data?.messages && data.messages.length > 0 ? (
          <div className="space-y-4">
            {data.messages.map((msg: ChatMessage) => (
              <div key={msg.id} className="flex flex-col">
                <div
                  className={`p-3 rounded-lg max-w-[80%] ${getMessageClass(msg.sender)}`}
                >
                  {msg.sender === 'SYSTEM' && (
                    <div className="text-xs text-gray-400 mb-1">System Message</div>
                  )}
                  <p>{msg.message}</p>
                  <div className="text-xs opacity-70 mt-1">
                    {formatRelativeTime(new Date(msg.timestamp))}
                  </div>
                </div>
                {msg.sender !== 'SYSTEM' && (
                  <div className={`text-xs text-gray-400 mt-1 ${msg.sender === 'TAILOR' && isTailor ? 'text-right' : ''}`}>
                    {msg.senderName || (msg.sender === 'TAILOR' ? 'Tailor' : 'Customer')}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500">No messages yet. Start the conversation!</p>
          </div>
        )}
      </div>
      
      {/* Message Input */}
      <div className="p-4 border-t border-gray-800 bg-gray-800">
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 bg-gray-700 border border-gray-600 rounded-l-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="rounded-l-none bg-cyan-600 hover:bg-cyan-700"
          >
            {sendMessageMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
} 