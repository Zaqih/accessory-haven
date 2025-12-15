import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, User, Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      setCartCount(0);
      return;
    }

    const fetchCartCount = async () => {
      const { data, error } = await supabase
        .from("cart_items")
        .select("quantity")
        .eq("user_id", user.id);

      if (!error && data) {
        const total = data.reduce((sum, item) => sum + (item.quantity || 0), 0);
        setCartCount(total);
      }
    };

    fetchCartCount();

    // Subscribe to cart changes
    const channel = supabase
      .channel("cart-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cart_items",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchCartCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">T</span>
            </div>
            <span className="text-xl font-bold text-foreground">TechGear</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-foreground/80 hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/products" className="text-foreground/80 hover:text-primary transition-colors">
              Products
            </Link>
            <Link to="/categories" className="text-foreground/80 hover:text-primary transition-colors">
              Categories
            </Link>
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full gradient-primary text-xs flex items-center justify-center text-primary-foreground">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Button>
            </Link>
            {user ? (
              <>
                <Link to="/profile">
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm">Login</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full gradient-primary text-xs flex items-center justify-center text-primary-foreground">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Button>
            </Link>
            <button
              className="text-foreground"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-4">
              <Link to="/" className="text-foreground/80 hover:text-primary transition-colors">
                Home
              </Link>
              <Link to="/products" className="text-foreground/80 hover:text-primary transition-colors">
                Products
              </Link>
              <Link to="/categories" className="text-foreground/80 hover:text-primary transition-colors">
                Categories
              </Link>
              <div className="flex gap-2 pt-4 border-t border-border">
                {user ? (
                  <>
                    <Link to="/profile" className="flex-1">
                      <Button variant="outline" className="w-full">Profile</Button>
                    </Link>
                    <Button variant="outline" className="flex-1" onClick={handleLogout}>
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="flex-1">
                      <Button variant="outline" className="w-full">Login</Button>
                    </Link>
                    <Link to="/register" className="flex-1">
                      <Button className="w-full">Sign Up</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;