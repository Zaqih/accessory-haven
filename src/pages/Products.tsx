import { useState } from "react";
import { Link } from "react-router-dom";
import { Filter, Grid, List, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/products/ProductCard";

const allProducts = [
  {
    id: "1",
    name: "Premium Leather Case",
    price: 49.99,
    originalPrice: 79.99,
    image: "https://images.unsplash.com/photo-1601593346740-925612772716?w=500",
    rating: 4.8,
    reviews: 234,
    isNew: true,
    category: "cases",
  },
  {
    id: "2",
    name: "Wireless Earbuds Pro",
    price: 129.99,
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500",
    rating: 4.9,
    reviews: 567,
    category: "audio",
  },
  {
    id: "3",
    name: "Fast Charging Cable 2M",
    price: 24.99,
    originalPrice: 34.99,
    image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500",
    rating: 4.6,
    reviews: 189,
    category: "cables",
  },
  {
    id: "4",
    name: "Tempered Glass Shield",
    price: 19.99,
    image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=500",
    rating: 4.7,
    reviews: 412,
    isNew: true,
    category: "protection",
  },
  {
    id: "5",
    name: "Magnetic Car Mount",
    price: 34.99,
    image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=500",
    rating: 4.5,
    reviews: 156,
    category: "accessories",
  },
  {
    id: "6",
    name: "Power Bank 20000mAh",
    price: 59.99,
    originalPrice: 89.99,
    image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500",
    rating: 4.8,
    reviews: 298,
    category: "power",
  },
  {
    id: "7",
    name: "Silicone Case Pack",
    price: 29.99,
    image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500",
    rating: 4.4,
    reviews: 123,
    category: "cases",
  },
  {
    id: "8",
    name: "Bluetooth Speaker Mini",
    price: 79.99,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500",
    rating: 4.6,
    reviews: 345,
    isNew: true,
    category: "audio",
  },
];

const categories = [
  { id: "all", name: "All Products" },
  { id: "cases", name: "Cases" },
  { id: "audio", name: "Audio" },
  { id: "cables", name: "Cables" },
  { id: "protection", name: "Protection" },
  { id: "power", name: "Power Banks" },
  { id: "accessories", name: "Accessories" },
];

const Products = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = allProducts.filter((product) => {
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              All Products
            </h1>
            <p className="text-muted-foreground">
              Discover our complete collection of premium smartphone accessories
            </p>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1">
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="lg:w-64 flex-shrink-0">
              <div className="glass rounded-xl p-6 sticky top-24">
                <h3 className="font-semibold text-foreground mb-4">
                  Categories
                </h3>
                <nav className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? "gradient-primary text-primary-foreground"
                          : "text-foreground hover:bg-secondary"
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              <div className="mb-4 text-muted-foreground">
                Showing {filteredProducts.length} products
              </div>
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                    : "space-y-4"
                }
              >
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    No products found matching your criteria.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Products;
