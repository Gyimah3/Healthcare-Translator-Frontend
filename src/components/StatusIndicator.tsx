import React from 'react';

interface StatusIndicatorProps {
  isConnected: boolean;
  message: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ isConnected, message }) => {
  // Determine if this is a fallback message
  const isFallback = message.includes('browser speech') || message.includes('Browser API');
  
  return (
    <div className="flex items-center justify-center mt-4">
      <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? (isFallback ? 'bg-yellow-500' : 'bg-green-500') : 'bg-red-500'}`}></div>
      <p className={`text-sm ${isConnected ? (isFallback ? 'text-yellow-600' : 'text-green-600') : 'text-red-500'}`}>
        {message}
      </p>
    </div>
  );
};

export default StatusIndicator;