import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, ShoppingCart, Heart, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  image: string | null;
  category: string;
  stock: number;
  is_new: boolean;
  rating: number | null;
  reviews_count: number | null;
}

const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .eq("is_active", true)
        .maybeSingle();

      if (error || !data) {
        toast({
          title: "Error",
          description: "Produk tidak ditemukan",
          variant: "destructive",
        });
        navigate("/products");
        return;
      }

      setProduct(data);
      setIsLoading(false);
    };

    fetchProduct();
  }, [id, navigate, toast]);

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

    if (!product) return;

    const { data: existingItem } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("user_id", user.id)
      .eq("product_name", product.name)
      .maybeSingle();

    if (existingItem) {
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: existingItem.quantity + quantity })
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
        product_name: product.name,
        product_image: product.image,
        price: product.price,
        quantity: quantity,
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
      description: `${product.name} (${quantity}) ditambahkan ke keranjang`,
    });
  };

  const discount = product?.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Memuat produk...</p>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Product Image */}
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden bg-secondary">
                <img
                  src={product.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.is_new && (
                  <span className="px-3 py-1 text-sm font-semibold rounded-md gradient-primary text-primary-foreground">
                    NEW
                  </span>
                )}
                {discount > 0 && (
                  <span className="px-3 py-1 text-sm font-semibold rounded-md bg-destructive text-destructive-foreground">
                    -{discount}%
                  </span>
                )}
              </div>

              <button className="absolute top-4 right-4 w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                <Heart className="h-5 w-5" />
              </button>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <span className="text-sm text-primary font-medium uppercase tracking-wider">
                  {product.category}
                </span>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mt-2">
                  {product.name}
                </h1>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating || 0)
                          ? "text-primary fill-primary"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-muted-foreground">
                  ({product.reviews_count || 0} ulasan)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-foreground">
                  {formatRupiah(product.price)}
                </span>
                {product.original_price && (
                  <span className="text-xl text-muted-foreground line-through">
                    {formatRupiah(product.original_price)}
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="prose prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  {product.description || "Tidak ada deskripsi untuk produk ini."}
                </p>
              </div>

              {/* Stock */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Stok:</span>
                <span className={`text-sm font-medium ${product.stock > 0 ? "text-green-400" : "text-red-400"}`}>
                  {product.stock > 0 ? `${product.stock} tersedia` : "Habis"}
                </span>
              </div>

              {/* Quantity Selector */}
              {!isAdmin && product.stock > 0 && (
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-foreground">Jumlah:</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-medium text-foreground">
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Add to Cart Button */}
              {!isAdmin && (
                <Button
                  className="w-full py-6 text-lg"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {product.stock > 0 ? "Tambah ke Keranjang" : "Stok Habis"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
