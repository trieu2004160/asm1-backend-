import { X, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Product } from "./ProductCard";

interface ProductDetailProps {
  product: Product | null;
  onClose: () => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export function ProductDetail({ product, onClose, onEdit, onDelete }: ProductDetailProps) {
  if (!product) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-up">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
        <CardContent className="p-0">
          {/* Header */}
          <div className="sticky top-0 bg-card border-b p-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Chi tiết sản phẩm</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Image */}
            <div className="aspect-square w-full max-w-md mx-auto rounded-lg overflow-hidden">
              <div 
                className="w-full h-full bg-gradient-to-br from-muted to-secondary bg-cover bg-center"
                style={{
                  backgroundImage: product.image ? `url(${product.image})` : undefined,
                }}
              >
                {!product.image && (
                  <div className="flex h-full items-center justify-center">
                    <div className="text-8xl text-muted-foreground opacity-50">👔</div>
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                <div className="text-3xl font-bold text-primary mb-4">
                  {formatPrice(product.price)}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Mô tả sản phẩm</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Product Details */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Thông tin sản phẩm</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Mã sản phẩm:</span>
                    <div className="font-mono">{product.id}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tình trạng:</span>
                    <div className="text-green-600 font-medium">Còn hàng</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button 
                onClick={() => onEdit(product)}
                className="flex-1 btn-outline-fashion"
              >
                <Edit className="h-4 w-4 mr-2" />
                Chỉnh sửa
              </Button>
              <Button 
                onClick={() => onDelete(product.id)}
                variant="destructive"
                className="flex-1"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}