import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Plus,
  Search,
  Edit,
  Trash2,
  TrendingUp,
  DollarSign,
  Save,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  image: string | null;
  category: string;
  stock: number;
  is_active: boolean;
  is_new: boolean;
}

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
}

interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  shipping_cost: number;
  payment_method: string;
  status: string;
  created_at: string;
  profiles?: { full_name: string | null } | null;
}

const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    original_price: "",
    image: "",
    category: "",
    stock: "",
    is_active: true,
    is_new: false,
  });
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Calculate stats from real data
  const totalRevenue = orders
    .filter(o => o.status === "completed")
    .reduce((sum, o) => sum + Number(o.total_amount), 0);
  
  const totalOrders = orders.length;

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const checkAdminAndFetchData = async () => {
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleData) {
        toast({
          title: "Akses Ditolak",
          description: "Anda tidak memiliki akses admin",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);

      // Fetch products
      const { data: productsData } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (productsData) {
        setProducts(productsData as Product[]);
      }

      // Fetch users
      const { data: usersData } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (usersData) {
        setUsers(usersData as UserProfile[]);
      }

      // Fetch orders
      const { data: ordersData } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (ordersData) {
        // Get user profiles for orders
        const ordersWithProfiles = await Promise.all(
          ordersData.map(async (order) => {
            const { data: profileData } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("user_id", order.user_id)
              .maybeSingle();
            return { ...order, profiles: profileData } as Order;
          })
        );
        setOrders(ordersWithProfiles);
      }

      setIsLoading(false);
    };

    checkAdminAndFetchData();

    // Realtime subscription for products
    const productsChannel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            setProducts(prev => [payload.new as Product, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setProducts(prev => prev.map(p => p.id === payload.new.id ? payload.new as Product : p));
          } else if (payload.eventType === 'DELETE') {
            setProducts(prev => prev.filter(p => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(productsChannel);
    };
  }, [user, navigate, toast]);

  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.price || !productForm.category) {
      toast({
        title: "Error",
        description: "Nama, harga, dan kategori wajib diisi",
        variant: "destructive",
      });
      return;
    }

    const productData = {
      name: productForm.name,
      description: productForm.description || null,
      price: parseFloat(productForm.price),
      original_price: productForm.original_price ? parseFloat(productForm.original_price) : null,
      image: productForm.image || null,
      category: productForm.category,
      stock: parseInt(productForm.stock) || 0,
      is_active: productForm.is_active,
      is_new: productForm.is_new,
    };

    if (editingProduct) {
      const { error } = await supabase
        .from("products")
        .update(productData)
        .eq("id", editingProduct.id);

      if (error) {
        toast({ title: "Error", description: "Gagal mengupdate produk", variant: "destructive" });
        return;
      }

      // Realtime will handle state update
      toast({ title: "Berhasil", description: "Produk berhasil diupdate" });
    } else {
      const { error } = await supabase
        .from("products")
        .insert(productData);

      if (error) {
        toast({ title: "Error", description: "Gagal menambahkan produk", variant: "destructive" });
        return;
      }

      // Realtime will handle state update
      toast({ title: "Berhasil", description: "Produk berhasil ditambahkan" });
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleDeleteProduct = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      toast({ title: "Error", description: "Gagal menghapus produk", variant: "destructive" });
      return;
    }

    // Realtime will handle state update
    toast({ title: "Berhasil", description: "Produk berhasil dihapus" });
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      original_price: product.original_price?.toString() || "",
      image: product.image || "",
      category: product.category,
      stock: product.stock.toString(),
      is_active: product.is_active,
      is_new: product.is_new,
    });
    setIsDialogOpen(true);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      toast({ title: "Error", description: "Gagal mengupdate status", variant: "destructive" });
      return;
    }

    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    toast({ title: "Berhasil", description: "Status pesanan diupdate" });
  };

  const resetForm = () => {
    setEditingProduct(null);
    setProductForm({
      name: "",
      description: "",
      price: "",
      original_price: "",
      image: "",
      category: "",
      stock: "",
      is_active: true,
      is_new: false,
    });
  };

  const sidebarItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "orders", icon: ShoppingCart, label: "Pesanan" },
    { id: "products", icon: Package, label: "Produk" },
    { id: "customers", icon: Users, label: "Pengguna" },
    { id: "settings", icon: Settings, label: "Pengaturan" },
  ];

  const stats = [
    { label: "Total Pendapatan", value: formatRupiah(totalRevenue), icon: DollarSign },
    { label: "Total Pesanan", value: totalOrders.toString(), icon: ShoppingCart },
    { label: "Total Produk", value: products.length.toString(), icon: Package },
    { label: "Total Pengguna", value: users.length.toString(), icon: Users },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500/20 text-green-400";
      case "pending": return "bg-yellow-500/20 text-yellow-400";
      case "processing": return "bg-blue-500/20 text-blue-400";
      case "cancelled": return "bg-red-500/20 text-red-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case "transfer": return "Transfer Bank";
      case "ewallet": return "E-Wallet";
      default: return method;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border fixed h-full">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">D</span>
            </div>
            <span className="text-xl font-bold text-foreground">Admin</span>
          </Link>
        </div>

        <nav className="px-4 space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id
                  ? "gradient-primary text-primary-foreground"
                  : "text-foreground hover:bg-secondary"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
              {item.id === "orders" && orders.filter(o => o.status === "pending").length > 0 && (
                <span className="ml-auto bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full">
                  {orders.filter(o => o.status === "pending").length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <Link to="/">
            <Button variant="ghost" className="w-full justify-start gap-3">
              <LogOut className="h-5 w-5" />
              Kembali ke Toko
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {sidebarItems.find(item => item.id === activeTab)?.label}
            </h1>
            <p className="text-muted-foreground">Selamat datang, Admin</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            {activeTab === "products" && (
              <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Produk
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{editingProduct ? "Edit Produk" : "Tambah Produk Baru"}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Nama Produk *</Label>
                      <Input
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        placeholder="Nama produk"
                      />
                    </div>
                    <div>
                      <Label>Deskripsi</Label>
                      <Textarea
                        value={productForm.description}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        placeholder="Deskripsi produk"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Harga (Rp) *</Label>
                        <Input
                          type="number"
                          value={productForm.price}
                          onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label>Harga Asli (Rp)</Label>
                        <Input
                          type="number"
                          value={productForm.original_price}
                          onChange={(e) => setProductForm({ ...productForm, original_price: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>URL Gambar</Label>
                      <Input
                        value={productForm.image}
                        onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Kategori *</Label>
                        <Input
                          value={productForm.category}
                          onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                          placeholder="cases, audio, dll"
                        />
                      </div>
                      <div>
                        <Label>Stok</Label>
                        <Input
                          type="number"
                          value={productForm.stock}
                          onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={productForm.is_active}
                          onCheckedChange={(checked) => setProductForm({ ...productForm, is_active: checked })}
                        />
                        <Label>Aktif</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={productForm.is_new}
                          onCheckedChange={(checked) => setProductForm({ ...productForm, is_new: checked })}
                        />
                        <Label>Produk Baru</Label>
                      </div>
                    </div>
                    <Button onClick={handleSaveProduct} className="w-full">
                      <Save className="h-4 w-4 mr-2" />
                      {editingProduct ? "Simpan Perubahan" : "Tambah Produk"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Dashboard Content */}
        {activeTab === "dashboard" && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="glass rounded-xl p-6 border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center">
                      <stat.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Recent Orders on Dashboard */}
            <div className="glass rounded-xl p-6 border border-border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Pesanan Terbaru</h3>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab("orders")}>
                  Lihat Semua
                </Button>
              </div>
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                        {(order.profiles?.full_name || "U").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {order.profiles?.full_name || "Pengguna"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString("id-ID")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{formatRupiah(Number(order.total_amount))}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">Belum ada pesanan</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Orders Content */}
        {activeTab === "orders" && (
          <div className="glass rounded-xl border border-border animate-fade-in overflow-hidden">
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Pelanggan</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Tanggal</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Metode Bayar</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Total</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-secondary/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                          {(order.profiles?.full_name || "U").charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-foreground">
                          {order.profiles?.full_name || "Pengguna"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {getPaymentMethodName(order.payment_method)}
                    </td>
                    <td className="px-6 py-4 text-foreground font-semibold">
                      {formatRupiah(Number(order.total_amount))}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      Belum ada pesanan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Products Content */}
        {activeTab === "products" && (
          <div className="glass rounded-xl border border-border animate-fade-in overflow-hidden">
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Produk</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Kategori</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Harga</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Stok</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map((product) => (
                  <tr key={product.id} className="hover:bg-secondary/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100"}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <span className="font-medium text-foreground">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{product.category}</td>
                    <td className="px-6 py-4 text-foreground">{formatRupiah(product.price)}</td>
                    <td className="px-6 py-4 text-foreground">{product.stock}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        product.is_active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                      }`}>
                        {product.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditProduct(product)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      Belum ada produk. Klik "Tambah Produk" untuk menambahkan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Users Content */}
        {activeTab === "customers" && (
          <div className="glass rounded-xl border border-border animate-fade-in overflow-hidden">
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Pengguna</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Telepon</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Alamat</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Bergabung</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.filter(u => (u.full_name || "").toLowerCase().includes(searchQuery.toLowerCase())).map((userItem) => (
                  <tr key={userItem.id} className="hover:bg-secondary/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                          {(userItem.full_name || "U").charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-foreground">{userItem.full_name || "Tanpa Nama"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{userItem.phone || "-"}</td>
                    <td className="px-6 py-4 text-muted-foreground">{userItem.address || "-"}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(userItem.created_at).toLocaleDateString("id-ID")}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                      Belum ada pengguna terdaftar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Settings placeholder */}
        {activeTab === "settings" && (
          <div className="glass rounded-xl p-6 border border-border animate-fade-in">
            <div className="text-center py-12">
              <Settings className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Pengaturan</h3>
              <p className="text-muted-foreground">Fitur pengaturan dalam pengembangan...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;