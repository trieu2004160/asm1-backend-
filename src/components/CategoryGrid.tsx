import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

interface CategoryGridProps {
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
}

interface Category {
  id: string;
  name: string;
  image: string;
  path: string;
}

const categories: Category[] = [
  {
    id: "polo",
    name: "Áo Polo",
    image:
      "https://theme.hstatic.net/200000690725/1001078549/14/home_category_1_img.jpg?v=888",
    path: "/category/polo",
  },
  {
    id: "thun",
    name: "Áo Thun",
    image:
      "https://theme.hstatic.net/200000690725/1001078549/14/home_category_2_img.jpg?v=888",
    path: "/category/thun",
  },
  {
    id: "jean",
    name: "Quần Jeans",
    image:
      "https://theme.hstatic.net/200000690725/1001078549/14/home_category_3_img.jpg?v=888",
    path: "/category/jean",
  },
  {
    id: "au",
    name: "Quần Âu",
    image:
      "https://theme.hstatic.net/200000690725/1001078549/14/home_category_4_img.jpg?v=888",
    path: "/category/au",
  },
  {
    id: "somi",
    name: "Áo Sơ Mi",
    image:
      "https://theme.hstatic.net/200000690725/1001078549/14/home_category_5_img.jpg?v=888",
    path: "/category/somi",
  },
];

interface CategoryGridProps {
  className?: string;
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
}

export function CategoryGrid({
  className = "",
  selectedCategory,
  onCategoryChange,
}: CategoryGridProps) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Responsive items to show
  const getItemsToShow = () => {
    if (typeof window !== "undefined") {
      if (window.innerWidth < 640) return 1; // mobile
      if (window.innerWidth < 1024) return 2; // tablet
      return 4; // desktop
    }
    return 4;
  };

  const [itemsToShow, setItemsToShow] = useState(getItemsToShow);

  useEffect(() => {
    const handleResize = () => {
      const newItemsToShow = getItemsToShow();
      setItemsToShow(newItemsToShow);
      // Reset index if needed
      if (currentIndex >= categories.length - newItemsToShow) {
        setCurrentIndex(Math.max(0, categories.length - newItemsToShow));
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [currentIndex]);

  const handleCategoryClick = (category: Category) => {
    // Call the callback if provided (for same page filtering)
    if (onCategoryChange) {
      onCategoryChange(category.id);
      return;
    }

    // Otherwise navigate with URL params
    navigate(`/?category=${category.id}`);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) =>
      prev + itemsToShow >= categories.length ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? Math.max(0, categories.length - itemsToShow) : prev - 1
    );
  };

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-bold text-foreground">
            DANH MỤC SẢN PHẨM
          </h2>
          <button
            onClick={() => onCategoryChange?.("")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              !selectedCategory || selectedCategory === ""
                ? "bg-primary text-primary-foreground"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Tất Cả
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous categories"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            disabled={currentIndex + itemsToShow >= categories.length}
            className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next categories"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out gap-6"
          style={{
            transform: `translateX(-${currentIndex * (100 / itemsToShow)}%)`,
          }}
        >
          {categories.map((category, index) => {
            const isActive = selectedCategory === category.id;
            return (
              <div
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                className={`group relative overflow-hidden rounded-2xl cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl flex-shrink-0 ${
                  isActive ? "scale-105 shadow-2xl" : ""
                }`}
                style={{
                  aspectRatio: "4/5",
                  animationDelay: `${index * 100}ms`,
                  width: `calc(${100 / itemsToShow}% - 1.5rem)`,
                }}
              >
                {/* Background Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center bg-gray-200 transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundImage: `url(${category.image})` }}
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-semibold text-lg drop-shadow-lg">
                      {category.name}
                    </h3>
                    <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center group-hover:bg-white transition-colors duration-300">
                      <svg
                        className="w-5 h-5 text-black"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
