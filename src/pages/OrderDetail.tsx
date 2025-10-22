import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  Calendar,
  User,
  X,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ordersApi, ApiOrder } from "@/lib/api";
import { authApi, AuthUser } from "@/lib/api";

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(authApi.getCurrentUser());

  useEffect(() => {
    if (!user) {
      toast({
        title: "Cần đăng nhập",
        description: "Vui lòng đăng nhập để xem đơn hàng",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (id) {
      loadOrder(id);
      // Check payment status for PayOS orders
      checkPaymentStatus();
    }
  }, [id, user, navigate, toast]);

  const checkPaymentStatus = async () => {
    if (!id) return;

    try {
      const paymentStatus = await ordersApi.checkPaymentStatus(id);
      console.log("💳 Payment status:", paymentStatus);

      // If payment status changed, reload order
      if (order && order.status !== paymentStatus.status) {
        await loadOrder(id);
      }
    } catch (error) {
      console.log("Could not check payment status:", error);
    }
  };

  const loadOrder = async (orderId: string) => {
    try {
      setLoading(true);
      const data = await ordersApi.get(orderId);
      setOrder(data);
    } catch (error: any) {
      console.error("Error loading order:", error);
      toast({
        title: "Lỗi tải đơn hàng",
        description:
          error?.response?.data?.message || "Không thể tải thông tin đơn hàng",
        variant: "destructive",
      });
      navigate("/orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "paid":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Chờ xử lý";
      case "paid":
        return "Đã thanh toán";
      case "shipped":
        return "Đang giao hàng";
      case "delivered":
        return "Đã giao hàng";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const canCancelOrder = (order: ApiOrder) => {
    if (
      order.status === "cancelled" ||
      order.status === "delivered" ||
      order.status === "shipped"
    ) {
      return false;
    }

    // For COD orders, check if within cancellation window
    if (order.paymentMethod === "cash_on_delivery" && order.cancelableUntil) {
      const now = new Date();
      const cancelDeadline = new Date(order.cancelableUntil);
      return now <= cancelDeadline;
    }

    // For online payment orders, only allow cancellation if pending
    return order.status === "pending";
  };

  const handleCancelOrder = async () => {
    if (!order || !canCancelOrder(order)) return;

    try {
      setCancelling(true);
      await ordersApi.cancel(order._id);

      toast({
        title: "Hủy đơn hàng thành công",
        description: "Đơn hàng đã được hủy thành công",
      });

      // Reload order to get updated status
      await loadOrder(order._id);
    } catch (error: any) {
      console.error("Error cancelling order:", error);
      toast({
        title: "Lỗi hủy đơn hàng",
        description: error?.response?.data?.message || "Không thể hủy đơn hàng",
        variant: "destructive",
      });
    } finally {
      setCancelling(false);
    }
  };

  if (!user) {
    return null; // Will redirect
  }

  if (loading) {
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
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent border-primary mb-4"></div>
          <p className="text-muted-foreground">
            Đang tải thông tin đơn hàng...
          </p>
        </div>
      </div>
    );
  }

  if (!order) {
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
        <div className="text-center py-20">
          <div className="text-6xl mb-4 opacity-50">❌</div>
          <h2 className="text-2xl font-semibold mb-2">
            Không tìm thấy đơn hàng
          </h2>
          <p className="text-muted-foreground mb-8">
            Đơn hàng không tồn tại hoặc bạn không có quyền xem
          </p>
          <Button onClick={() => navigate("/orders")}>
            Quay lại danh sách đơn hàng
          </Button>
        </div>
      </div>
    );
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
            onClick={() => navigate("/orders")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              Đơn hàng #{order._id.slice(-8).toUpperCase()}
            </h1>
            <p className="text-muted-foreground">
              Đặt lúc {formatDate(order.createdAt)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Trạng thái đơn hàng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge
                    className={`${getStatusColor(
                      order.status
                    )} text-lg px-4 py-2`}
                  >
                    {getStatusText(order.status)}
                  </Badge>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      {formatPrice(order.totalAmount)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.paymentMethod === "cash_on_delivery"
                        ? "Thanh toán khi nhận hàng"
                        : "Thanh toán online"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Sản phẩm đã đặt</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.products.map((product, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 border rounded-lg"
                    >
                      <div className="w-16 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <Package className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg">
                          {product.name}
                        </h3>
                        <p className="text-muted-foreground">
                          Số lượng: {product.quantity}
                        </p>
                        <p className="text-muted-foreground">
                          Đơn giá: {formatPrice(product.price)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">
                          {formatPrice(product.price * product.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Địa chỉ giao hàng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {order.shippingAddress.fullName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span>{order.shippingAddress.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{order.shippingAddress.address}</span>
                  </div>
                  <p className="ml-6 text-muted-foreground">
                    {order.shippingAddress.city},{" "}
                    {order.shippingAddress.postalCode}
                  </p>
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
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Tạm tính:</span>
                    <span>{formatPrice(order.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phí vận chuyển:</span>
                    <span className="text-green-600">Miễn phí</span>
                  </div>
                  <hr />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Tổng cộng:</span>
                    <span className="text-primary">
                      {formatPrice(order.totalAmount)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Đặt lúc: {formatDate(order.createdAt)}</span>
                  </div>
                  {order.updatedAt !== order.createdAt && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Cập nhật: {formatDate(order.updatedAt)}</span>
                    </div>
                  )}
                </div>

                {order.status === "pending" && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      Đơn hàng đang được xử lý. Bạn sẽ nhận được thông báo khi
                      đơn hàng được cập nhật.
                    </p>
                  </div>
                )}

                {order.status === "shipped" && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Đơn hàng đang được giao. Vui lòng chuẩn bị nhận hàng.
                    </p>
                  </div>
                )}

                {order.status === "delivered" && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      Đơn hàng đã được giao thành công. Cảm ơn bạn đã mua sắm!
                    </p>
                  </div>
                )}

                {order.status === "pending" &&
                  order.paymentMethod === "payos" &&
                  order.paymentUrl && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800 mb-3">
                        Đơn hàng đang chờ thanh toán. Vui lòng hoàn tất thanh
                        toán để tiếp tục.
                      </p>
                      <div className="space-y-2">
                        <Button
                          onClick={() => {
                            console.log("Chuyển hướng đến:", order.paymentUrl);
                            window.location.href = order.paymentUrl!;
                          }}
                          className="w-full"
                        >
                          Thanh toán ngay
                        </Button>
                        <Button
                          variant="outline"
                          onClick={checkPaymentStatus}
                          className="w-full"
                        >
                          Kiểm tra trạng thái thanh toán
                        </Button>
                      </div>
                    </div>
                  )}

                {order.paymentMethod === "cash_on_delivery" &&
                  order.cancelableUntil && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-green-600" />
                        <p className="text-sm text-green-800 font-medium">
                          Có thể hủy đơn trong 24 giờ
                        </p>
                      </div>
                      <p className="text-sm text-green-700">
                        Bạn có thể hủy đơn hàng COD trước{" "}
                        {formatDate(order.cancelableUntil)}
                      </p>
                    </div>
                  )}

                {canCancelOrder(order) && (
                  <div className="mt-4">
                    <Button
                      variant="destructive"
                      onClick={handleCancelOrder}
                      disabled={cancelling}
                      className="w-full"
                    >
                      {cancelling ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                          Đang hủy...
                        </>
                      ) : (
                        <>
                          <X className="h-4 w-4 mr-2" />
                          Hủy đơn hàng
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {order.paymentMethod === "cash_on_delivery" &&
                  order.cancelableUntil &&
                  new Date() > new Date(order.cancelableUntil) &&
                  order.status !== "cancelled" && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <X className="h-4 w-4 text-red-600" />
                        <p className="text-sm text-red-800 font-medium">
                          Không thể hủy đơn
                        </p>
                      </div>
                      <p className="text-sm text-red-700">
                        Thời gian hủy đơn COD đã hết hạn (24 giờ)
                      </p>
                    </div>
                  )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default OrderDetail;
