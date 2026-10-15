const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const isCloudinaryConfigured = Boolean(CLOUD_NAME && UPLOAD_PRESET);

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_IMAGE_SIZE_MB = 5;

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
}

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Formato inválido. Use JPG, PNG ou WebP.';
  }
  if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
    return `Arquivo muito grande. Máximo de ${MAX_IMAGE_SIZE_MB}MB.`;
  }
  return null;
}

/**
 * Upload unsigned direto do navegador para o Cloudinary. Note: excluir a
 * imagem depois exige a API secret (nunca deve ficar no client), então
 * "remover" no admin só apaga a referência salva no Firestore — o arquivo
 * permanece no Cloudinary e pode ser limpo manualmente lá quando precisar.
 */
export function uploadImageToCloudinary(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<CloudinaryUploadResult> {
  if (!isCloudinaryConfigured) {
    return Promise.reject(new Error('Cloudinary não configurado. Preencha VITE_CLOUDINARY_* no .env.'));
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve({ url: data.secure_url, publicId: data.public_id });
        } catch {
          reject(new Error('Resposta inválida do Cloudinary.'));
        }
      } else {
        reject(new Error(`Falha no upload (status ${xhr.status}).`));
      }
    };

    xhr.onerror = () => reject(new Error('Erro de rede ao enviar a imagem.'));

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    xhr.send(formData);
  });
}
