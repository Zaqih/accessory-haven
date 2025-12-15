import { useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  DollarSign,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const stats = [
  {
    label: "Total Revenue",
    value: "$45,231",
    change: "+12.5%",
    icon: DollarSign,
  },
  {
    label: "Total Orders",
    value: "1,234",
    change: "+8.2%",
    icon: ShoppingCart,
  },
  {
    label: "Total Products",
    value: "156",
    change: "+3.1%",
    icon: Package,
  },
  {
    label: "Active Users",
    value: "8,456",
    change: "+15.3%",
    icon: Users,
  },
];

const products = [
  {
    id: 1,
    name: "Premium Leather Case",
    category: "Cases",
    price: 49.99,
    stock: 120,
    status: "Active",
    image: "https://images.unsplash.com/photo-1601593346740-925612772716?w=100",
  },
  {
    id: 2,
    name: "Wireless Earbuds Pro",
    category: "Audio",
    price: 129.99,
    stock: 45,
    status: "Active",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=100",
  },
  {
    id: 3,
    name: "Fast Charging Cable",
    category: "Cables",
    price: 24.99,
    stock: 200,
    status: "Active",
    image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=100",
  },
  {
    id: 4,
    name: "Tempered Glass Shield",
    category: "Protection",
    price: 19.99,
    stock: 0,
    status: "Out of Stock",
    image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=100",
  },
];

const recentOrders = [
  {
    id: "ORD-001",
    customer: "John Doe",
    date: "Dec 15, 2024",
    total: 149.99,
    status: "Completed",
  },
  {
    id: "ORD-002",
    customer: "Jane Smith",
    date: "Dec 14, 2024",
    total: 299.99,
    status: "Processing",
  },
  {
    id: "ORD-003",
    customer: "Mike Johnson",
    date: "Dec 14, 2024",
    total: 79.99,
    status: "Shipped",
  },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const sidebarItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "products", icon: Package, label: "Products" },
    { id: "orders", icon: ShoppingCart, label: "Orders" },
    { id: "customers", icon: Users, label: "Customers" },
    { id: "analytics", icon: BarChart3, label: "Analytics" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  const handleDeleteProduct = (id: number) => {
    toast({
      title: "Product Deleted",
      description: `Product #${id} has been removed.`,
    });
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border fixed h-full">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">T</span>
            </div>
            <span className="text-xl font-bold text-foreground">TechGear</span>
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
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <Link to="/">
            <Button variant="ghost" className="w-full justify-start gap-3">
              <LogOut className="h-5 w-5" />
              Back to Store
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
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h1>
            <p className="text-muted-foreground">
              Welcome back, Admin
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            {activeTab === "products" && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            )}
          </div>
        </div>

        {/* Dashboard Content */}
        {activeTab === "dashboard" && (
          <div className="space-y-8 animate-fade-in">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="glass rounded-xl p-6 border border-border"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center">
                      <stat.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <span className="text-sm font-medium text-green-400 flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Recent Orders */}
            <div className="glass rounded-xl p-6 border border-border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">
                  Recent Orders
                </h3>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </div>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                        {order.customer.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {order.customer}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.id} • {order.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        ${order.total}
                      </p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          order.status === "Completed"
                            ? "bg-green-500/20 text-green-400"
                            : order.status === "Shipped"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Products Content */}
        {activeTab === "products" && (
          <div className="glass rounded-xl border border-border animate-fade-in overflow-hidden">
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-secondary/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <span className="font-medium text-foreground">
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 text-foreground">
                      ${product.price}
                    </td>
                    <td className="px-6 py-4 text-foreground">{product.stock}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          product.status === "Active"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
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
              </tbody>
            </table>
          </div>
        )}

        {/* Orders Content */}
        {activeTab === "orders" && (
          <div className="glass rounded-xl p-6 border border-border animate-fade-in">
            <div className="text-center py-12">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Order Management
              </h3>
              <p className="text-muted-foreground">
                Full order management coming soon...
              </p>
            </div>
          </div>
        )}

        {/* Other tabs placeholder */}
        {["customers", "analytics", "settings"].includes(activeTab) && (
          <div className="glass rounded-xl p-6 border border-border animate-fade-in">
            <div className="text-center py-12">
              <Settings className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h3>
              <p className="text-muted-foreground">
                This section is under development...
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
