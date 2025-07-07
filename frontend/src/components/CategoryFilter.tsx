import React from 'react';

interface Category {
  id: string;
  name: string;
  count?: number;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">商品分類</h3>
      
      <div className="space-y-2">
        <button
          onClick={() => onCategoryChange(null)}
          className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
            selectedCategory === null
              ? 'bg-blue-100 text-blue-700 border border-blue-300'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          全部分類
        </button>
        
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`w-full text-left px-3 py-2 rounded-md transition-colors flex justify-between items-center ${
              selectedCategory === category.id
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span>{category.name}</span>
            {category.count && (
              <span className="text-sm text-gray-500">({category.count})</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter; 