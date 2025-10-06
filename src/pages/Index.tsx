import { useState, useMemo, useEffect } from "react";
import { Plus, ShoppingBag, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/Navigation";
import { ProductCard, Product } from "@/components/ProductCard";
import { ProductForm } from "@/components/ProductForm";
import { ProductDetail } from "@/components/ProductDetail";
import heroImage from "@/assets/fashion-hero.jpg";
import { productsApi, ApiProduct, authApi, AuthUser } from "@/lib/api";
import { AuthDialog } from "@/components/AuthDialog";

const Index = () => {
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [user, setUser] = useState<AuthUser | null>(authApi.getCurrentUser());
  const [showAuth, setShowAuth] = useState(false);
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

  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  // Filter products based on search term
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

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
        const updated = await productsApi.update(productData.id, {
          name: productData.name,
          description: productData.description,
          price: productData.price,
          image: productData.image,
        });
        setProducts((prev) =>
          prev.map((p) =>
            p.id === productData.id
              ? {
                  id: String(updated._id || updated.id),
                  name: updated.name,
                  description: updated.description,
                  price: updated.price,
                  image: updated.image,
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
        });
        const newProduct: Product = {
          id: String(created._id || created.id),
          name: created.name,
          description: created.description,
          price: created.price,
          image: created.image,
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
      setViewingProduct(null);
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

  const handleViewProduct = (product: Product) => {
    setViewingProduct(product);
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
      <section className="relative overflow-hidden">
        <div
          className="h-96 bg-cover bg-center hero-gradient relative"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative container mx-auto px-4 h-full flex items-center">
            <div className="text-white max-w-2xl animate-fade-up">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-6 w-6 text-accent" />
                <span className="text-accent font-medium">
                  Premium Collection
                </span>
              </div>
              <h1 className="text-5xl font-bold mb-4 leading-tight">
                Thời Trang Cao Cấp
                <br />
                <span className="text-accent">Dành Cho Bạn</span>
              </h1>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Khám phá bộ sưu tập thời trang độc quyền với chất lượng vượt
                trội và thiết kế hiện đại, mang đến phong cách hoàn hảo cho mọi
                dịp.
              </p>
              <Button
                size="lg"
                className="btn-fashion text-lg px-8 py-6"
                onClick={() =>
                  document
                    .getElementById("products")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Khám Phá Ngay
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-20">Đang tải...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4 opacity-50">🛍️</div>
              <h3 className="text-2xl font-semibold mb-2">
                {searchTerm
                  ? "Không tìm thấy sản phẩm"
                  : "Chưa có sản phẩm nào"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm
                  ? "Hãy thử tìm kiếm với từ khóa khác"
                  : "Hãy thêm sản phẩm đầu tiên của bạn"}
              </p>
              {!searchTerm && (
                <Button onClick={handleAddProduct} className="btn-fashion">
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm sản phẩm đầu tiên
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <ProductCard
                    product={product}
                    onEdit={handleEditProduct}
                    onDelete={handleDeleteProduct}
                    onView={handleViewProduct}
                    canManage={!!user}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

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

      <ProductDetail
        product={viewingProduct}
        onClose={() => {
          setViewingProduct(null);
        }}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
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
