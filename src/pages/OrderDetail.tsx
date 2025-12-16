import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Package, MapPin, CreditCard, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string | null;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  shipping_cost: number;
  payment_method: string;
}

const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/login");
      return;
    }

    const fetchOrder = async () => {
      if (!id) return;

      // Fetch order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (orderError || !orderData) {
        toast({
          title: "Error",
          description: "Pesanan tidak ditemukan",
          variant: "destructive",
        });
        navigate("/profile");
        return;
      }

      setOrder(orderData);

      // Fetch order items
      const { data: itemsData } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", id);

      if (itemsData) {
        setOrderItems(itemsData);
      }

      setIsLoading(false);
    };

    fetchOrder();
  }, [id, user, authLoading, navigate, toast]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "processing": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "cancelled": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed": return "Selesai";
      case "processing": return "Diproses";
      case "cancelled": return "Dibatalkan";
      default: return "Menunggu";
    }
  };

  const getPaymentMethod = (method: string) => {
    switch (method) {
      case "transfer": return "Transfer Bank";
      case "ewallet": return "E-Wallet";
      default: return method;
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Memuat detail pesanan...</p>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const subtotal = order.total_amount - order.shipping_cost;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back Button */}
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate("/profile")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Profil
          </Button>

          {/* Order Header */}
          <div className="glass rounded-xl p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Detail Pesanan
                </h1>
                <p className="text-muted-foreground mt-1">
                  #{order.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
              <span className={`px-4 py-2 rounded-full border text-sm font-medium ${getStatusColor(order.status)}`}>
                {getStatusText(order.status)}
              </span>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tanggal Pesan</p>
                  <p className="text-sm font-medium text-foreground">
                    {new Date(order.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Metode Pembayaran</p>
                  <p className="text-sm font-medium text-foreground">
                    {getPaymentMethod(order.payment_method)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Item</p>
                  <p className="text-sm font-medium text-foreground">
                    {orderItems.reduce((sum, item) => sum + item.quantity, 0)} item
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="glass rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Daftar Produk
            </h2>
            <div className="space-y-4">
              {orderItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 border border-border"
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                    <img
                      src={item.product_image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200"}
                      alt={item.product_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">
                      {item.product_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {formatRupiah(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      {formatRupiah(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="glass rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Ringkasan Pembayaran
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Ongkos Kirim</span>
                <span>{order.shipping_cost > 0 ? formatRupiah(order.shipping_cost) : "Gratis"}</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between text-lg font-semibold text-foreground">
                <span>Total</span>
                <span>{formatRupiah(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Continue Shopping */}
          <div className="mt-8 text-center">
            <Link to="/products">
              <Button variant="outline" size="lg">
                Lanjut Belanja
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderDetail;
