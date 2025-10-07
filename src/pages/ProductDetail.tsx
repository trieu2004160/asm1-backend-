import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  ShoppingCart,
  Star,
  Truck,
  Shield,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Footer } from "@/components/Footer";
import { ProductForm } from "@/components/ProductForm";
import { productsApi, ApiProduct, authApi, AuthUser } from "@/lib/api";
import { Product } from "@/components/ProductCard";
import { Store, LogIn, LogOut } from "lucide-react";

// Extended Product type với nhiều ảnh và thông tin chi tiết
interface ExtendedProduct extends Product {
  images?: string[];
  category?: string;
  brand?: string;
  stock?: number;
  rating?: number;
  reviewCount?: number;
  specifications?: { label: string; value: string }[];
  features?: string[];
}

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [product, setProduct] = useState<ExtendedProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [user] = useState<AuthUser | null>(authApi.getCurrentUser());
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<
    "description" | "specifications" | "reviews"
  >("description");

  // Mock suggested products - trong thực tế sẽ lấy từ API
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);

  const handleLogout = () => {
    authApi.logout();
    navigate("/");
  };

  const NavigationBar = () => (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <Store className="h-6 w-6 text-accent" />
          <span className="font-bold text-xl">Fashion Store</span>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Xin chào, {user.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Đăng xuất
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/login")}
            >
              <LogIn className="h-4 w-4 mr-2" />
              Đăng nhập
            </Button>
          )}
        </div>
      </div>
    </nav>
  );

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await productsApi.get(id);

        // Map dữ liệu và thêm mock data cho demo
        const mappedProduct: ExtendedProduct = {
          id: String(data._id || data.id),
          name: data.name,
          description: data.description,
          price: data.price,
          image: data.image,
          // Mock extended data
          images: data.image
            ? [data.image, data.image, data.image, data.image]
            : [],
          category: "Thời trang",
          brand: "Brand Name",
          stock: 25,
          rating: 4.5,
          reviewCount: 128,
          specifications: [
            { label: "Chất liệu", value: "Cotton 100%" },
            { label: "Xuất xứ", value: "Việt Nam" },
            { label: "Size", value: "S, M, L, XL, XXL" },
            { label: "Màu sắc", value: "Đen, Trắng, Xanh" },
          ],
          features: [
            "Chất liệu vải cao cấp, thoáng mát",
            "Thiết kế hiện đại, trẻ trung",
            "Dễ dàng phối đồ",
            "Bền đẹp sau nhiều lần giặt",
          ],
        };
        setProduct(mappedProduct);

        // Load suggested products
        const allProducts = await productsApi.list();
        const suggested = allProducts
          .filter((p) => String(p._id || p.id) !== mappedProduct.id)
          .slice(0, 4)
          .map((p) => ({
            id: String(p._id || p.id),
            name: p.name,
            description: p.description,
            price: p.price,
            image: p.image,
          }));
        setSuggestedProducts(suggested);
      } catch (error) {
        console.error("Error loading product:", error);
        toast({
          title: "Lỗi",
          description: "Không thể tải thông tin sản phẩm",
          variant: "destructive",
        });
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, navigate, toast]);

  const handleEdit = () => {
    if (!user) {
      toast({
        title: "Yêu cầu đăng nhập",
        description: "Vui lòng đăng nhập để chỉnh sửa sản phẩm",
        variant: "destructive",
      });
      return;
    }
    setShowEditForm(true);
  };

  const handleDelete = async () => {
    if (!user) {
      toast({
        title: "Yêu cầu đăng nhập",
        description: "Vui lòng đăng nhập để xóa sản phẩm",
        variant: "destructive",
      });
      return;
    }

    if (
      !product ||
      !window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")
    ) {
      return;
    }

    try {
      await productsApi.remove(product.id);
      toast({
        title: "Thành công",
        description: "Đã xóa sản phẩm",
      });
      navigate("/");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa sản phẩm",
        variant: "destructive",
      });
    }
  };

  const handleSaveProduct = async (productData: Omit<Product, "id">) => {
    if (!product) return;

    try {
      const apiData: Partial<ApiProduct> = {
        name: productData.name,
        description: productData.description,
        price: productData.price,
        image: productData.image,
      };

      const updated = await productsApi.update(product.id, apiData);
      const updatedProduct: ExtendedProduct = {
        ...product,
        id: String(updated._id || updated.id),
        name: updated.name,
        description: updated.description,
        price: updated.price,
        image: updated.image,
      };

      setProduct(updatedProduct);
      setShowEditForm(false);
      toast({
        title: "Thành công",
        description: "Đã cập nhật sản phẩm",
      });
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật sản phẩm",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationBar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-muted rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-20 bg-muted rounded"></div>
                <div className="h-10 bg-muted rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationBar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-muted-foreground mb-4">
              Không tìm thấy sản phẩm
            </h1>
            <Button onClick={() => navigate("/")} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay về trang chủ
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const displayImages =
    product.images && product.images.length > 0
      ? product.images
      : [product.image];

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />

      <div className="container mx-auto px-4 py-8">
        <Button
          variant="outline"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>

        {/* Product Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Left Column - Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square overflow-hidden rounded-lg bg-muted border">
              {displayImages[selectedImageIndex] ? (
                <img
                  src={displayImages[selectedImageIndex]}
                  alt={`${product.name} - Product image ${
                    selectedImageIndex + 1
                  }`}
                  title={`View ${product.name} product details`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-muted-foreground">
                    Chưa có hình ảnh
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {displayImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {displayImages.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`aspect-square overflow-hidden rounded-md cursor-pointer border-2 transition-all ${
                      selectedImageIndex === idx
                        ? "border-primary"
                        : "border-transparent hover:border-muted-foreground"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} - Thumbnail image ${idx + 1} of ${
                        displayImages.length
                      }`}
                      title={`Click to view ${product.name} image ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-6">
            {/* Category & Brand */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{product.category}</span>
              {product.brand && (
                <>
                  <span>•</span>
                  <span>{product.brand}</span>
                </>
              )}
            </div>

            {/* Product Name */}
            <div>
              <h1 className="text-3xl font-bold mb-3">{product.name}</h1>

              {/* Rating */}
              {product.rating && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(product.rating!)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {product.rating} ({product.reviewCount} đánh giá)
                  </span>
                </div>
              )}

              {/* Price & Stock */}
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="text-2xl px-4 py-2">
                  {product.price.toLocaleString("vi-VN")}đ
                </Badge>
                {product.stock && (
                  <span className="text-sm text-muted-foreground">
                    Còn {product.stock} sản phẩm
                  </span>
                )}
              </div>
            </div>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Đặc điểm nổi bật</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-primary mt-1">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Services */}
            <div className="grid grid-cols-3 gap-4 py-4 border-t">
              <div className="flex flex-col items-center text-center gap-2">
                <Truck className="h-6 w-6 text-primary" />
                <span className="text-xs text-muted-foreground">
                  Giao hàng nhanh
                </span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <span className="text-xs text-muted-foreground">
                  Bảo hành 12 tháng
                </span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <RotateCcw className="h-6 w-6 text-primary" />
                <span className="text-xs text-muted-foreground">
                  Đổi trả 7 ngày
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button size="lg" className="w-full">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Thêm vào giỏ hàng
              </Button>

              {user && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleEdit}
                    className="flex-1"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Chỉnh sửa
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    className="flex-1"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Xóa
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Information Tabs */}
        <div className="mb-12">
          <div className="border-b mb-6">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab("description")}
                className={`pb-4 px-2 font-medium transition-colors ${
                  activeTab === "description"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Mô tả chi tiết
              </button>
              <button
                onClick={() => setActiveTab("specifications")}
                className={`pb-4 px-2 font-medium transition-colors ${
                  activeTab === "specifications"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Thông số kỹ thuật
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`pb-4 px-2 font-medium transition-colors ${
                  activeTab === "reviews"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Đánh giá ({product.reviewCount || 0})
              </button>
            </div>
          </div>

          <div className="bg-muted/30 rounded-lg p-6">
            {activeTab === "description" && (
              <div className="prose max-w-none">
                <p className="text-foreground leading-relaxed whitespace-pre-line">
                  {product.description}
                  {"\n\n"}
                  Sản phẩm được thiết kế với chất liệu cao cấp, đảm bảo sự thoải
                  mái và bền bỉ cho người sử dụng. Kiểu dáng hiện đại, phù hợp
                  với nhiều phong cách khác nhau.
                  {"\n\n"}
                  Dễ dàng phối hợp với nhiều trang phục và phụ kiện khác nhau,
                  mang đến vẻ ngoài thời thượng và năng động.
                </p>
              </div>
            )}

            {activeTab === "specifications" && product.specifications && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.specifications.map((spec, idx) => (
                  <div key={idx} className="flex border-b pb-3">
                    <span className="font-medium w-1/3">{spec.label}:</span>
                    <span className="text-muted-foreground w-2/3">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="text-center py-8 text-muted-foreground">
                <p>Chưa có đánh giá nào cho sản phẩm này.</p>
                <p className="text-sm mt-2">Hãy là người đầu tiên đánh giá!</p>
              </div>
            )}
          </div>
        </div>

        {/* Suggested Products */}
        {suggestedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Sản phẩm gợi ý</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {suggestedProducts.map((suggestedProduct) => (
                <div
                  key={suggestedProduct.id}
                  onClick={() => navigate(`/product/${suggestedProduct.id}`)}
                  className="border rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-square bg-muted">
                    {suggestedProduct.image ? (
                      <img
                        src={suggestedProduct.image}
                        alt={`${suggestedProduct.name} - Suggested product image`}
                        title={`View ${suggestedProduct.name} product details`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium mb-2 line-clamp-2 text-sm">
                      {suggestedProduct.name}
                    </h3>
                    <p className="text-primary font-bold">
                      {suggestedProduct.price.toLocaleString("vi-VN")}đ
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />

      <ProductForm
        product={product}
        onSave={handleSaveProduct}
        onCancel={() => setShowEditForm(false)}
        isOpen={showEditForm}
      />
    </div>
  );
};

export default ProductDetailPage;
