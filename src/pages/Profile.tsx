import { useState } from "react";
import { Link } from "react-router-dom";
import {
  User,
  Mail,
  MapPin,
  Phone,
  Package,
  Heart,
  Settings,
  LogOut,
  Edit,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useToast } from "@/hooks/use-toast";

const orders = [
  {
    id: "ORD-001",
    date: "Dec 12, 2024",
    status: "Delivered",
    total: 149.99,
    items: 3,
  },
  {
    id: "ORD-002",
    date: "Dec 8, 2024",
    status: "Shipped",
    total: 79.99,
    items: 2,
  },
  {
    id: "ORD-003",
    date: "Dec 1, 2024",
    status: "Processing",
    total: 249.99,
    items: 4,
  },
];

const Profile = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 234 567 890",
    address: "123 Tech Street, Silicon Valley, CA 94000",
  });

  const handleSave = () => {
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });
  };

  const tabs = [
    { id: "profile", icon: User, label: "Profile" },
    { id: "orders", icon: Package, label: "Orders" },
    { id: "wishlist", icon: Heart, label: "Wishlist" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="glass rounded-xl p-6 sticky top-24">
                {/* Avatar */}
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center text-3xl font-bold text-primary-foreground">
                      JD
                    </div>
                    <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-foreground">
                    {profile.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">{profile.email}</p>
                </div>

                {/* Navigation */}
                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? "gradient-primary text-primary-foreground"
                          : "text-foreground hover:bg-secondary"
                      }`}
                    >
                      <tab.icon className="h-5 w-5" />
                      {tab.label}
                    </button>
                  ))}
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-colors">
                    <LogOut className="h-5 w-5" />
                    Logout
                  </button>
                </nav>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              {activeTab === "profile" && (
                <div className="glass rounded-xl p-6 animate-fade-in">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-foreground">
                      Personal Information
                    </h3>
                    <Button
                      variant={isEditing ? "default" : "outline"}
                      onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                    >
                      {isEditing ? "Save Changes" : <><Edit className="h-4 w-4 mr-2" />Edit</>}
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        Full Name
                      </label>
                      <Input
                        value={profile.name}
                        onChange={(e) =>
                          setProfile({ ...profile, name: e.target.value })
                        }
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        Email Address
                      </label>
                      <Input
                        type="email"
                        value={profile.email}
                        onChange={(e) =>
                          setProfile({ ...profile, email: e.target.value })
                        }
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        Phone Number
                      </label>
                      <Input
                        value={profile.phone}
                        onChange={(e) =>
                          setProfile({ ...profile, phone: e.target.value })
                        }
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        Address
                      </label>
                      <Input
                        value={profile.address}
                        onChange={(e) =>
                          setProfile({ ...profile, address: e.target.value })
                        }
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "orders" && (
                <div className="glass rounded-xl p-6 animate-fade-in">
                  <h3 className="text-xl font-semibold text-foreground mb-6">
                    Order History
                  </h3>

                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border"
                      >
                        <div>
                          <p className="font-semibold text-foreground">
                            {order.id}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {order.date} • {order.items} items
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">
                            ${order.total}
                          </p>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              order.status === "Delivered"
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
              )}

              {activeTab === "wishlist" && (
                <div className="glass rounded-xl p-6 animate-fade-in">
                  <h3 className="text-xl font-semibold text-foreground mb-6">
                    My Wishlist
                  </h3>
                  <div className="text-center py-12">
                    <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Your wishlist is empty
                    </p>
                    <Link to="/products">
                      <Button>Browse Products</Button>
                    </Link>
                  </div>
                </div>
              )}

              {activeTab === "settings" && (
                <div className="glass rounded-xl p-6 animate-fade-in">
                  <h3 className="text-xl font-semibold text-foreground mb-6">
                    Account Settings
                  </h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border">
                      <div>
                        <p className="font-medium text-foreground">
                          Email Notifications
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Receive order updates via email
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border">
                      <div>
                        <p className="font-medium text-foreground">
                          Change Password
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Update your account password
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Update
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                      <div>
                        <p className="font-medium text-destructive">
                          Delete Account
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Permanently delete your account
                        </p>
                      </div>
                      <Button variant="destructive" size="sm">
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
