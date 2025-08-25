import React from 'react';
import { ChatBot } from '@/components/ChatBot';
import { FileUpload } from '@/components/FileUpload';

const Index = () => {
  return (
    <div className="min-h-screen gradient-bg">
      <div className="container mx-auto h-screen flex flex-col p-4">
        {/* Header */}
        <header className="mb-6 text-center py-6">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
            AI Assistant Chat
          </h1>
          <p className="opacity-75">
            Connect with your intelligent assistant and upload files
          </p>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex gap-6 min-h-0">
          {/* Chat Section */}
          <div className="flex-1 min-w-0">
            <ChatBot />
          </div>

          {/* File Upload Panel */}
          <div className="w-80 flex-shrink-0">
            <div className="h-full rounded-lg border" style={{ 
              background: 'var(--panel-bg)', 
              borderColor: 'var(--panel-border)',
              boxShadow: 'var(--shadow-lg)'
            }}>
              <FileUpload />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
