import type { ProductVariation } from '../../types';
import type { VariationSelection } from '../../contexts/CartContext';

interface VariationSelectorProps {
  variations: ProductVariation[];
  selected: VariationSelection;
  onChange: (groupName: string, optionLabel: string) => void;
}

export function VariationSelector({ variations, selected, onChange }: VariationSelectorProps) {
  return (
    <div className="flex flex-col gap-4">
      {variations.map((group) => (
        <div key={group.name}>
          <p className="mb-2 text-sm font-medium text-text">{group.name}</p>
          <div className="flex flex-wrap gap-2">
            {group.options.map((option) => {
              const isSelected = selected[group.name] === option.label;
              const outOfStock = option.stock <= 0;
              return (
                <button
                  key={option.label}
                  type="button"
                  disabled={outOfStock}
                  onClick={() => onChange(group.name, option.label)}
                  className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                    outOfStock
                      ? 'cursor-not-allowed border-secondary/20 text-secondary/50 line-through'
                      : isSelected
                        ? 'border-primary bg-primary text-white'
                        : 'border-secondary/30 text-text hover:border-primary'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
