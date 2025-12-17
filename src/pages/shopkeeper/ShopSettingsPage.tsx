import { useState } from "react";
import { motion } from "framer-motion";
import { Store, Phone, Mail, MapPin, Save, Check, Palette, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMenuTheme, menuThemes, MenuTheme } from "@/contexts/ThemeContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";

export function ShopSettingsPage() {
  const { menuTheme, setMenuTheme, appMode } = useMenuTheme();
  
  const [profileData, setProfileData] = useState({
    shopName: "The Rustic Kitchen",
    description: "Farm-to-table dining experience with locally sourced ingredients",
    address: "123 Main Street, Downtown",
    phone: "+1 234 567 8900",
    email: "hello@rustickitchen.com",
    website: "www.rustickitchen.com",
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast.success("Profile saved successfully!");
  };

  const handleThemeChange = (theme: MenuTheme) => {
    setMenuTheme(theme);
    toast.success(`Theme changed to ${menuThemes[theme].name}`);
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <h1 className="text-2xl font-bold">Shop Settings</h1>
        <p className="text-muted-foreground">Manage your shop profile and preferences</p>
      </motion.div>

      {/* App Theme (Dark/Light) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card variant="elevated">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  {appMode === "dark" ? (
                    <Moon className="h-5 w-5 text-primary" />
                  ) : (
                    <Sun className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div>
                  <p className="font-semibold">App Theme</p>
                  <p className="text-sm text-muted-foreground">
                    {appMode === "dark" ? "Dark mode" : "Light mode"}
                  </p>
                </div>
              </div>
              <ThemeToggle size="md" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Menu Theme Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card variant="elevated">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Menu Theme</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              Choose a color theme for your customer menu
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {(Object.entries(menuThemes) as [MenuTheme, typeof menuThemes[MenuTheme]][]).map(
                ([key, theme]) => (
                  <button
                    key={key}
                    onClick={() => handleThemeChange(key)}
                    className={`relative flex flex-col items-center gap-2 rounded-xl p-3 transition-all ${
                      menuTheme === key
                        ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                        : "hover:bg-muted"
                    }`}
                  >
                    <div
                      className="h-12 w-12 rounded-full shadow-md"
                      style={{ background: theme.preview }}
                    />
                    <span className="text-xs font-medium">{theme.name}</span>
                    {menuTheme === key && (
                      <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Shop Profile Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card variant="elevated">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Shop Profile</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Logo Upload */}
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-xl bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary border-2 border-dashed border-primary/30">
                RK
              </div>
              <div className="space-y-1">
                <Button variant="outline" size="sm">
                  Change Logo
                </Button>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG. Max 2MB
                </p>
              </div>
            </div>

            {/* Shop Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Shop Name</label>
              <Input
                placeholder="Your shop name"
                icon={<Store className="h-4 w-4" />}
                value={profileData.shopName}
                onChange={(e) =>
                  setProfileData({ ...profileData, shopName: e.target.value })
                }
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                placeholder="Describe your shop..."
                value={profileData.description}
                onChange={(e) =>
                  setProfileData({ ...profileData, description: e.target.value })
                }
                className="flex w-full rounded-xl border-2 border-input bg-background px-4 py-3 text-base ring-offset-background transition-all duration-200 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 min-h-[80px] resize-none"
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Address</label>
              <Input
                placeholder="Shop address"
                icon={<MapPin className="h-4 w-4" />}
                value={profileData.address}
                onChange={(e) =>
                  setProfileData({ ...profileData, address: e.target.value })
                }
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <Input
                type="tel"
                placeholder="Phone number"
                icon={<Phone className="h-4 w-4" />}
                value={profileData.phone}
                onChange={(e) =>
                  setProfileData({ ...profileData, phone: e.target.value })
                }
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="Email address"
                icon={<Mail className="h-4 w-4" />}
                value={profileData.email}
                onChange={(e) =>
                  setProfileData({ ...profileData, email: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="pb-24"
      >
        <Button
          onClick={handleSave}
          variant="gradient"
          size="xl"
          className="w-full"
          disabled={isSaving}
        >
          {isSaving ? (
            "Saving..."
          ) : (
            <>
              <Save className="h-5 w-5 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
}
