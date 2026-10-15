import { useState } from 'react';
import { createProduct, updateProduct } from '../../services/products';
import { ImageUploader } from '../../components/common/ImageUploader';
import { slugify } from '../../utils/slugify';
import type { Category, Product, ProductImage, ProductVariation } from '../../types';

interface ProductFormProps {
  initial?: Product;
  categories: Category[];
  onSaved: () => void;
  onCancel: () => void;
}

function ImagesManager({ images, onChange }: { images: ProductImage[]; onChange: (images: ProductImage[]) => void }) {
  const addImage = (result: { url: string; publicId: string } | null) => {
    if (!result) return;
    onChange([...images, { url: result.url, publicId: result.publicId, order: images.length }]);
  };

  const removeAt = (index: number) => {
    onChange(images.filter((_, i) => i !== index).map((img, i) => ({ ...img, order: i })));
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((img, i) => ({ ...img, order: i })));
  };

  return (
    <div className="flex flex-wrap gap-3">
      {images.map((image, index) => (
        <div key={image.publicId} className="relative h-24 w-24">
          <img src={image.url} alt="" className="h-full w-full rounded-md border border-gray-200 object-cover" />
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-black/50 px-1 py-0.5">
            <button type="button" onClick={() => move(index, -1)} className="text-xs text-white disabled:opacity-30" disabled={index === 0}>
              ◀
            </button>
            <button type="button" onClick={() => removeAt(index)} className="text-xs text-white">
              ✕
            </button>
            <button
              type="button"
              onClick={() => move(index, 1)}
              className="text-xs text-white disabled:opacity-30"
              disabled={index === images.length - 1}
            >
              ▶
            </button>
          </div>
        </div>
      ))}
      <ImageUploader recommendedSize="1000x1000px" value={null} onChange={addImage} />
    </div>
  );
}

function VariationsManager({
  variations,
  onChange,
}: {
  variations: ProductVariation[];
  onChange: (variations: ProductVariation[]) => void;
}) {
  const addGroup = () => onChange([...variations, { name: '', options: [{ label: '', stock: 0 }] }]);
  const removeGroup = (i: number) => onChange(variations.filter((_, idx) => idx !== i));
  const updateGroupName = (i: number, name: string) =>
    onChange(variations.map((g, idx) => (idx === i ? { ...g, name } : g)));
  const addOption = (i: number) =>
    onChange(variations.map((g, idx) => (idx === i ? { ...g, options: [...g.options, { label: '', stock: 0 }] } : g)));
  const removeOption = (i: number, j: number) =>
    onChange(variations.map((g, idx) => (idx === i ? { ...g, options: g.options.filter((_, oi) => oi !== j) } : g)));
  const updateOption = (i: number, j: number, label: string, stock: number) =>
    onChange(
      variations.map((g, idx) =>
        idx === i ? { ...g, options: g.options.map((o, oi) => (oi === j ? { label, stock } : o)) } : g,
      ),
    );

  return (
    <div className="flex flex-col gap-4">
      {variations.map((group, i) => (
        <div key={i} className="rounded-md border border-gray-200 p-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={group.name}
              onChange={(e) => updateGroupName(i, e.target.value)}
              placeholder="Nome da variação (ex: Tamanho)"
              className="flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-sm"
            />
            <button type="button" onClick={() => removeGroup(i)} className="text-xs text-red-600 underline">
              Remover grupo
            </button>
          </div>

          <div className="mt-3 flex flex-col gap-2">
            {group.options.map((option, j) => (
              <div key={j} className="flex items-center gap-2">
                <input
                  type="text"
                  value={option.label}
                  onChange={(e) => updateOption(i, j, e.target.value, option.stock)}
                  placeholder="Opção (ex: M)"
                  className="w-32 rounded-md border border-gray-300 px-2 py-1 text-sm"
                />
                <input
                  type="number"
                  min={0}
                  value={option.stock}
                  onChange={(e) => updateOption(i, j, option.label, Number(e.target.value))}
                  placeholder="Estoque"
                  className="w-24 rounded-md border border-gray-300 px-2 py-1 text-sm"
                />
                <button type="button" onClick={() => removeOption(i, j)} className="text-xs text-red-600 underline">
                  Remover
                </button>
              </div>
            ))}
            <button type="button" onClick={() => addOption(i)} className="w-fit text-xs text-primary underline">
              + Adicionar opção
            </button>
          </div>
        </div>
      ))}
      <button type="button" onClick={addGroup} className="w-fit text-sm text-primary underline">
        + Adicionar grupo de variação
      </button>
    </div>
  );
}

export function ProductForm({ initial, categories, onSaved, onCancel }: ProductFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?.id ?? '');
  const [images, setImages] = useState<ProductImage[]>(initial?.images ?? []);
  const [price, setPrice] = useState(initial?.price?.toString() ?? '');
  const [promoPrice, setPromoPrice] = useState(initial?.promoPrice?.toString() ?? '');
  const [hasVariations, setHasVariations] = useState((initial?.variations?.length ?? 0) > 0);
  const [variations, setVariations] = useState<ProductVariation[]>(initial?.variations ?? []);
  const [stock, setStock] = useState(initial?.stock?.toString() ?? '0');
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [active, setActive] = useState(initial?.active ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (!name.trim()) {
      setError('Informe o nome do produto.');
      return;
    }
    if (!categoryId) {
      setError('Selecione uma categoria.');
      return;
    }
    const priceValue = Number(price);
    if (!price || Number.isNaN(priceValue) || priceValue <= 0) {
      setError('Informe um preço válido.');
      return;
    }
    const promoValue = promoPrice ? Number(promoPrice) : undefined;

    const payload = {
      name: name.trim(),
      slug: slugify(name),
      description: description.trim(),
      categoryId,
      images,
      price: priceValue,
      promoPrice: promoValue,
      variations: hasVariations ? variations.filter((g) => g.name.trim()) : undefined,
      stock: hasVariations ? undefined : Number(stock) || 0,
      featured,
      active,
    };

    setSaving(true);
    try {
      if (initial) {
        await updateProduct(initial.id, payload);
      } else {
        await createProduct(payload);
      }
      onSaved();
    } catch (err) {
      console.error('Falha ao salvar produto:', err);
      setError('Falha ao salvar produto.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 rounded-md border border-gray-200 p-4">
      <h3 className="text-base font-semibold text-gray-900">{initial ? 'Editar produto' : 'Novo produto'}</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          Nome
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="rounded-md border border-gray-300 px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Categoria
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="">Selecione...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        Descrição
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="rounded-md border border-gray-300 px-3 py-2"
        />
      </label>

      <div>
        <p className="mb-2 text-sm font-medium text-gray-900">Fotos</p>
        <ImagesManager images={images} onChange={setImages} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          Preço
          <input
            type="number"
            step="0.01"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Preço promocional (opcional)
          <input
            type="number"
            step="0.01"
            min={0}
            value={promoPrice}
            onChange={(e) => setPromoPrice(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2"
          />
        </label>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-900">
          <input type="checkbox" checked={hasVariations} onChange={(e) => setHasVariations(e.target.checked)} />
          Este produto tem variações (ex: tamanho)
        </label>

        {hasVariations ? (
          <div className="mt-3">
            <VariationsManager variations={variations} onChange={setVariations} />
          </div>
        ) : (
          <label className="mt-3 flex max-w-xs flex-col gap-1 text-sm">
            Estoque
            <input
              type="number"
              min={0}
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2"
            />
          </label>
        )}
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
          Destaque
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          Ativo
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? 'Salvando...' : 'Salvar produto'}
        </button>
        <button type="button" onClick={onCancel} className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700">
          Cancelar
        </button>
      </div>
    </div>
  );
}
