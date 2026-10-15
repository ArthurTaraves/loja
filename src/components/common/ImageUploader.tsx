import { useRef, useState } from 'react';
import {
  isCloudinaryConfigured,
  uploadImageToCloudinary,
  validateImageFile,
  type CloudinaryUploadResult,
} from '../../services/cloudinary';

interface ImageUploaderProps {
  label?: string;
  recommendedSize?: string;
  value?: CloudinaryUploadResult | null;
  onChange: (result: CloudinaryUploadResult | null) => void;
}

export function ImageUploader({ label, recommendedSize, value, onChange }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setProgress(0);
    try {
      const result = await uploadImageToCloudinary(file, setProgress);
      onChange(result);
    } catch (err) {
      console.error('Falha no upload:', err);
      setError(err instanceof Error ? err.message : 'Falha no upload.');
    } finally {
      setProgress(null);
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) handleFile(file);
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="text-sm font-medium text-gray-900">{label}</span>}
      {recommendedSize && <span className="text-xs text-gray-500">Dimensão recomendada: {recommendedSize}</span>}

      {value?.url ? (
        <div className="flex items-center gap-3">
          <img src={value.url} alt="" className="h-20 w-20 rounded-md border border-gray-200 object-cover" />
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-xs text-primary underline"
            >
              Trocar imagem
            </button>
            <button type="button" onClick={() => onChange(null)} className="text-xs text-red-600 underline">
              Remover
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={!isCloudinaryConfigured}
          className="flex h-24 w-24 items-center justify-center rounded-md border border-dashed border-gray-300 text-center text-xs text-gray-500 hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {progress !== null ? `${progress}%` : isCloudinaryConfigured ? 'Enviar foto' : 'Cloudinary não configurado'}
        </button>
      )}

      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onInputChange} />

      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
