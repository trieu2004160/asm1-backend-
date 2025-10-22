import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ordersApi } from "@/lib/api";
import { authApi, AuthUser } from "@/lib/api";

const PaymentSuccess = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<AuthUser | null>(authApi.getCurrentUser());
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<"success" | "failed" | "pending">("pending");

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
      handlePaymentReturn();
    }
  }, [id, user, navigate, toast]);

  const handlePaymentReturn = async () => {
    try {
      setLoading(true);
      
      // Get payment status from URL params
      const paymentParam = searchParams.get("payment");
      const status = searchParams.get("status");
      
      console.log("💳 Payment return:", { paymentParam, status });
      
      if (paymentParam === "success" || status === "success") {
        // Payment successful
        setPaymentStatus("success");
        
        // Update order status in backend
        await ordersApi.completePayment(id!, "success");
        
        toast({
          title: "Thanh toán thành công!",
          description: "Đơn hàng của bạn đã được thanh toán thành công.",
        });
        
      } else if (paymentParam === "cancelled" || status === "cancelled") {
        // Payment cancelled
        setPaymentStatus("failed");
        
        // Update order status in backend
        await ordersApi.completePayment(id!, "cancelled");
        
        toast({
          title: "Thanh toán bị hủy",
          description: "Thanh toán đã bị hủy. Bạn có thể thử lại.",
          variant: "destructive",
        });
        
      } else {
        // Unknown status, check with backend
        try {
          const paymentInfo = await ordersApi.checkPaymentStatus(id!);
          if (paymentInfo.status === "paid") {
            setPaymentStatus("success");
          } else {
            setPaymentStatus("pending");
          }
        } catch (error) {
          setPaymentStatus("pending");
        }
      }
      
    } catch (error: any) {
      console.error("Error handling payment return:", error);
      setPaymentStatus("failed");
      toast({
        title: "Lỗi xử lý thanh toán",
        description: "Có lỗi xảy ra khi xử lý thông tin thanh toán.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
            Đang xử lý thông tin thanh toán...
          </p>
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
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              {paymentStatus === "success" && (
                <>
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <CardTitle className="text-2xl text-green-600">
                    Thanh toán thành công!
                  </CardTitle>
                </>
              )}
              {paymentStatus === "failed" && (
                <>
                  <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                  <CardTitle className="text-2xl text-red-600">
                    Thanh toán thất bại
                  </CardTitle>
                </>
              )}
              {paymentStatus === "pending" && (
                <>
                  <Clock className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                  <CardTitle className="text-2xl text-yellow-600">
                    Đang xử lý thanh toán
                  </CardTitle>
                </>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentStatus === "success" && (
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground">
                    Đơn hàng #{id?.slice(-8).toUpperCase()} đã được thanh toán thành công.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Chúng tôi sẽ xử lý đơn hàng của bạn trong thời gian sớm nhất.
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => navigate(`/orders/${id}`)}
                      className="flex-1"
                    >
                      Xem đơn hàng
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => navigate("/orders")}
                      className="flex-1"
                    >
                      Danh sách đơn hàng
                    </Button>
                  </div>
                </div>
              )}
              
              {paymentStatus === "failed" && (
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground">
                    Thanh toán đã bị hủy hoặc thất bại.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Bạn có thể thử thanh toán lại hoặc chọn phương thức thanh toán khác.
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => navigate(`/orders/${id}`)}
                      className="flex-1"
                    >
                      Xem đơn hàng
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => navigate("/")}
                      className="flex-1"
                    >
                      Về trang chủ
                    </Button>
                  </div>
                </div>
              )}
              
              {paymentStatus === "pending" && (
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground">
                    Hệ thống đang xử lý thông tin thanh toán của bạn.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Vui lòng đợi trong giây lát hoặc kiểm tra lại sau.
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => navigate(`/orders/${id}`)}
                      className="flex-1"
                    >
                      Kiểm tra đơn hàng
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => navigate("/orders")}
                      className="flex-1"
                    >
                      Danh sách đơn hàng
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PaymentSuccess;
