import React from 'react';
import { Search, X } from 'lucide-react';

interface Props {
  categories: string[];
  subCategories: string[];
  activeCategory: string;
  activeSubCategories: string[];
  setActiveCategory: (cat: string) => void;
  toggleSubCategory: (sub: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const CatalogFilters: React.FC<Props> = ({
  categories,
  subCategories,
  activeCategory,
  activeSubCategories,
  setActiveCategory,
  toggleSubCategory,
  searchQuery,
  setSearchQuery
}) => {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar arreglos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-rose-500 transition-all"
        />
      </div>

      {/* Categories */}
      <div>
        <h4 className="text-sm font-bold text-gray-900 mb-3">Categoría</h4>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                activeCategory === cat ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Subcategories */}
      {activeCategory === 'Ramos' && (
        <div>
          <h4 className="text-sm font-bold text-gray-900 mb-3">Tipo de Flor</h4>
          <div className="flex flex-wrap gap-2">
            {subCategories.map(sub => (
              <button
                key={sub}
                onClick={() => toggleSubCategory(sub)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
                  activeSubCategories.includes(sub) ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {sub}
                {activeSubCategories.includes(sub) && <X className="w-3 h-3" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
