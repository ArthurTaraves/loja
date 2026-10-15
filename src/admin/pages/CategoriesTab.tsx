import { useEffect, useState } from 'react';
import {
  createCategory,
  deleteCategory,
  listAllCategories,
  swapCategoryOrder,
  updateCategory,
} from '../../services/categories';
import type { Category } from '../../types';
import { slugify } from '../../utils/slugify';
import { ImageUploader } from '../../components/common/ImageUploader';

export function CategoriesTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingImage, setEditingImage] = useState<{ url: string; publicId: string } | null>(null);

  const reload = () => {
    setLoading(true);
    listAllCategories()
      .then(setCategories)
      .catch((error) => console.error('Falha ao carregar categorias:', error))
      .finally(() => setLoading(false));
  };

  useEffect(reload, []);

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    try {
      const nextOrder = categories.length > 0 ? Math.max(...categories.map((c) => c.order)) + 1 : 0;
      await createCategory({ name, slug: slugify(name), order: nextOrder, active: true });
      setNewName('');
      reload();
    } catch (error) {
      console.error('Falha ao criar categoria:', error);
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setEditingName(category.name);
    setEditingImage(category.imageUrl ? { url: category.imageUrl, publicId: category.imagePublicId ?? '' } : null);
  };

  const saveEdit = async (category: Category) => {
    const name = editingName.trim();
    if (!name) return;
    try {
      await updateCategory(category.id, {
        name,
        slug: slugify(name),
        imageUrl: editingImage?.url ?? '',
        imagePublicId: editingImage?.publicId ?? '',
      });
      setEditingId(null);
      reload();
    } catch (error) {
      console.error('Falha ao editar categoria:', error);
    }
  };

  const toggleActive = async (category: Category) => {
    try {
      await updateCategory(category.id, { active: !category.active });
      reload();
    } catch (error) {
      console.error('Falha ao atualizar categoria:', error);
    }
  };

  const remove = async (category: Category) => {
    if (!confirm(`Excluir a categoria "${category.name}"?`)) return;
    try {
      await deleteCategory(category.id);
      reload();
    } catch (error) {
      console.error('Falha ao excluir categoria:', error);
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    const other = categories[index + direction];
    if (!other) return;
    try {
      await swapCategoryOrder(categories[index], other);
      reload();
    } catch (error) {
      console.error('Falha ao reordenar categorias:', error);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Categorias</h2>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          placeholder="Nome da nova categoria"
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={handleCreate}
          disabled={creating || !newName.trim()}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Adicionar
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Carregando...</p>
      ) : categories.length === 0 ? (
        <p className="text-sm text-gray-500">Nenhuma categoria cadastrada.</p>
      ) : (
        <div className="flex flex-col divide-y divide-gray-200 rounded-md border border-gray-200">
          {categories.map((category, index) => (
            <div key={category.id} className="flex flex-col gap-3 px-3 py-2">
              <div className="flex items-center gap-3">
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
                    disabled={index === categories.length - 1}
                    className="text-xs text-gray-500 disabled:opacity-30"
                  >
                    ▼
                  </button>
                </div>

                <div className="h-8 w-8 shrink-0 overflow-hidden rounded bg-gray-100">
                  {category.imageUrl && <img src={category.imageUrl} alt="" className="h-full w-full object-cover" />}
                </div>

                <span className={`flex-1 text-sm ${category.active ? 'text-gray-900' : 'text-gray-400'}`}>
                  {category.name}
                </span>

                <label className="flex items-center gap-1.5 text-xs text-gray-600">
                  <input type="checkbox" checked={category.active} onChange={() => toggleActive(category)} />
                  Ativa
                </label>

                {editingId === category.id ? (
                  <button type="button" onClick={() => setEditingId(null)} className="text-xs text-gray-600 underline">
                    Cancelar
                  </button>
                ) : (
                  <button type="button" onClick={() => startEdit(category)} className="text-xs text-gray-600 underline">
                    Editar
                  </button>
                )}
                <button type="button" onClick={() => remove(category)} className="text-xs text-red-600 underline">
                  Excluir
                </button>
              </div>

              {editingId === category.id && (
                <div className="flex flex-wrap items-end gap-4 rounded-md bg-gray-50 p-3">
                  <label className="flex flex-col gap-1 text-sm">
                    Nome
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
                    />
                  </label>
                  <ImageUploader
                    label="Foto (opcional)"
                    recommendedSize="400x400px"
                    value={editingImage}
                    onChange={setEditingImage}
                  />
                  <button
                    type="button"
                    onClick={() => saveEdit(category)}
                    className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white"
                  >
                    Salvar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
