import { Plus, Store, Search, LogIn, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthUser, authApi } from "@/lib/api";

interface NavigationProps {
  onAddProduct: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  user: AuthUser | null;
  onShowAuth: () => void;
  onLogout: () => void;
}

export function Navigation({
  onAddProduct,
  searchTerm,
  onSearchChange,
  user,
  onShowAuth,
  onLogout,
}: NavigationProps) {
  const navigate = useNavigate();
  return (
    <nav className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-black rounded-lg flex items-center justify-center">
              <Store className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                FashionStore
              </h1>
              <p className="text-xs text-muted-foreground text-[#CDAD5D]">
                Premium Clothing
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-muted/50 border-0 focus:bg-background"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {user.email}
                </span>
                <Button
                  onClick={onAddProduct}
                  className="bg-gray-900 border-gray-700 text-white hover:bg-gray-800 hover:border-gray-600 font-semibold px-6 py-3 rounded-lg transition-all"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm sản phẩm
                </Button>
                <Button variant="outline" onClick={onLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Đăng xuất
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => navigate("/login")}>
                <LogIn className="h-4 w-4 mr-2" />
                Đăng nhập
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
