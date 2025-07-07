import React from 'react';

interface Category {
  id: string;
  name: string;
  count: number;
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
    <div>
      <h3>商品分類</h3>
      <ul className="category-list">
        <li className="category-item">
          <button
            onClick={() => onCategoryChange(null)}
            className={`category-link ${!selectedCategory ? 'active' : ''}`}
          >
            <span>全部分類</span>
          </button>
        </li>
        {categories.map((category) => (
          <li key={category.id} className="category-item">
            <button
              onClick={() => onCategoryChange(category.id)}
              className={`category-link ${selectedCategory === category.id ? 'active' : ''}`}
            >
              <span>{category.name}</span>
              <span className="category-count">{category.count}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryFilter; 