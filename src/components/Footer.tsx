import { ShoppingBag } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-card border-t py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShoppingBag className="h-6 w-6 text-accent" />
              <span className="font-bold text-xl">Fashion Store</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Thời trang cao cấp cho mọi phong cách sống
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Về Chúng Tôi</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Giới thiệu
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Liên hệ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Tuyển dụng
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Chính Sách</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Chính sách đổi trả
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Bảo mật thông tin
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">
                  Điều khoản sử dụng
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Liên Hệ</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>📧 support@fashion.com</li>
              <li>📞 0123 456 789</li>
              <li>📍 Qui Nhơn, Việt Nam</li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Fashion Store. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
