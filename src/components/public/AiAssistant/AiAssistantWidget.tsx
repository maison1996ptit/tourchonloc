'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { askAiAssistant } from '@/actions/aiActions';
import styles from './AiAssistant.module.css';

interface Message {
  role: 'user' | 'model';
  parts: string;
}

export default function AiAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      parts: 'Dạ em chào Anh/Chị ạ! Chúc Anh/Chị một ngày tốt lành! 🌸 Em là Vy Vy - chuyên viên tư vấn du lịch từ TravelApp. Chuyến đi sắp tới mình đã dự định đi đâu và đi mấy người chưa ạ? Hãy nói cho em biết để em hỗ trợ tư vấn và thiết kế lịch trình ưng ý nhất cho mình nhé! 🌏✈️',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', parts: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Pass the conversation history (excluding the first welcome message to keep prompt clean, or pass all)
      const apiHistory = updatedMessages.slice(1);
      const reply = await askAiAssistant(apiHistory, text);
      setMessages((prev) => [...prev, { role: 'model', parts: reply }]);
    } catch (error) {
      console.error('AI Assistant Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          parts: 'Xin lỗi bạn, đã có lỗi kết nối xảy ra khi gửi tin nhắn. Bạn vui lòng thử lại nhé!',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend(input);
    }
  };

  // Helper to render Markdown links [text](url) using Next.js Link
  const renderMessageText = (content: string) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      const matchIndex = match.index;
      if (matchIndex > lastIndex) {
        parts.push(content.substring(lastIndex, matchIndex));
      }

      const linkText = match[1];
      const linkUrl = match[2];

      parts.push(
        <Link key={matchIndex} href={linkUrl} className={styles.inlineLink}>
          {linkText}
        </Link>
      );

      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }

    return parts.length > 0 ? parts : content;
  };

  const quickReplies = [
    'Tư vấn tour đi Nhật Bản ⛩️',
    'Tìm tour Hàn Quốc hoặc Đài Loan 🌸',
    'Thiết kế tour du lịch riêng 🎨',
  ];

  return (
    <div className={styles.widgetContainer}>
      {/* Floating Toggle Button */}
      <button 
        className={`${styles.toggleButton} ${isOpen ? styles.toggleButtonActive : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open AI Assistant"
      >
        {isOpen ? (
          <span className={styles.closeIcon}>×</span>
        ) : (
          <span className={styles.chatIcon}>💬</span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className={styles.chatWindow}>
          {/* Chat Header */}
          <div className={styles.chatHeader}>
            <div className={styles.headerAvatar}>🤖</div>
            <div className={styles.headerInfo}>
              <h4>Trợ Lý Du Lịch TravelApp</h4>
              <p>🟢 Đang hoạt động • AI tư vấn</p>
            </div>
            <button className={styles.headerCloseBtn} onClick={() => setIsOpen(false)}>
              &times;
            </button>
          </div>

          {/* Chat Body */}
          <div className={styles.chatBody} ref={chatBodyRef}>
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`${styles.messageRow} ${msg.role === 'user' ? styles.userRow : styles.aiRow}`}
              >
                {msg.role === 'model' && <div className={styles.messageAvatar}>🤖</div>}
                <div className={msg.role === 'user' ? styles.userBubble : styles.aiBubble}>
                  <p style={{ whiteSpace: 'pre-line' }}>{renderMessageText(msg.parts)}</p>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className={`${styles.messageRow} ${styles.aiRow}`}>
                <div className={styles.messageAvatar}>🤖</div>
                <div className={styles.aiBubble}>
                  <div className={styles.typingIndicator}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies list */}
          {!isLoading && (
            <div className={styles.quickRepliesContainer}>
              {quickReplies.map((reply, idx) => (
                <button 
                  key={idx} 
                  className={styles.quickReplyBtn}
                  onClick={() => handleSend(reply)}
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          {/* Chat Input Footer */}
          <div className={styles.chatFooter}>
            <input 
              type="text" 
              placeholder="Hỏi về tour, điểm đến, dịch vụ..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              className={styles.chatInput}
              disabled={isLoading}
            />
            <button 
              onClick={() => handleSend(input)}
              className={styles.sendBtn}
              disabled={!input.trim() || isLoading}
            >
              Gửi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
