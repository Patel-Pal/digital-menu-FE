import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Store, Phone, Mail, MapPin, Save, Upload, X, User, Edit, Eye, EyeOff, Palette, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMenuTheme, menuThemes, MenuTheme } from "@/contexts/ThemeContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { shopService, type ShopProfileData } from "@/services/shopService";
import { uploadService } from "@/services/uploadService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function ShopSettingsPage() {
  const { menuTheme, setMenuTheme } = useMenuTheme();
  const { user, updateProfile } = useAuth();
  
  const [profileData, setProfileData] = useState<ShopProfileData>({
    description: "",
    address: "",
    phone: "",
    logo: "",
    banner: ""
  });

  // Edit profile states
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showEditShop, setShowEditShop] = useState(false);
  const [editProfileData, setEditProfileData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  useEffect(() => {
    fetchShopProfile();
  }, []);

  const fetchShopProfile = async () => {
    try {
      setLoading(true);
      const response = await shopService.getShopProfile();
      if (response.data) {
        setProfileData({
          description: response.data.description || "",
          address: response.data.address || "",
          phone: response.data.phone || "",
          logo: response.data.logo || "",
          banner: response.data.banner || ""
        });
        setLogoPreview(response.data.logo || "");
        setBannerPreview(response.data.banner || "");
      }
    } catch (error: any) {
      // If shop doesn't exist (404), that's okay - user can create one
      if (error.response?.status !== 404) {
        console.error("Failed to fetch shop profile:", error);
        toast.error("Failed to fetch shop profile");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onload = () => setBannerPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File, setUploading: (loading: boolean) => void) => {
    setUploading(true);
    try {
      const response = await uploadService.uploadImage(file);
      return response.data.url;
    } catch (error) {
      toast.error("Failed to upload image");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let logoUrl = profileData.logo;
      let bannerUrl = profileData.banner;

      // Upload logo if selected
      if (logoFile) {
        logoUrl = await uploadImage(logoFile, setUploadingLogo);
        if (!logoUrl) {
          setSaving(false);
          return;
        }
      }

      // Upload banner if selected
      if (bannerFile) {
        bannerUrl = await uploadImage(bannerFile, setUploadingBanner);
        if (!bannerUrl) {
          setSaving(false);
          return;
        }
      }

      const data: ShopProfileData = {
        description: profileData.description,
        address: profileData.address,
        phone: profileData.phone,
        logo: logoUrl,
        banner: bannerUrl
      };

      await shopService.createOrUpdateShopProfile(data);
      toast.success("Shop profile saved successfully!");
      
      // Reset file states
      setLogoFile(null);
      setBannerFile(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleThemeChange = (theme: MenuTheme) => {
    setMenuTheme(theme);
    toast.success(`Theme changed to ${menuThemes[theme].name}`);
  };

  const openEditProfile = () => {
    setEditProfileData({
      name: user?.name || "",
      email: user?.email || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
    setShowEditProfile(true);
  };

  const openEditShop = () => {
    setShowEditShop(true);
  };

  const handleUpdateProfile = async () => {
    if (editProfileData.newPassword && editProfileData.newPassword !== editProfileData.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    if (editProfileData.newPassword && !editProfileData.currentPassword) {
      toast.error("Current password is required to change password");
      return;
    }

    setUpdatingProfile(true);
    try {
      await updateProfile(
        editProfileData.name,
        editProfileData.email,
        editProfileData.currentPassword || undefined,
        editProfileData.newPassword || undefined
      );
      
      toast.success("Profile updated successfully!");
      setShowEditProfile(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdatingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <h1 className="text-3xl font-bold">Shop Settings</h1>
        <p className="text-muted-foreground">Manage your shop profile and preferences</p>
      </motion.div>

      {/* Shop Profile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Shop Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* User Information (Read-only) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-lg">Owner Information</h4>
                <Button variant="outline" size="sm" onClick={openEditProfile}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Shop Owner</Label>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-semibold text-lg">{user?.name}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Contact Email</Label>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-semibold text-lg">{user?.email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shop Information */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-lg">Shop Information</h4>
                <Button variant="outline" size="sm" onClick={openEditShop}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Shop Info
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-muted/30 rounded-lg border">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{profileData.phone || "Not set"}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{profileData.address || "Not set"}</span>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                  <p className="font-medium text-sm leading-relaxed">
                    {profileData.description || "No description provided"}
                  </p>
                </div>

                {(logoPreview || bannerPreview) && (
                  <div className="md:col-span-2 space-y-3">
                    <Label className="text-sm font-medium text-muted-foreground">Shop Images</Label>
                    <div className="flex gap-6">
                      {logoPreview && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">Logo</p>
                          <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-border shadow-sm">
                            <img src={logoPreview} alt="Shop Logo" className="w-full h-full object-cover" />
                          </div>
                        </div>
                      )}
                      {bannerPreview && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">Banner</p>
                          <div className="w-32 h-16 rounded-lg overflow-hidden border-2 border-border shadow-sm">
                            <img src={bannerPreview} alt="Shop Banner" className="w-full h-full object-cover" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Menu Theme */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Menu Theme
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(menuThemes).map(([key, theme]) => (
                <button
                  key={key}
                  onClick={() => handleThemeChange(key as MenuTheme)}
                  className={`group p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                    menuTheme === key
                      ? "border-primary bg-primary/10 shadow-lg"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-center gap-1">
                      <div
                        className="w-6 h-6 rounded-full shadow-sm"
                        style={{ backgroundColor: `hsl(${theme.primary})` }}
                      />
                      <div
                        className="w-6 h-6 rounded-full shadow-sm"
                        style={{ backgroundColor: `hsl(${theme.accent})` }}
                      />
                    </div>
                    <p className="text-sm font-semibold">{theme.name}</p>
                    {menuTheme === key && (
                      <div className="flex justify-center">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* App Theme */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5" />
              App Theme
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="space-y-1">
                <p className="font-medium">Dark/Light Mode</p>
                <p className="text-sm text-muted-foreground">Toggle between dark and light theme</p>
              </div>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Edit Profile Dialog */}
      <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your personal information and password
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editProfileData.name}
                onChange={(e) => setEditProfileData({ ...editProfileData, name: e.target.value })}
                placeholder="Your name"
              />
            </div>

            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editProfileData.email}
                onChange={(e) => setEditProfileData({ ...editProfileData, email: e.target.value })}
                placeholder="your@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Change Password (Optional)</Label>
              
              <div className="relative">
                <Input
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Current password"
                  value={editProfileData.currentPassword}
                  onChange={(e) => setEditProfileData({ ...editProfileData, currentPassword: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="New password"
                  value={editProfileData.newPassword}
                  onChange={(e) => setEditProfileData({ ...editProfileData, newPassword: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <Input
                type="password"
                placeholder="Confirm new password"
                value={editProfileData.confirmPassword}
                onChange={(e) => setEditProfileData({ ...editProfileData, confirmPassword: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditProfile(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateProfile}
              disabled={updatingProfile || !editProfileData.name || !editProfileData.email}
            >
              {updatingProfile ? "Updating..." : "Update Profile"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Shop Profile Dialog */}
      <Dialog open={showEditShop} onOpenChange={setShowEditShop}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Shop Information</DialogTitle>
            <DialogDescription>
              Update your shop details, description, and images
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={profileData.phone || ""}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  placeholder="+1 234 567 8900"
                />
              </div>

              <div>
                <Label htmlFor="edit-address">Address</Label>
                <Input
                  id="edit-address"
                  value={profileData.address || ""}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  placeholder="123 Main Street"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={profileData.description || ""}
                onChange={(e) => setProfileData({ ...profileData, description: e.target.value })}
                placeholder="Brief description of your shop"
                rows={3}
              />
            </div>

            {/* Logo Upload */}
            <div>
              <Label>Shop Logo</Label>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                    id="edit-logo-upload"
                  />
                  <label htmlFor="edit-logo-upload">
                    <Button type="button" variant="outline" className="cursor-pointer" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        {logoFile ? logoFile.name : "Choose Logo"}
                      </span>
                    </Button>
                  </label>
                  {uploadingLogo && <span className="text-sm text-muted-foreground">Uploading...</span>}
                </div>
                
                {logoPreview && (
                  <div className="flex justify-start">
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-dashed border-muted-foreground/25">
                      <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setLogoFile(null);
                          setLogoPreview("");
                          setProfileData({ ...profileData, logo: "" });
                        }}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-destructive/80"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Banner Upload */}
            <div>
              <Label>Shop Banner</Label>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerChange}
                    className="hidden"
                    id="edit-banner-upload"
                  />
                  <label htmlFor="edit-banner-upload">
                    <Button type="button" variant="outline" className="cursor-pointer" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        {bannerFile ? bannerFile.name : "Choose Banner"}
                      </span>
                    </Button>
                  </label>
                  {uploadingBanner && <span className="text-sm text-muted-foreground">Uploading...</span>}
                </div>
                
                {bannerPreview && (
                  <div className="flex justify-start">
                    <div className="relative w-48 h-24 rounded-lg overflow-hidden border-2 border-dashed border-muted-foreground/25">
                      <img src={bannerPreview} alt="Banner Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setBannerFile(null);
                          setBannerPreview("");
                          setProfileData({ ...profileData, banner: "" });
                        }}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-destructive/80"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditShop(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                handleSave();
                setShowEditShop(false);
              }}
              disabled={saving || uploadingLogo || uploadingBanner}
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
