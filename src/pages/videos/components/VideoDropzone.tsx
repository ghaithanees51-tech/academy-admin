import { useState, useRef } from 'react';

interface VideoDropzoneProps {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
}

const VIDEO_ACCEPT = 'video/mp4,video/webm,video/quicktime,video/x-matroska,.mp4,.webm,.mov,.mkv';

export function VideoDropzone({
  onFiles,
  accept = VIDEO_ACCEPT,
  multiple = true,
  disabled = false,
  className = '',
}: VideoDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (disabled) return;
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('video/'));
    if (files.length) onFiles(files);
  };

  const handleClick = () => {
    if (!disabled) inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) onFiles(Array.from(files));
    e.target.value = '';
  };

  return (
    <div className={className}>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Add videos
      </label>
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => e.key === 'Enter' && handleClick()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-8 px-4
          transition-colors min-h-[140px]
          ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
          ${isDragOver ? 'border-[#0c4261] bg-[rgba(12,66,97,0.06)]' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="sr-only"
        />
        <svg
          className="w-10 h-10 text-gray-400 mb-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <p className="text-sm font-medium text-gray-600">
          {isDragOver ? 'Drop videos here' : 'Drag & drop or click to browse'}
        </p>
        <p className="text-xs text-gray-500 mt-1">MP4, WebM, MOV, MKV</p>
      </div>
    </div>
  );
}
