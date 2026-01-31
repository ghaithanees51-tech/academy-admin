export type UploadFileStatus =
  | 'pending'
  | 'processing'
  | 'uploading'
  | 'done'
  | 'error';

export interface UploadQueueItem {
  id: string;
  name: string;
  status: UploadFileStatus;
  progress: number;
  error?: string;
}

interface UploadProgressProps {
  items: UploadQueueItem[];
  overallPercent: number;
  showOverallBar?: boolean;
  className?: string;
}

export function UploadProgress({
  items,
  overallPercent,
  showOverallBar = true,
  className = '',
}: UploadProgressProps) {
  if (items.length === 0) return null;

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-700">Upload progress</span>
        <span className="text-sm font-medium text-gray-600">{Math.round(overallPercent)}%</span>
      </div>
      {showOverallBar && (
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${overallPercent}%`, backgroundColor: '#0c4261' }}
          />
        </div>
      )}
      <ul className="space-y-2 max-h-40 overflow-y-auto">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-2 text-sm">
            <span className="flex-1 truncate text-gray-700" title={item.name}>
              {item.name}
            </span>
            <span className="flex-shrink-0 w-10 text-end text-gray-500">
              {item.status === 'processing' && `${item.progress}%`}
              {item.status === 'uploading' && `${item.progress}%`}
              {item.status === 'done' && '✓'}
              {item.status === 'error' && '✗'}
              {item.status === 'pending' && '—'}
            </span>
            {(item.status === 'uploading' || item.status === 'processing') && (
              <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                <div
                  className={`h-full rounded-full transition-all ${
                    item.status === 'processing' ? 'bg-blue-500' : 'bg-[#0c4261]'
                  }`}
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
