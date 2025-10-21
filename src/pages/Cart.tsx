import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { cartUtils, CartState } from "@/lib/cart";
import { authApi, AuthUser } from "@/lib/api";

const Cart = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cart, setCart] = useState<CartState>(cartUtils.getCart());
  const [user, setUser] = useState<AuthUser | null>(authApi.getCurrentUser());
  const [loading, setLoading] = useState(false);

  // Update cart state when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setCart(cartUtils.getCart());
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const updateQuantity = (productId: string, newQuantity: number) => {
    const updatedCart = cartUtils.updateItemQuantity(productId, newQuantity);
    setCart(updatedCart);
  };

  const removeItem = (productId: string) => {
    const updatedCart = cartUtils.removeItem(productId);
    setCart(updatedCart);
    toast({
      title: "Đã xóa sản phẩm",
      description: "Sản phẩm đã được xóa khỏi giỏ hàng",
      variant: "destructive",
    });
  };

  const handleCheckout = () => {
    if (!user) {
      toast({
        title: "Cần đăng nhập",
        description: "Vui lòng đăng nhập để tiếp tục thanh toán",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (cart.items.length === 0) {
      toast({
        title: "Giỏ hàng trống",
        description: "Vui lòng thêm sản phẩm vào giỏ hàng",
        variant: "destructive",
      });
      return;
    }

    navigate("/checkout");
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        onAddProduct={() => {}}
        searchTerm=""
        onSearchChange={() => {}}
        user={user}
        onShowAuth={() => navigate("/login")}
        onLogout={() => {
          authApi.logout();
          setUser(null);
        }}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Tiếp tục mua sắm
          </Button>
          <h1 className="text-3xl font-bold">Giỏ hàng của bạn</h1>
        </div>

        {cart.items.length === 0 ? (
          /* Empty Cart */
          <div className="text-center py-20">
            <div className="text-6xl mb-4 opacity-50">🛒</div>
            <h2 className="text-2xl font-semibold mb-2">Giỏ hàng trống</h2>
            <p className="text-muted-foreground mb-8">
              Hãy thêm một số sản phẩm vào giỏ hàng để bắt đầu mua sắm
            </p>
            <Button onClick={() => navigate("/")} className="px-8 py-3">
              <ShoppingBag className="mr-2 h-5 w-5" />
              Mua sắm ngay
            </Button>
          </div>
        ) : (
          /* Cart with Items */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <Card key={item.productId} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <ShoppingBag className="h-8 w-8" />
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">
                          {item.name}
                        </h3>
                        <p className="text-muted-foreground">
                          {formatPrice(item.price)}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1)
                          }
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <p className="font-semibold text-lg">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.productId)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Tóm tắt đơn hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Số lượng sản phẩm:</span>
                    <span className="font-medium">{cart.totalItems}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tạm tính:</span>
                    <span className="font-medium">
                      {formatPrice(cart.totalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phí vận chuyển:</span>
                    <span className="font-medium text-green-600">Miễn phí</span>
                  </div>
                  <hr />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Tổng cộng:</span>
                    <span className="text-primary">
                      {formatPrice(cart.totalAmount)}
                    </span>
                  </div>

                  <Button
                    onClick={handleCheckout}
                    className="w-full mt-6"
                    size="lg"
                  >
                    Tiến hành thanh toán
                  </Button>

                  {!user && (
                    <p className="text-sm text-muted-foreground text-center">
                      Bạn cần đăng nhập để thanh toán
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Cart;

