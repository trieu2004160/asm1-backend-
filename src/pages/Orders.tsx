import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Eye, Calendar, CreditCard, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ordersApi, ApiOrder } from "@/lib/api";
import { authApi, AuthUser } from "@/lib/api";

const Orders = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrders, setCancellingOrders] = useState<Set<string>>(new Set());
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

    loadOrders();
  }, [user, navigate, toast]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await ordersApi.list();
      setOrders(data);
    } catch (error: any) {
      console.error("Error loading orders:", error);
      toast({
        title: "Lỗi tải đơn hàng",
        description:
          error?.response?.data?.message || "Không thể tải danh sách đơn hàng",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
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
      case "confirmed":
        return "Đặt hàng thành công";
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
    if (order.status === "cancelled" || order.status === "delivered" || order.status === "shipped") {
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

  const handleCancelOrder = async (orderId: string) => {
    try {
      setCancellingOrders(prev => new Set(prev).add(orderId));
      await ordersApi.cancel(orderId);
      
      toast({
        title: "Hủy đơn hàng thành công",
        description: "Đơn hàng đã được hủy thành công",
      });
      
      // Reload orders to get updated status
      await loadOrders();
    } catch (error: any) {
      console.error("Error cancelling order:", error);
      toast({
        title: "Lỗi hủy đơn hàng",
        description: error?.response?.data?.message || "Không thể hủy đơn hàng",
        variant: "destructive",
      });
    } finally {
      setCancellingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  if (!user) {
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Đơn hàng của tôi</h1>
          <p className="text-muted-foreground">
            Theo dõi trạng thái đơn hàng và lịch sử mua sắm
          </p>
        </div>

        {loading ? (
          /* Loading State */
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent border-primary mb-4"></div>
            <p className="text-muted-foreground">Đang tải đơn hàng...</p>
          </div>
        ) : orders.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <div className="text-6xl mb-4 opacity-50">📦</div>
            <h2 className="text-2xl font-semibold mb-2">
              Chưa có đơn hàng nào
            </h2>
            <p className="text-muted-foreground mb-8">
              Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm ngay!
            </p>
            <Button onClick={() => navigate("/")} className="px-8 py-3">
              <Package className="mr-2 h-5 w-5" />
              Mua sắm ngay
            </Button>
          </div>
        ) : (
          /* Orders List */
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order._id} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        Đơn hàng #{order._id.slice(-8).toUpperCase()}
                      </CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(order.createdAt)}
                        </div>
                        <div className="flex items-center gap-1">
                          <CreditCard className="h-4 w-4" />
                          {order.paymentMethod === "cash_on_delivery"
                            ? "Thanh toán khi nhận hàng"
                            : "Thanh toán online"}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusText(order.status)}
                      </Badge>
                      <p className="text-lg font-semibold mt-2">
                        {formatPrice(order.totalAmount)}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Order Items */}
                  <div className="space-y-3 mb-6">
                    {order.products.map((product, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-muted rounded overflow-hidden flex-shrink-0">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <Package className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Số lượng: {product.quantity}
                          </p>
                        </div>
                        <p className="font-medium">
                          {formatPrice(product.price * product.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Shipping Address */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Địa chỉ giao hàng:</h4>
                    <p className="text-sm text-muted-foreground">
                      {order.shippingAddress.fullName} -{" "}
                      {order.shippingAddress.phone}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.shippingAddress.address},{" "}
                      {order.shippingAddress.city}
                    </p>
                  </div>

                  {/* Cancellation Info */}
                  {order.paymentMethod === "cash_on_delivery" && order.cancelableUntil && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-4 w-4 text-green-600" />
                        <p className="text-sm text-green-800 font-medium">
                          Có thể hủy đơn trong 24 giờ
                        </p>
                      </div>
                      <p className="text-xs text-green-700">
                        Hết hạn: {formatDate(order.cancelableUntil)}
                      </p>
                    </div>
                  )}

                  {order.paymentMethod === "cash_on_delivery" && order.cancelableUntil && 
                   new Date() > new Date(order.cancelableUntil) && order.status !== "cancelled" && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <X className="h-4 w-4 text-red-600" />
                        <p className="text-sm text-red-800 font-medium">
                          Không thể hủy đơn
                        </p>
                      </div>
                      <p className="text-xs text-red-700">
                        Thời gian hủy đơn COD đã hết hạn
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex gap-2">
                      {canCancelOrder(order) && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCancelOrder(order._id)}
                          disabled={cancellingOrders.has(order._id)}
                          className="flex items-center gap-2"
                        >
                          {cancellingOrders.has(order._id) ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              Đang hủy...
                            </>
                          ) : (
                            <>
                              <X className="h-4 w-4" />
                              Hủy đơn
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/orders/${order._id}`)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Xem chi tiết
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Orders;
