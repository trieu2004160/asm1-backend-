import { Edit, Trash2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category?: string;
}

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onView: (product: Product) => void;
  canManage?: boolean;
  onAuthRequired?: () => void;
  isAuthenticated?: boolean;
}

export function ProductCard({
  product,
  onEdit,
  onDelete,
  onView,
  canManage,
  onAuthRequired,
  isAuthenticated = false,
}: ProductCardProps) {
  const navigate = useNavigate();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleViewDetails = () => {
    if (!isAuthenticated) {
      onAuthRequired?.();
      return;
    }
    navigate(`/product/${product.id}`);
  };

  return (
    <Card className="product-card group overflow-hidden border-0 shadow-product hover:shadow-hover">
      <div className="relative overflow-hidden">
        <div
          className="aspect-square w-full bg-gradient-to-br from-muted to-secondary bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
          style={{
            backgroundImage: product.image
              ? `url(${product.image})`
              : undefined,
          }}
        >
          {!product.image && (
            <div className="flex h-full items-center justify-center">
              <div className="text-4xl text-muted-foreground opacity-50">
                👔
              </div>
            </div>
          )}
        </div>

        {/* Hover overlay with actions */}
        <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleViewDetails}
            className="bg-white/90 text-black hover:bg-white"
          >
            <Eye className="h-4 w-4" />
          </Button>
          {canManage && (
            <>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onEdit(product)}
                className="bg-white/90 text-black hover:bg-white"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(product.id)}
                className="bg-destructive/90 hover:bg-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary">
            {formatPrice(product.price)}
          </span>
          <Button
            size="sm"
            className="btn-fashion text-sm"
            onClick={handleViewDetails}
          >
            Xem chi tiết
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
