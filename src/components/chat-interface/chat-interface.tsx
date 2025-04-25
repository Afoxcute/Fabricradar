'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  id: string;
  sender: 'user' | 'designer';
  text: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  productName: string;
  designerName: string;
}

export function ChatInterface({
  productName,
  designerName,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'user',
      text: `Hey Sobby! I saw your "Regal Senator" design on the marketplace—it's 🔥. I'd love to have it sewn for an event next month.`,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
    {
      id: '2',
      sender: 'designer',
      text: `Hi! Great to hear from you. I'm excited to work on that design for you. Do you want any customizations or should I keep it as designed?`,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.5), // 1.5 hours ago
    },
    {
      id: '3',
      sender: 'user',
      text: `I'd like to go with the original design. Just one tweak: can we make the neckline a bit deeper?`,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1), // 1 hour ago
    },
    {
      id: '4',
      sender: 'designer',
      text: `Absolutely, that's doable. I'll make a slight adjustment to the neckline while maintaining the overall silhouette. What are your measurements?`,
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    },
    {
      id: '5',
      sender: 'user',
      text: `Perfect! What's the cost and delivery timeline?`,
      timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    },
    {
      id: '6',
      sender: 'designer',
      text: `The full package costs 0.45 ETH, including fabric, tailoring, and delivery. You'll receive it within 12 business days once your payment is confirmed.`,
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    },
    {
      id: '7',
      sender: 'user',
      text: `Sounds good! Let's go ahead.`,
      timestamp: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
    },
  ]);

  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;

    const message: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: newMessage,
      timestamp: new Date(),
    };

    setMessages([...messages, message]);
    setNewMessage('');

    // Simulate designer response after a delay
    setTimeout(() => {
      const designerResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'designer',
        text: "Thanks for your message! I'll get back to you shortly with more details about your order.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, designerResponse]);
    }, 2000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-800">
      <div className="p-4 border-b border-gray-800 flex items-center gap-3">
        <div className="bg-cyan-500/20 p-2 rounded-full">
          <Image
            src="/placeholder.svg?height=40&width=40"
            alt="Designer"
            width={40}
            height={40}
            className="rounded-full"
          />
        </div>
        <div>
          <p className="font-medium">@cooljay_dapper (Client)</p>
          <p className="text-xs text-cyan-400">Online</p>
        </div>
      </div>

      <div className="h-[400px] overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === 'user' ? 'justify-start' : 'justify-end'
            }`}
          >
            {message.sender === 'user' && (
              <div className="flex-shrink-0 mr-3">
                <Image
                  src="/placeholder.svg?height=32&width=32"
                  alt="User"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              </div>
            )}

            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.sender === 'user'
                  ? 'bg-gray-800 text-white'
                  : 'bg-cyan-500 text-white'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <p className="text-xs mt-1 opacity-70 text-right">
                {formatTime(message.timestamp)}
              </p>
            </div>

            {message.sender === 'designer' && (
              <div className="flex-shrink-0 ml-3">
                <Image
                  src="/placeholder.svg?height=32&width=32"
                  alt="Designer"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-800 flex items-center gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSendMessage();
            }
          }}
        />
        <Button
          onClick={handleSendMessage}
          className="bg-cyan-500 hover:bg-cyan-600 text-white rounded-full w-10 h-10 flex items-center justify-center p-0"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
