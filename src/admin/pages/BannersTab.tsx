import { useEffect, useState } from 'react';
import {
  createBanner,
  deleteBanner,
  listAllBanners,
  swapBannerOrder,
  updateBanner,
} from '../../services/banners';
import type { Banner } from '../../types';
import { ImageUploader } from '../../components/common/ImageUploader';
import { optimizedImageUrl } from '../../utils/cloudinaryUrl';

type ImageValue = { url: string; publicId: string } | null;

function NewBannerForm({ onCreated }: { onCreated: () => void }) {
  const [desktop, setDesktop] = useState<ImageValue>(null);
  const [mobile, setMobile] = useState<ImageValue>(null);
  const [link, setLink] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!desktop) return;
    setCreating(true);
    try {
      await createBanner({
        imageDesktopUrl: desktop.url,
        imageDesktopPublicId: desktop.publicId,
        imageMobileUrl: mobile?.url,
        imageMobilePublicId: mobile?.publicId,
        link: link.trim() || undefined,
        order: Date.now(),
        active: true,
      });
      setDesktop(null);
      setMobile(null);
      setLink('');
      onCreated();
    } catch (error) {
      console.error('Falha ao criar banner:', error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-wrap items-end gap-6 rounded-md border border-dashed border-gray-300 p-4">
      <ImageUploader label="Imagem desktop" recommendedSize="1920x600px" value={desktop} onChange={setDesktop} />
      <ImageUploader label="Imagem mobile (opcional)" recommendedSize="800x800px" value={mobile} onChange={setMobile} />
      <label className="flex flex-col gap-1 text-sm">
        Link (opcional)
        <input
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://..."
          className="w-48 rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        />
      </label>
      <button
        type="button"
        onClick={handleCreate}
        disabled={!desktop || creating}
        className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {creating ? 'Adicionando...' : 'Adicionar banner'}
      </button>
    </div>
  );
}

export function BannersTab() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = () => {
    setLoading(true);
    listAllBanners()
      .then(setBanners)
      .catch((error) => console.error('Falha ao carregar banners:', error))
      .finally(() => setLoading(false));
  };

  useEffect(reload, []);

  const toggleActive = async (banner: Banner) => {
    try {
      await updateBanner(banner.id, { active: !banner.active });
      reload();
    } catch (error) {
      console.error('Falha ao atualizar banner:', error);
    }
  };

  const remove = async (banner: Banner) => {
    if (!confirm('Excluir este banner?')) return;
    try {
      await deleteBanner(banner.id);
      reload();
    } catch (error) {
      console.error('Falha ao excluir banner:', error);
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    const other = banners[index + direction];
    if (!other) return;
    try {
      await swapBannerOrder(banners[index], other);
      reload();
    } catch (error) {
      console.error('Falha ao reordenar banners:', error);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Banners</h2>
        <p className="text-sm text-gray-500">Exibidos em carrossel na home.</p>
      </div>

      <NewBannerForm onCreated={reload} />

      {loading ? (
        <p className="text-sm text-gray-500">Carregando...</p>
      ) : banners.length === 0 ? (
        <p className="text-sm text-gray-500">Nenhum banner cadastrado.</p>
      ) : (
        <div className="flex flex-col divide-y divide-gray-200 rounded-md border border-gray-200">
          {banners.map((banner, index) => (
            <div key={banner.id} className="flex items-center gap-3 px-3 py-2">
              <div className="flex flex-col">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  className="text-xs text-gray-500 disabled:opacity-30"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === banners.length - 1}
                  className="text-xs text-gray-500 disabled:opacity-30"
                >
                  ▼
                </button>
              </div>

              <img
                src={optimizedImageUrl(banner.imageDesktopUrl, 200)}
                alt=""
                loading="lazy"
                className="h-12 w-24 rounded object-cover"
              />

              <span className="flex-1 truncate text-sm text-gray-600">{banner.link || 'Sem link'}</span>

              <label className="flex items-center gap-1.5 text-xs text-gray-600">
                <input type="checkbox" checked={banner.active} onChange={() => toggleActive(banner)} />
                Ativo
              </label>

              <button type="button" onClick={() => remove(banner)} className="text-xs text-red-600 underline">
                Excluir
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
