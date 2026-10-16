/**
 * Injeta transformações do Cloudinary (f_auto,q_auto + largura) numa URL de
 * upload já existente. f_auto escolhe o melhor formato pro navegador (webp/avif
 * quando suportado), q_auto ajusta a qualidade automaticamente — os dois juntos
 * costumam cortar bastante o peso da imagem sem mudar nada visualmente.
 *
 * Se a URL não for do Cloudinary (ou vier vazia), devolve como veio: outras
 * fontes de imagem não quebram por passar por aqui.
 */
export function optimizedImageUrl(url: string | undefined | null, width: number): string {
  if (!url) return '';
  if (!url.includes('/upload/')) return url;
  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width},c_limit/`);
}

// Larguras pensadas pro maior tamanho em que cada imagem realmente aparece na
// tela (2x a largura do container cobre telas retina sem exagerar no peso).
export const IMAGE_WIDTH = {
  productCardThumb: 500,
  categoryThumb: 200,
  cartThumb: 160,
  galleryMain: 1200,
  galleryThumb: 150,
  logo: 300,
  bannerDesktop: 1920,
  bannerMobile: 800,
} as const;
