import { useState } from "react";
import { ExternalLink, Copy, Check } from "lucide-react";

interface LinkPreviewProps {
  url: string;
  title: string;
  description?: string;
  icon?: string;
  image?: string;
  compact?: boolean;
}

export function LinkPreview({ 
  url, 
  title, 
  description, 
  icon, 
  image, 
  compact = false 
}: LinkPreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleCopy(e);
  };

  if (compact) {
    return (
      <div 
        className="flex items-start gap-2 mt-2 cursor-pointer group bg-gray-50 rounded-lg p-2 border max-w-xs"
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        {icon && (
          <img 
            src={icon} 
            alt="Site icon" 
            className="w-4 h-4 rounded-sm flex-shrink-0 mt-0.5"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600">
            {title}
          </div>
          {description && (
            <div className="text-xs text-gray-600 overflow-hidden mt-0.5" style={{ 
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical'
            }}>
              {description}
            </div>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
          title="Copy URL"
        >
          {copied ? (
            <Check className="h-3 w-3 text-green-600" />
          ) : (
            <Copy className="h-3 w-3 text-gray-400" />
          )}
        </button>
      </div>
    );
  }

  return (
    <div 
      className="mt-3 flex items-start gap-3 p-3 bg-gray-50 rounded-lg border cursor-pointer group hover:bg-gray-100 transition-colors"
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      {icon && (
        <img 
          src={icon} 
          alt="Site icon" 
          className="w-5 h-5 rounded-sm flex-shrink-0"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 group-hover:text-blue-600">
          {title}
        </div>
        {description && (
          <div className="text-sm text-gray-600 mt-1 overflow-hidden" style={{ 
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
            {description}
          </div>
        )}
        <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
          <ExternalLink className="h-3 w-3" />
          {url}
        </div>
      </div>
      <button
        onClick={handleCopy}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
        title="Copy URL"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <Copy className="h-4 w-4 text-gray-400" />
        )}
      </button>
    </div>
  );
} 