import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { cartUtils, CartState } from "@/lib/cart";
import { ordersApi, ShippingAddress } from "@/lib/api";
import { authApi, AuthUser } from "@/lib/api";

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cart, setCart] = useState<CartState>(cartUtils.getCart());
  const [user, setUser] = useState<AuthUser | null>(authApi.getCurrentUser());
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");

  const [shippingForm, setShippingForm] = useState<ShippingAddress>({
    fullName: "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) {
      toast({
        title: "Cần đăng nhập",
        description: "Vui lòng đăng nhập để thanh toán",
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
      navigate("/cart");
      return;
    }

    // Update email if user is logged in
    setShippingForm((prev) => ({
      ...prev,
      email: user.email,
    }));
  }, [user, cart.items.length, navigate, toast]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!shippingForm.fullName.trim()) {
      newErrors.fullName = "Họ tên là bắt buộc";
    }
    if (!shippingForm.email.trim()) {
      newErrors.email = "Email là bắt buộc";
    } else if (!/\S+@\S+\.\S+/.test(shippingForm.email)) {
      newErrors.email = "Email không hợp lệ";
    }
    if (!shippingForm.phone.trim()) {
      newErrors.phone = "Số điện thoại là bắt buộc";
    }
    if (!shippingForm.address.trim()) {
      newErrors.address = "Địa chỉ là bắt buộc";
    }
    if (!shippingForm.city.trim()) {
      newErrors.city = "Thành phố là bắt buộc";
    }
    if (!shippingForm.postalCode.trim()) {
      newErrors.postalCode = "Mã bưu điện là bắt buộc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const orderData = {
        products: cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        shippingAddress: shippingForm,
        paymentMethod,
      };

      console.log("🛒 Submitting order with data:", {
        orderData,
        cartItems: cart.items,
        user: user?.email,
      });

      const order = await ordersApi.create(orderData);

      // Clear cart after successful order
      cartUtils.clearCart();
      setCart(cartUtils.getCart());

      toast({
        title: "Đặt hàng thành công!",
        description: `Đơn hàng #${order._id.slice(-8)} đã được tạo`,
      });

      navigate(`/orders/${order._id}`);
    } catch (error: any) {
      console.error("Order creation error:", error);
      toast({
        title: "Lỗi đặt hàng",
        description:
          error?.response?.data?.message || "Có lỗi xảy ra khi đặt hàng",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (!user || cart.items.length === 0) {
    return null; // Will redirect
  }

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
            onClick={() => navigate("/cart")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại giỏ hàng
          </Button>
          <h1 className="text-3xl font-bold">Thanh toán</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Shipping Information */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Thông tin giao hàng
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Họ và tên *</Label>
                      <Input
                        id="fullName"
                        value={shippingForm.fullName}
                        onChange={(e) =>
                          setShippingForm({
                            ...shippingForm,
                            fullName: e.target.value,
                          })
                        }
                        className={errors.fullName ? "border-destructive" : ""}
                      />
                      {errors.fullName && (
                        <p className="text-sm text-destructive">
                          {errors.fullName}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={shippingForm.email}
                        onChange={(e) =>
                          setShippingForm({
                            ...shippingForm,
                            email: e.target.value,
                          })
                        }
                        className={errors.email ? "border-destructive" : ""}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại *</Label>
                    <Input
                      id="phone"
                      value={shippingForm.phone}
                      onChange={(e) =>
                        setShippingForm({
                          ...shippingForm,
                          phone: e.target.value,
                        })
                      }
                      className={errors.phone ? "border-destructive" : ""}
                    />
                    {errors.phone && (
                      <p className="text-sm text-destructive">{errors.phone}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Địa chỉ *</Label>
                    <Textarea
                      id="address"
                      value={shippingForm.address}
                      onChange={(e) =>
                        setShippingForm({
                          ...shippingForm,
                          address: e.target.value,
                        })
                      }
                      className={errors.address ? "border-destructive" : ""}
                      rows={3}
                    />
                    {errors.address && (
                      <p className="text-sm text-destructive">
                        {errors.address}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">Thành phố *</Label>
                      <Input
                        id="city"
                        value={shippingForm.city}
                        onChange={(e) =>
                          setShippingForm({
                            ...shippingForm,
                            city: e.target.value,
                          })
                        }
                        className={errors.city ? "border-destructive" : ""}
                      />
                      {errors.city && (
                        <p className="text-sm text-destructive">
                          {errors.city}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Mã bưu điện *</Label>
                      <Input
                        id="postalCode"
                        value={shippingForm.postalCode}
                        onChange={(e) =>
                          setShippingForm({
                            ...shippingForm,
                            postalCode: e.target.value,
                          })
                        }
                        className={
                          errors.postalCode ? "border-destructive" : ""
                        }
                      />
                      {errors.postalCode && (
                        <p className="text-sm text-destructive">
                          {errors.postalCode}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Phương thức thanh toán
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash_on_delivery"
                        checked={paymentMethod === "cash_on_delivery"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="h-4 w-4"
                      />
                      <div>
                        <div className="font-medium">
                          Thanh toán khi nhận hàng
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Bạn sẽ thanh toán khi nhận được hàng
                        </div>
                      </div>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="stripe"
                        checked={paymentMethod === "stripe"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="h-4 w-4"
                      />
                      <div>
                        <div className="font-medium">
                          Thanh toán online (Stripe)
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Thanh toán bằng thẻ tín dụng/ghi nợ
                        </div>
                      </div>
                    </label>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Tóm tắt đơn hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-3">
                    {cart.items.map((item) => (
                      <div
                        key={item.productId}
                        className="flex items-center gap-3"
                      >
                        <div className="w-12 h-12 bg-muted rounded overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <Truck className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} × {formatPrice(item.price)}
                          </p>
                        </div>
                        <p className="font-medium">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <hr />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Tạm tính:</span>
                      <span>{formatPrice(cart.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Phí vận chuyển:</span>
                      <span className="text-green-600">Miễn phí</span>
                    </div>
                    <hr />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Tổng cộng:</span>
                      <span className="text-primary">
                        {formatPrice(cart.totalAmount)}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? "Đang xử lý..." : "Đặt hàng"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default Checkout;
