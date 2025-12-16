import React from "react";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  isNew?: boolean;
}

const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount * 15000);
};

const ProductCard = ({
  id,
  name,
  price,
  originalPrice,
  image,
  rating,
  reviews,
  isNew,
}: ProductCardProps) => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const handleAddToCart = async () => {
    if (isAdmin) {
      toast({
        title: "Akses Ditolak",
        description: "Admin tidak dapat melakukan pembelian",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Login diperlukan",
        description: "Silakan login untuk menambahkan ke keranjang",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    const { data: existingItem } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("user_id", user.id)
      .eq("product_name", name)
      .maybeSingle();

    if (existingItem) {
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: existingItem.quantity + 1 })
        .eq("id", existingItem.id);

      if (error) {
        toast({
          title: "Error",
          description: "Gagal menambahkan ke keranjang",
          variant: "destructive",
        });
        return;
      }
    } else {
      const { error } = await supabase.from("cart_items").insert({
        user_id: user.id,
        product_name: name,
        product_image: image,
        price: price * 15000,
        quantity: 1,
      });

      if (error) {
        toast({
          title: "Error",
          description: "Gagal menambahkan ke keranjang",
          variant: "destructive",
        });
        return;
      }
    }

    toast({
      title: "Berhasil!",
      description: `${name} ditambahkan ke keranjang`,
    });
  };

  return (
    <div className="group relative bg-card rounded-xl border border-border overflow-hidden transition-all duration-300 hover:border-primary/50 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      <div className="relative aspect-square bg-secondary overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isNew && (
            <span className="px-2 py-1 text-xs font-semibold rounded-md gradient-primary text-primary-foreground">
              NEW
            </span>
          )}
          {discount > 0 && (
            <span className="px-2 py-1 text-xs font-semibold rounded-md bg-destructive text-destructive-foreground">
              -{discount}%
            </span>
          )}
        </div>

        <button className="absolute top-3 right-3 w-8 h-8 rounded-full glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-primary-foreground">
          <Heart className="h-4 w-4" />
        </button>

        {/* Only show Add to Cart button for non-admin users */}
        {!isAdmin && (
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform">
            <Button className="w-full" size="sm" onClick={handleAddToCart}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Tambah ke Keranjang
            </Button>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-foreground mb-1 truncate group-hover:text-primary transition-colors">
          {name}
        </h3>
        
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < Math.floor(rating)
                    ? "text-primary fill-primary"
                    : "text-muted-foreground"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">({reviews})</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-foreground">{formatRupiah(price)}</span>
          {originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatRupiah(originalPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;