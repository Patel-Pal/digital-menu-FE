import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Store,
  MapPin,
  Phone,
  Mail,
  Clock,
  FileText,
  Upload,
  Save,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";

const shopDetailsSchema = z.object({
  name: z.string().min(2, "Shop name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  address: z.string().min(5, "Address is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Valid email is required"),
  website: z.string().url().optional().or(z.literal("")),
});

type ShopDetailsFormData = z.infer<typeof shopDetailsSchema>;

interface OpeningHour {
  id: string;
  day: string;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

const defaultOpeningHours: OpeningHour[] = [
  { id: "1", day: "Monday", openTime: "10:00", closeTime: "22:00", isClosed: false },
  { id: "2", day: "Tuesday", openTime: "10:00", closeTime: "22:00", isClosed: false },
  { id: "3", day: "Wednesday", openTime: "10:00", closeTime: "22:00", isClosed: false },
  { id: "4", day: "Thursday", openTime: "10:00", closeTime: "22:00", isClosed: false },
  { id: "5", day: "Friday", openTime: "10:00", closeTime: "23:00", isClosed: false },
  { id: "6", day: "Saturday", openTime: "11:00", closeTime: "23:00", isClosed: false },
  { id: "7", day: "Sunday", openTime: "11:00", closeTime: "21:00", isClosed: false },
];

export function ShopDetailsFormPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [openingHours, setOpeningHours] = useState<OpeningHour[]>(defaultOpeningHours);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const form = useForm<ShopDetailsFormData>({
    resolver: zodResolver(shopDetailsSchema),
    defaultValues: {
      name: "",
      description: "",
      address: "",
      phone: "",
      email: "",
      website: "",
    },
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setBannerPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const updateOpeningHour = (
    id: string,
    field: keyof OpeningHour,
    value: string | boolean
  ) => {
    setOpeningHours((prev) =>
      prev.map((hour) => (hour.id === id ? { ...hour, [field]: value } : hour))
    );
  };

  const onSubmit = async (data: ShopDetailsFormData) => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("Shop details:", data);
    console.log("Opening hours:", openingHours);
    toast.success("Shop details saved successfully!");
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border px-4 py-4"
      >
        <h1 className="text-xl font-bold">Shop Details</h1>
        <p className="text-sm text-muted-foreground">
          Fill in your shop information
        </p>
      </motion.div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 space-y-4">
          {/* Logo & Banner Upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card variant="elevated">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Upload className="h-4 w-4 text-primary" />
                  Shop Images
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Banner Upload */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Banner Image
                  </label>
                  <div
                    className="relative h-28 rounded-xl border-2 border-dashed border-border bg-muted/30 overflow-hidden cursor-pointer"
                    onClick={() =>
                      document.getElementById("banner-upload")?.click()
                    }
                  >
                    {bannerPreview ? (
                      <img
                        src={bannerPreview}
                        alt="Banner preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <Plus className="h-6 w-6 mb-1" />
                        <span className="text-xs">Add Banner</span>
                      </div>
                    )}
                  </div>
                  <input
                    id="banner-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleBannerChange}
                  />
                </div>

                {/* Logo Upload */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Shop Logo
                  </label>
                  <div className="flex items-center gap-4">
                    <div
                      className="relative h-20 w-20 rounded-xl border-2 border-dashed border-border bg-muted/30 overflow-hidden cursor-pointer shrink-0"
                      onClick={() =>
                        document.getElementById("logo-upload")?.click()
                      }
                    >
                      {logoPreview ? (
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                          <Plus className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <p>Recommended: 200x200px</p>
                      <p>Max file size: 2MB</p>
                    </div>
                  </div>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Basic Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card variant="elevated">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Store className="h-4 w-4 text-primary" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shop Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter shop name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell customers about your shop..."
                          className="min-h-[100px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card variant="elevated">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  Contact Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            className="pl-10"
                            placeholder="Full address"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            className="pl-10"
                            placeholder="+1 234 567 8900"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            className="pl-10"
                            type="email"
                            placeholder="contact@yourshop.com"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website (Optional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            className="pl-10"
                            placeholder="https://yourshop.com"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Opening Hours */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card variant="elevated">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Opening Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {openingHours.map((hour) => (
                  <div
                    key={hour.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <span className="w-20 shrink-0 font-medium truncate">
                      {hour.day.slice(0, 3)}
                    </span>
                    {hour.isClosed ? (
                      <span className="flex-1 text-center text-muted-foreground">
                        Closed
                      </span>
                    ) : (
                      <>
                        <Input
                          type="time"
                          value={hour.openTime}
                          onChange={(e) =>
                            updateOpeningHour(hour.id, "openTime", e.target.value)
                          }
                          className="flex-1 h-9 text-xs"
                        />
                        <span className="text-muted-foreground">-</span>
                        <Input
                          type="time"
                          value={hour.closeTime}
                          onChange={(e) =>
                            updateOpeningHour(hour.id, "closeTime", e.target.value)
                          }
                          className="flex-1 h-9 text-xs"
                        />
                      </>
                    )}
                    <Button
                      type="button"
                      variant={hour.isClosed ? "outline" : "ghost"}
                      size="sm"
                      className="h-9 px-2"
                      onClick={() =>
                        updateOpeningHour(hour.id, "isClosed", !hour.isClosed)
                      }
                    >
                      {hour.isClosed ? "Open" : "×"}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="pt-2"
          >
            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold"
              disabled={isSaving}
            >
              {isSaving ? (
                "Saving..."
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Shop Details
                </>
              )}
            </Button>
          </motion.div>
        </form>
      </Form>
    </div>
  );
}
