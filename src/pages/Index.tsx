import React from "react";
import { ArrowRight, Smartphone, Headphones, Cable, Shield, Package, Users, LayoutDashboard, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/products/ProductCard";
import heroBanner from "@/assets/hero-banner.jpg";
import { useAuth } from "@/hooks/useAuth";

const categories = [
  { icon: Smartphone, name: "Cases", count: 120 },
  { icon: Headphones, name: "Audio", count: 85 },
  { icon: Cable, name: "Cables", count: 64 },
  { icon: Shield, name: "Protection", count: 45 },
];

const featuredProducts = [
  {
    id: "1",
    name: "Premium Leather Case",
    price: 49.99,
    originalPrice: 79.99,
    image: "https://images.unsplash.com/photo-1601593346740-925612772716?w=500",
    rating: 4.8,
    reviews: 234,
    isNew: true,
  },
  {
    id: "2",
    name: "Wireless Earbuds Pro",
    price: 129.99,
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500",
    rating: 4.9,
    reviews: 567,
  },
  {
    id: "3",
    name: "Fast Charging Cable 2M",
    price: 24.99,
    originalPrice: 34.99,
    image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500",
    rating: 4.6,
    reviews: 189,
  },
  {
    id: "4",
    name: "Tempered Glass Shield",
    price: 19.99,
    image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=500",
    rating: 4.7,
    reviews: 412,
    isNew: true,
  },
];

const adminQuickLinks = [
  { icon: Package, name: "Kelola Produk", description: "Tambah, edit, atau hapus produk", link: "/admin" },
  { icon: Users, name: "Data Pengguna", description: "Lihat semua pengguna terdaftar", link: "/admin" },
  { icon: TrendingUp, name: "Statistik", description: "Lihat statistik toko", link: "/admin" },
];

// Admin Home Page Component
const AdminHomePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Admin Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center pt-16 overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-20" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium text-primary mb-6">
              <LayoutDashboard className="h-4 w-4" />
              Admin Panel
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Selamat Datang, <span className="text-gradient">Admin</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-xl mx-auto">
              Kelola katalog produk dan data pengguna dari dashboard admin.
            </p>
            <Link to="/admin">
              <Button variant="hero" size="lg">
                Buka Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Menu Cepat
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Akses cepat ke fitur-fitur admin
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {adminQuickLinks.map((item) => (
              <Link
                key={item.name}
                to={item.link}
                className="group p-6 rounded-xl glass border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_40px_hsl(174_72%_50%/0.1)]"
              >
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <item.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">
                  {item.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="glass rounded-2xl p-8 md:p-12 text-center max-w-3xl mx-auto border border-border">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Mode Admin Aktif
            </h2>
            <p className="text-muted-foreground mb-6">
              Sebagai admin, Anda hanya dapat mengelola katalog produk dan data pengguna. 
              Fitur pembelian tidak tersedia untuk akun admin.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/admin">
                <Button variant="hero">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard Admin
                </Button>
              </Link>
              <Link to="/products">
                <Button variant="outline">
                  Lihat Katalog
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

// User Home Page Component
const UserHomePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroBanner}
            alt="Hero"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl animate-slide-up">
            <span className="inline-block px-4 py-2 rounded-full glass text-sm font-medium text-primary mb-6">
              New Collection 2025
            </span>
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
              Premium Gear for Your{" "}
              <span className="text-gradient">Smartphone</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-xl">
              Discover cutting-edge accessories designed to protect, charge, and
              enhance your mobile experience.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products">
                <Button variant="hero" size="lg">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/categories">
                <Button variant="glass" size="lg">
                  Browse Categories
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-foreground/30 flex items-start justify-center p-2">
            <div className="w-1 h-2 rounded-full bg-primary animate-pulse" />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Shop by Category
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Find the perfect accessories for every need
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={`/products?category=${category.name.toLowerCase()}`}
                className="group p-6 rounded-xl glass border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_40px_hsl(174_72%_50%/0.1)]"
              >
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <category.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">
                  {category.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {category.count} products
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Featured Products
              </h2>
              <p className="text-muted-foreground">
                Handpicked favorites from our collection
              </p>
            </div>
            <Link to="/products">
              <Button variant="outline">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-10" />
        <div className="container mx-auto px-4 relative">
          <div className="glass rounded-2xl p-8 md:p-12 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Join Our Community
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Sign up today and get 15% off your first order plus exclusive
              access to new releases.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/register">
                <Button variant="hero" size="lg">
                  Create Account
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="glass" size="lg">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const Index = () => {
  const { isAdmin } = useAuth();

  if (isAdmin) {
    return <AdminHomePage />;
  }

  return <UserHomePage />;
};

export default Index;