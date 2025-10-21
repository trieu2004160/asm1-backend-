import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Eye, Calendar, CreditCard } from "lucide-react";
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

                  {/* Actions */}
                  <div className="flex justify-end mt-4">
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
