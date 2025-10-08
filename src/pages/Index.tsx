import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ShoppingBag, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/Navigation";
import { ProductCard, Product } from "@/components/ProductCard";
import { ProductForm } from "@/components/ProductForm";
import { Footer } from "@/components/Footer";
import { Pagination } from "@/components/Pagination";
import { CategoryGrid } from "@/components/CategoryGrid";
import { productsApi, ApiProduct, authApi, AuthUser } from "@/lib/api";
import { AuthDialog } from "@/components/AuthDialog";
import heroFashion from "@/assets/hero-fashion.jpg";

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [user, setUser] = useState<AuthUser | null>(authApi.getCurrentUser());
  const [showAuth, setShowAuth] = useState(false);

  // Pagination state for "Tất cả sản phẩm" section
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  // Category filtering
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await productsApi.list();
        const mapped: Product[] = data.map((p: ApiProduct) => ({
          id: String(p._id || p.id),
          name: p.name,
          description: p.description,
          price: p.price,
          image: p.image,
          category: p.category,
        }));
        setProducts(mapped);
      } catch (e) {
        console.error(e);
        toast({
          title: "Lỗi",
          description: "Không tải được danh sách sản phẩm",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [toast]);

  // Check URL params for category filter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get("category");
    if (category) {
      setSelectedCategory(category);
      // Scroll to products section
      setTimeout(() => {
        const productsSection = document.getElementById("products");
        if (productsSection) {
          productsSection.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Filter products based on search term and category
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter(
        (product) =>
          product.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [products, searchTerm, selectedCategory]);

  const handleAddProduct = () => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product: Product) => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleSaveProduct = async (
    productData: Omit<Product, "id"> & { id?: string }
  ) => {
    try {
      if (productData.id) {
        console.log("🔄 Updating product with data:", {
          id: productData.id,
          name: productData.name,
          description: productData.description,
          price: productData.price,
          image: productData.image,
          category: productData.category,
        });
        const updated = await productsApi.update(productData.id, {
          name: productData.name,
          description: productData.description,
          price: productData.price,
          image: productData.image,
          category: productData.category,
        });
        console.log("✅ Backend returned:", updated);
        setProducts((prev) =>
          prev.map((p) =>
            p.id === productData.id
              ? {
                  id: String(updated._id || updated.id),
                  name: updated.name,
                  description: updated.description,
                  price: updated.price,
                  image: updated.image,
                  category: updated.category,
                }
              : p
          )
        );
        toast({
          title: "Thành công!",
          description: "Sản phẩm đã được cập nhật.",
        });
      } else {
        const created = await productsApi.create({
          name: productData.name,
          description: productData.description,
          price: productData.price,
          image: productData.image,
          category: productData.category,
        });
        const newProduct: Product = {
          id: String(created._id || created.id),
          name: created.name,
          description: created.description,
          price: created.price,
          image: created.image,
          category: created.category,
        };
        setProducts((prev) => [newProduct, ...prev]);
        toast({
          title: "Thành công!",
          description: "Sản phẩm mới đã được thêm.",
        });
      }
    } catch (e) {
      console.error(e);
      toast({
        title: "Lỗi",
        description: "Không lưu được sản phẩm",
        variant: "destructive",
      });
    } finally {
      setShowForm(false);
      setEditingProduct(null);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    try {
      await productsApi.remove(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast({
        title: "Đã xóa!",
        description: "Sản phẩm đã được xóa.",
        variant: "destructive",
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Lỗi",
        description: "Không xóa được sản phẩm",
        variant: "destructive",
      });
    }
  };

  // Dummy function để giữ compatibility với ProductCard
  const handleViewProduct = () => {
    // Navigation được handle trong ProductCard
  };

  const handleAuthRequired = () => {
    // Save current location for redirect after login
    sessionStorage.setItem(
      "redirectAfterLogin",
      window.location.pathname + window.location.search
    );
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        onAddProduct={handleAddProduct}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        user={user}
        onShowAuth={() => setShowAuth(true)}
        onLogout={() => {
          authApi.logout();
          setUser(null);
        }}
      />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={heroFashion}
            alt="Fashion Collection"
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter">
              <span className="block text-white mb-2 animate-fade-in-up drop-shadow-lg">
                LUXURY
              </span>
              <span className="block bg-gradient-to-r from-[#CDAD5D] via-[#F4E4A6] to-[#CDAD5D] bg-clip-text text-transparent animate-gradient-x drop-shadow-2xl">
                REDEFINED
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Khám phá bộ sưu tập thời trang cao cấp. Phong cách hiện đại, chất
              lượng vượt trội.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button
                size="lg"
                className="min-w-[200px] font-semibold text-base bg-[#CDAD5D] border-gray-600 text-white hover:bg-gray-900 hover:border-gray-400"
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Mua sắm ngay
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="min-w-[200px] font-semibold text-base bg-[#CDAD5D] border-gray-600 text-white hover:bg-gray-900 hover:border-gray-400"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Xem bộ sưu tập
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
              <div className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-gray-400">
                  500+
                </div>
                <div className="text-sm text-gray-500">Sản phẩm</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-gray-400">
                  100%
                </div>
                <div className="text-sm text-gray-500">Chính hãng</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-gray-400">
                  24/7
                </div>
                <div className="text-sm text-gray-500">Hỗ trợ</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-gray-400/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-gray-400 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Category Grid Section */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <CategoryGrid
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Tại Sao Chọn Chúng Tôi</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Trải nghiệm mua sắm tuyệt vời với dịch vụ chuyên nghiệp
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg bg-white hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-700/20 mb-4">
                <svg
                  className="w-8 h-8 text-gray-950"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-black">
                Chất Lượng Đảm Bảo
              </h3>
              <p className="text-amber-400 text-sm">
                Sản phẩm chính hãng, kiểm định kỹ lưỡng
              </p>
            </div>
            <div className="text-center p-6 rounded-lg bg-white hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-600/20 mb-4">
                <svg
                  className="w-8 h-8 text-gray-950"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-black">
                Giao Hàng Nhanh
              </h3>
              <p className="text-amber-400 text-sm">
                Miễn phí vận chuyển cho đơn hàng từ 500K
              </p>
            </div>
            <div className="text-center p-6 rounded-lg bg-white hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-500/20 mb-4">
                <svg
                  className="w-8 h-8 text-gray-950"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-black">
                Đổi Trả Dễ Dàng
              </h3>
              <p className="text-amber-400 text-sm">
                Chính sách đổi trả trong vòng 30 ngày
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section
        id="products"
        className="relative py-20 bg-gradient-to-b from-muted/20 via-muted/10 to-background"
      >
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-foreground tracking-tight">
              Sản Phẩm Của Chúng Tôi
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Khám phá bộ sưu tập thời trang mới nhất – phong cách, hiện đại và
              tinh tế
            </p>

            {/* Decorative line */}
            <div className="mt-6 flex justify-center">
              <span className="w-24 h-1 bg-primary rounded-full"></span>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent border-primary mb-4"></div>
              <p>Đang tải sản phẩm...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4 opacity-50">🛍️</div>
              <h3 className="text-2xl font-semibold mb-2">
                {searchTerm
                  ? "Không tìm thấy sản phẩm"
                  : "Chưa có sản phẩm nào"}
              </h3>
              <p className="text-muted-foreground mb-8">
                {searchTerm
                  ? "Hãy thử tìm kiếm với từ khóa khác"
                  : "Bắt đầu thêm sản phẩm đầu tiên của bạn ngay hôm nay."}
              </p>

              {!searchTerm && (
                <Button
                  onClick={handleAddProduct}
                  className="px-8 py-3 text-base rounded-full font-semibold bg-primary hover:bg-primary/90 text-white transition-all shadow-md hover:shadow-lg"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Thêm sản phẩm đầu tiên
                </Button>
              )}
            </div>
          )}

          {/* Products by Categories */}
          {!loading && filteredProducts.length > 0 && (
            <div className="space-y-16">
              {/* Category: Áo Polo */}
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                    Áo Polo
                  </h3>
                  <Button
                    variant="outline"
                    className="text-sm font-medium hover:bg-gray-900 hover:text-white border-gray-600"
                  >
                    Xem Tất Cả
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredProducts
                    .filter((product) => product.category === "polo")
                    .slice(0, 4)
                    .map((product, index) => (
                      <div
                        key={product.id}
                        className="animate-fade-up transform hover:scale-[1.02] transition-all duration-300"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <ProductCard
                          product={product}
                          onEdit={handleEditProduct}
                          onDelete={handleDeleteProduct}
                          onView={handleViewProduct}
                          canManage={!!user}
                          isAuthenticated={!!user}
                          onAuthRequired={handleAuthRequired}
                        />
                      </div>
                    ))}
                </div>
              </div>{" "}
              {/* Category: Quần Jean */}
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                    Quần Jean
                  </h3>
                  <Button
                    variant="outline"
                    className="text-sm font-medium hover:bg-gray-900 hover:text-white border-gray-600"
                  >
                    Xem tất cả →
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts
                    .filter((product) => product.category === "jean")
                    .slice(0, 4)
                    .map((product, index) => (
                      <div
                        key={product.id}
                        className="animate-fade-up transform hover:scale-[1.02] transition-all duration-300"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <ProductCard
                          product={product}
                          onEdit={handleEditProduct}
                          onDelete={handleDeleteProduct}
                          onView={handleViewProduct}
                          canManage={!!user}
                          isAuthenticated={!!user}
                          onAuthRequired={handleAuthRequired}
                        />
                      </div>
                    ))}
                </div>
              </div>
              {/* Category: Áo Sơ Mi */}
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                    Áo Sơ Mi
                  </h3>
                  <Button
                    variant="outline"
                    className="text-sm font-medium hover:bg-gray-900 hover:text-white border-gray-600"
                  >
                    Xem tất cả →
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts
                    .filter((product) => product.category === "somi")
                    .slice(0, 4)
                    .map((product, index) => (
                      <div
                        key={product.id}
                        className="animate-fade-up transform hover:scale-[1.02] transition-all duration-300"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <ProductCard
                          product={product}
                          onEdit={handleEditProduct}
                          onDelete={handleDeleteProduct}
                          onView={handleViewProduct}
                          canManage={!!user}
                          isAuthenticated={!!user}
                          onAuthRequired={handleAuthRequired}
                        />
                      </div>
                    ))}
                </div>
              </div>
              {/* Category: Áo Thun */}
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                    Áo Thun
                  </h3>
                  <Button
                    variant="outline"
                    className="text-sm font-medium hover:bg-gray-900 hover:text-white border-gray-600"
                  >
                    Xem tất cả →
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts
                    .filter((product) => product.category === "thun")
                    .slice(0, 4)
                    .map((product, index) => (
                      <div
                        key={product.id}
                        className="animate-fade-up transform hover:scale-[1.02] transition-all duration-300"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <ProductCard
                          product={product}
                          onEdit={handleEditProduct}
                          onDelete={handleDeleteProduct}
                          onView={handleViewProduct}
                          canManage={!!user}
                          isAuthenticated={!!user}
                          onAuthRequired={handleAuthRequired}
                        />
                      </div>
                    ))}
                </div>
              </div>
              {/* Fallback: Tất cả sản phẩm khác */}
              {filteredProducts.length > 0 &&
                (() => {
                  // Pagination logic for "Tất cả sản phẩm" section
                  const startIndex = (currentPage - 1) * itemsPerPage;
                  const endIndex = startIndex + itemsPerPage;
                  const paginatedProducts = filteredProducts.slice(
                    startIndex,
                    endIndex
                  );

                  return (
                    <div>
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                          🛍️ Tất cả sản phẩm
                        </h3>
                        <Button
                          variant="outline"
                          className="text-sm font-medium hover:bg-gray-900 hover:text-white border-gray-600"
                        >
                          Xem tất cả →
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {paginatedProducts.map((product, index) => (
                          <div
                            key={product.id}
                            className="animate-fade-up transform hover:scale-[1.02] transition-all duration-300"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <ProductCard
                              product={product}
                              onEdit={handleEditProduct}
                              onDelete={handleDeleteProduct}
                              onView={handleViewProduct}
                              canManage={!!user}
                              isAuthenticated={!!user}
                              onAuthRequired={handleAuthRequired}
                            />
                          </div>
                        ))}
                      </div>

                      {/* Pagination component */}
                      <Pagination
                        currentPage={currentPage}
                        totalItems={filteredProducts.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={(newItemsPerPage) => {
                          setItemsPerPage(newItemsPerPage);
                          setCurrentPage(1); // Reset to first page when changing items per page
                        }}
                      />
                    </div>
                  );
                })()}
            </div>
          )}
        </div>

        {/* Subtle decorative background shape */}
        <div className="absolute inset-0 -z-10 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent"></div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Khách Hàng Nói Gì</h2>
            <p className="text-muted-foreground">
              Trải nghiệm thực tế từ khách hàng của chúng tôi
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Nguyễn Văn A",
                comment:
                  "Sản phẩm chất lượng tuyệt vời, giao hàng nhanh chóng. Tôi rất hài lòng!",
                rating: 5,
                avatar: "👨",
              },
              {
                name: "Trần Thị B",
                comment:
                  "Thiết kế đẹp, chất liệu tốt. Sẽ tiếp tục ủng hộ shop!",
                rating: 5,
                avatar: "👩",
              },
              {
                name: "Lê Minh C",
                comment: "Dịch vụ chăm sóc khách hàng tận tình, giá cả hợp lý.",
                rating: 5,
                avatar: "🧑",
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-card p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center mb-4">
                  <div className="text-4xl mr-3">{testimonial.avatar}</div>
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <div className="flex text-yellow-500">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i}>⭐</span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground italic">
                  "{testimonial.comment}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-accent/5">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Đăng Ký Nhận Tin</h2>
            <p className="text-muted-foreground mb-8">
              Nhận thông tin về sản phẩm mới và ưu đãi đặc biệt
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Email của bạn"
                className="flex-1 px-4 py-3 rounded-lg border border-input bg-background"
              />
              <Button className="bg-gray-900 border-gray-700 text-white hover:bg-gray-800 hover:border-gray-600 font-semibold px-6 py-3 rounded-lg transition-all">
                Đăng Ký
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <ProductForm
        product={editingProduct}
        onSave={handleSaveProduct}
        onCancel={() => {
          setShowForm(false);
          setEditingProduct(null);
        }}
        isOpen={showForm}
      />

      <AuthDialog
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onAuthenticated={(u) => setUser(u)}
      />
    </div>
  );
};

export default Index;
