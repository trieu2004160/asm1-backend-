import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { CreditCard, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { authApi, AuthUser } from "@/lib/api";

const MockPayment = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<AuthUser | null>(authApi.getCurrentUser());
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  });

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
  }, [user, navigate, toast]);

  const handleInputChange = (field: string, value: string) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
  };

  const handlePayment = async (status: "success" | "failed") => {
    setLoading(true);
    
    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (status === "success") {
        toast({
          title: "Thanh toán thành công!",
          description: "Đơn hàng đã được thanh toán thành công.",
        });
        navigate(`/payment/${id}?payment=success`);
      } else {
        toast({
          title: "Thanh toán thất bại",
          description: "Thanh toán không thành công. Vui lòng thử lại.",
          variant: "destructive",
        });
        navigate(`/payment/${id}?payment=cancelled`);
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Lỗi thanh toán",
        description: "Có lỗi xảy ra khi xử lý thanh toán.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CreditCard className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              <CardTitle className="text-2xl">Thanh toán MockPayOS</CardTitle>
              <p className="text-muted-foreground">
                Trang thanh toán giả lập để test tính năng
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Số thẻ</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={paymentData.cardNumber}
                  onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Ngày hết hạn</Label>
                  <Input
                    id="expiryDate"
                    placeholder="MM/YY"
                    value={paymentData.expiryDate}
                    onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    value={paymentData.cvv}
                    onChange={(e) => handleInputChange("cvv", e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cardholderName">Tên chủ thẻ</Label>
                <Input
                  id="cardholderName"
                  placeholder="NGUYEN VAN A"
                  value={paymentData.cardholderName}
                  onChange={(e) => handleInputChange("cardholderName", e.target.value)}
                />
              </div>
              
              <div className="space-y-2 pt-4">
                <Button
                  onClick={() => handlePayment("success")}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Thanh toán thành công
                    </>
                  )}
                </Button>
                
                <Button
                  variant="destructive"
                  onClick={() => handlePayment("failed")}
                  disabled={loading}
                  className="w-full"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Thanh toán thất bại
                </Button>
              </div>
              
              <div className="text-center text-sm text-muted-foreground">
                <p>🎭 Đây là trang thanh toán giả lập</p>
                <p>Chọn một trong hai nút để test kết quả thanh toán</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MockPayment;
