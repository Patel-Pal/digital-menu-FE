import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, MoreVertical, Eye, Edit, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockShops } from "@/utils/mockData";

export function AdminShopsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredShops = mockShops.filter((shop) =>
    shop.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Shops</h1>
          <p className="text-muted-foreground">Manage all registered shops</p>
        </div>
        <Button variant="gradient">
          <Plus className="h-4 w-4 mr-2" /> Add Shop
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search shops..."
            icon={<Search className="h-4 w-4" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Desktop Table */}
      <Card variant="elevated" className="hidden lg:block">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 font-medium text-muted-foreground">Shop</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Plan</th>
                <th className="text-left p-4 font-medium text-muted-foreground">QR Scans</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Created</th>
                <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredShops.map((shop) => (
                <tr key={shop.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {shop.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{shop.name}</p>
                        <p className="text-sm text-muted-foreground">{shop.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant={shop.subscription === "premium" ? "default" : shop.subscription === "basic" ? "secondary" : "outline"}>
                      {shop.subscription}
                    </Badge>
                  </td>
                  <td className="p-4 font-medium">{shop.qrScans.toLocaleString()}</td>
                  <td className="p-4">
                    <Badge variant={shop.isActive ? "success" : "destructive"}>
                      {shop.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="p-4 text-muted-foreground">{shop.createdAt}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon-sm"><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon-sm"><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon-sm" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-3">
        {filteredShops.map((shop, index) => (
          <motion.div
            key={shop.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card variant="elevated">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary text-lg">
                      {shop.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold">{shop.name}</p>
                      <p className="text-sm text-muted-foreground">{shop.email}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon-sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <div className="flex gap-2">
                    <Badge variant={shop.subscription === "premium" ? "default" : "secondary"}>
                      {shop.subscription}
                    </Badge>
                    <Badge variant={shop.isActive ? "success" : "destructive"}>
                      {shop.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <span className="text-sm font-medium">{shop.qrScans} scans</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
