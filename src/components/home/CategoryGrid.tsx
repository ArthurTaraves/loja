import { Link } from 'react-router-dom';
import { useCategories } from '../../hooks/useCategories';

export function CategoryGrid() {
  const { categories } = useCategories();

  if (categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h2 className="mb-4 text-lg font-semibold text-primary">Categorias</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/produtos?categoria=${category.slug}`}
            className="group flex flex-col items-center gap-2 rounded-lg border border-secondary/20 p-4 text-center transition-shadow hover:shadow-md"
          >
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-secondary/10">
              {category.imageUrl ? (
                <img src={category.imageUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-xl font-semibold text-secondary">{category.name.charAt(0)}</span>
              )}
            </div>
            <span className="text-sm font-medium text-text">{category.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
