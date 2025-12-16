import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Building2, Wallet, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ShieldAlert } from "lucide-react";

interface CartItem {
  id: string;
  product_name: string;
  product_image: string | null;
  price: number;
  quantity: number;
  size: string | null;
  color: string | null;
}

const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const paymentMethods = [
  { 
    id: "transfer", 
    name: "Transfer Bank", 
    icon: Building2, 
    description: "BCA, Mandiri, BNI, BRI",
    info: {
      type: "rekening",
      banks: [
        { name: "BCA", number: "1234567890", holder: "PT DAZMerch Indonesia" },
        { name: "Mandiri", number: "0987654321", holder: "PT DAZMerch Indonesia" },
        { name: "BNI", number: "1122334455", holder: "PT DAZMerch Indonesia" },
        { name: "BRI", number: "5566778899", holder: "PT DAZMerch Indonesia" },
      ]
    }
  },
  { 
    id: "ewallet", 
    name: "E-Wallet", 
    icon: Wallet, 
    description: "GoPay, OVO, DANA, ShopeePay",
    info: {
      type: "phone",
      number: "081234567890",
      name: "DAZMerch Store"
    }
  },
];

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState("transfer");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showPaymentInfo, setShowPaymentInfo] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAdmin) {
      setIsLoading(false);
      return;
    }

    if (!user) {
      setCartItems([]);
      setIsLoading(false);
      return;
    }

    const fetchCartItems = async () => {
      const { data, error } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching cart:", error);
      } else {
        setCartItems(data as CartItem[] || []);
      }
      setIsLoading(false);
    };

    fetchCartItems();
  }, [user]);

  const updateQuantity = async (id: string, delta: number) => {
    const item = cartItems.find((i) => i.id === id);
    if (!item) return;

    const newQuantity = Math.max(0, item.quantity + delta);

    if (newQuantity === 0) {
      await removeItem(id);
      return;
    }

    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: newQuantity })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: "Gagal mengubah jumlah", variant: "destructive" });
      return;
    }

    setCartItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = async (id: string) => {
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: "Gagal menghapus item", variant: "destructive" });
      return;
    }

    setCartItems((items) => items.filter((item) => item.id !== id));
  };

  const handleCheckout = async () => {
    if (!user) {
      toast({ title: "Login diperlukan", description: "Silakan login untuk melanjutkan checkout", variant: "destructive" });
      navigate("/login");
      return;
    }

    setShowPaymentInfo(true);
  };

  const handleConfirmPayment = async () => {
    if (!user) return;

    setIsCheckingOut(true);
    
    try {
      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total_amount: total,
          shipping_cost: shipping,
          payment_method: selectedPayment,
          status: "completed",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: orderData.id,
        product_name: item.product_name,
        product_image: item.product_image,
        price: item.price,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Reduce stock for each product
      for (const item of cartItems) {
        // Find product by name and reduce stock
        const { data: productData } = await supabase
          .from("products")
          .select("id, stock")
          .eq("name", item.product_name)
          .maybeSingle();

        if (productData) {
          const newStock = Math.max(0, productData.stock - item.quantity);
          await supabase
            .from("products")
            .update({ stock: newStock })
            .eq("id", productData.id);
        }
      }

      // Clear cart after successful order
      await supabase.from("cart_items").delete().eq("user_id", user.id);
      
      setCartItems([]);
      setShowPaymentInfo(false);
      
      toast({
        title: "Pesanan Berhasil!",
        description: `Pembayaran via ${paymentMethods.find(p => p.id === selectedPayment)?.name}. Terima kasih telah berbelanja!`,
      });
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Error",
        description: "Gagal memproses pesanan. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
    toast({ title: "Disalin!", description: "Nomor berhasil disalin ke clipboard" });
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = subtotal > 500000 ? 0 : 25000;
  const total = subtotal + shipping;

  const selectedPaymentMethod = paymentMethods.find(p => p.id === selectedPayment);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Memuat keranjang...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
            Keranjang Belanja
          </h1>

          {isAdmin ? (
            <div className="text-center py-16">
              <ShieldAlert className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Akses Ditolak
              </h2>
              <p className="text-muted-foreground mb-8">
                Admin tidak dapat mengakses keranjang belanja. Fitur ini hanya untuk pelanggan.
              </p>
              <Link to="/admin">
                <Button variant="hero" size="lg">
                  Kembali ke Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          ) : !user ? (
            <div className="text-center py-16">
              <ShoppingBag className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Silakan Login
              </h2>
              <p className="text-muted-foreground mb-8">
                Anda perlu login untuk melihat keranjang belanja.
              </p>
              <Link to="/login">
                <Button variant="hero" size="lg">
                  Login
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          ) : cartItems.length > 0 ? (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="glass rounded-xl p-4 flex gap-4 animate-fade-in"
                  >
                    <img
                      src={item.product_image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200"}
                      alt={item.product_name}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">
                        {item.product_name}
                      </h3>
                      {(item.size || item.color) && (
                        <p className="text-sm text-muted-foreground mb-1">
                          {item.size && `Ukuran: ${item.size}`}
                          {item.size && item.color && " • "}
                          {item.color && `Warna: ${item.color}`}
                        </p>
                      )}
                      <p className="text-primary font-bold">
                        {formatRupiah(item.price)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="glass rounded-xl p-6 sticky top-24">
                  <h3 className="text-lg font-semibold text-foreground mb-6">
                    Ringkasan Pesanan
                  </h3>
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>{formatRupiah(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Ongkos Kirim</span>
                      <span>
                        {shipping === 0 ? (
                          <span className="text-green-400">GRATIS</span>
                        ) : (
                          formatRupiah(shipping)
                        )}
                      </span>
                    </div>
                    <div className="border-t border-border pt-4 flex justify-between text-lg font-semibold text-foreground">
                      <span>Total</span>
                      <span>{formatRupiah(total)}</span>
                    </div>
                  </div>

                  {subtotal < 500000 && (
                    <p className="text-sm text-muted-foreground mb-4">
                      Tambah {formatRupiah(500000 - subtotal)} lagi untuk gratis ongkir!
                    </p>
                  )}

                  {/* Payment Methods */}
                  {!showPaymentInfo ? (
                    <>
                      <div className="mb-6">
                        <h4 className="font-medium text-foreground mb-3">Metode Pembayaran</h4>
                        <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment} className="space-y-3">
                          {paymentMethods.map((method) => (
                            <div
                              key={method.id}
                              className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                                selectedPayment === method.id
                                  ? "border-primary bg-primary/10"
                                  : "border-border hover:border-primary/50"
                              }`}
                              onClick={() => setSelectedPayment(method.id)}
                            >
                              <RadioGroupItem value={method.id} id={method.id} />
                              <method.icon className="h-5 w-5 text-primary" />
                              <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                                <p className="font-medium text-foreground">{method.name}</p>
                                <p className="text-xs text-muted-foreground">{method.description}</p>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>

                      <Button 
                        variant="hero" 
                        size="lg" 
                        className="w-full mb-4"
                        onClick={handleCheckout}
                      >
                        Checkout
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <h4 className="font-medium text-foreground">Informasi Pembayaran</h4>
                      
                      {selectedPaymentMethod?.id === "transfer" && (
                        <div className="space-y-3">
                          <p className="text-sm text-muted-foreground">Transfer ke salah satu rekening berikut:</p>
                          {selectedPaymentMethod.info.banks.map((bank) => (
                            <div key={bank.name} className="p-3 rounded-lg bg-secondary/50 border border-border">
                              <p className="font-semibold text-foreground">{bank.name}</p>
                              <div className="flex items-center justify-between mt-1">
                                <div>
                                  <p className="text-lg font-mono text-primary">{bank.number}</p>
                                  <p className="text-xs text-muted-foreground">a.n. {bank.holder}</p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(bank.number)}
                                >
                                  {copiedText === bank.number ? (
                                    <Check className="h-4 w-4 text-green-400" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {selectedPaymentMethod?.id === "ewallet" && (
                        <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                          <p className="text-sm text-muted-foreground mb-2">Transfer ke nomor E-Wallet berikut:</p>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-lg font-mono text-primary">{selectedPaymentMethod.info.number}</p>
                              <p className="text-xs text-muted-foreground">a.n. {selectedPaymentMethod.info.name}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(selectedPaymentMethod.info.number)}
                            >
                              {copiedText === selectedPaymentMethod.info.number ? (
                                <Check className="h-4 w-4 text-green-400" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                        <p className="text-sm text-foreground">
                          <strong>Total Pembayaran:</strong> {formatRupiah(total)}
                        </p>
                      </div>

                      <Button 
                        variant="hero" 
                        size="lg" 
                        className="w-full"
                        onClick={handleConfirmPayment}
                        disabled={isCheckingOut}
                      >
                        {isCheckingOut ? "Memproses..." : "Konfirmasi Pembayaran"}
                      </Button>

                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setShowPaymentInfo(false)}
                      >
                        Kembali
                      </Button>
                    </div>
                  )}

                  {!showPaymentInfo && (
                    <Link to="/products">
                      <Button variant="outline" className="w-full">
                        Lanjut Belanja
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <ShoppingBag className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Keranjang kosong
              </h2>
              <p className="text-muted-foreground mb-8">
                Anda belum menambahkan produk ke keranjang.
              </p>
              <Link to="/products">
                <Button variant="hero" size="lg">
                  Mulai Belanja
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;