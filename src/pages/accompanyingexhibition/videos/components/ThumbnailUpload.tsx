import { useCallback, useEffect, useState } from 'react';
import { Image, X } from 'lucide-react';

interface ThumbnailUploadProps {
  value: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
}

export function ThumbnailUpload({ value, onChange, disabled = false }: ThumbnailUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // When parent clears value (e.g. after upload complete), clear preview too
  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
    }
  }, [value]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onChange(file);

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewUrl(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    [onChange]
  );

  const handleRemove = useCallback(() => {
    onChange(null);
    setPreviewUrl(null);
  }, [onChange]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Thumbnail Image (Optional)
      </label>
      <p className="text-xs text-gray-500 mb-2">
        Upload a custom thumbnail or let the system generate one automatically
      </p>

      {!value && !previewUrl ? (
        <label
          className={`
            relative flex flex-col items-center justify-center
            w-full h-32 border-2 border-dashed rounded-lg
            transition-colors cursor-pointer
            ${
              disabled
                ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                : 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100'
            }
          `}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Image className="w-8 h-8 mb-2 text-gray-400" />
            <p className="text-xs text-gray-500 text-center px-2">
              Click to upload thumbnail
            </p>
            <p className="text-xs text-gray-400 mt-1">Any image file</p>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={disabled}
          />
        </label>
      ) : (
        <div className="relative w-full h-32 rounded-lg overflow-hidden border-2 border-gray-300 bg-gray-100">
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Thumbnail preview"
              className="w-full h-full object-cover"
            />
          )}
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled}
            className="
              absolute top-2 right-2 p-1.5 rounded-full
              bg-red-500 hover:bg-red-600 text-white
              transition-colors disabled:opacity-50
            "
            aria-label="Remove thumbnail"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-2 py-1">
            {value?.name}
          </div>
        </div>
      )}
    </div>
  );
}
