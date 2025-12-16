import { FileText, Image, Globe, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const contentSections = [
  { title: "Landing Page", description: "Edit homepage content and hero section", icon: Globe, items: 5 },
  { title: "Blog Posts", description: "Manage blog articles and news", icon: FileText, items: 12 },
  { title: "Media Library", description: "Upload and manage images", icon: Image, items: 48 },
  { title: "Settings", description: "Site-wide configuration", icon: Settings, items: 8 },
];

export function AdminContentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Content Management</h1>
        <p className="text-muted-foreground">Manage website content and media</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {contentSections.map((section) => (
          <Card key={section.title} variant="interactive">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <section.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{section.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">{section.items} items</p>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4">
                Manage
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <Card variant="elevated">
        <CardHeader><CardTitle>Content Overview</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-xl bg-muted/50">
              <p className="text-2xl font-bold">5</p>
              <p className="text-sm text-muted-foreground">Pages</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/50">
              <p className="text-2xl font-bold">12</p>
              <p className="text-sm text-muted-foreground">Posts</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/50">
              <p className="text-2xl font-bold">48</p>
              <p className="text-sm text-muted-foreground">Images</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/50">
              <p className="text-2xl font-bold">3</p>
              <p className="text-sm text-muted-foreground">Drafts</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
