import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Save, ArrowLeft, Plus, Edit, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { adminService } from "@/services/adminService";
import { toast } from "sonner";

interface LandingPageManagementProps {
  onBack: () => void;
}

export function LandingPageManagement({ onBack }: LandingPageManagementProps) {
  const [contacts, setContacts] = useState<any[]>([]);
  const [editingContact, setEditingContact] = useState<any>(null);
  const [newContact, setNewContact] = useState({
    email: "",
    phone: "",
    address: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);

  useEffect(() => {
    fetchAllContacts();
  }, []);

  const fetchAllContacts = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllContactInfo();
      setContacts(response.data || []);
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newContact.email || !newContact.phone || !newContact.address) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setSaving(true);
      await adminService.createContactInfo(newContact);
      toast.success("Contact information created successfully!");
      setNewContact({ email: "", phone: "", address: "" });
      setShowNewForm(false);
      fetchAllContacts();
    } catch (error: any) {
      toast.error("Failed to create contact information");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (contact: any) => {
    try {
      setSaving(true);
      await adminService.editContactInfo(contact._id, {
        email: contact.email,
        phone: contact.phone,
        address: contact.address
      });
      toast.success("Contact information updated successfully!");
      setEditingContact(null);
      fetchAllContacts();
    } catch (error: any) {
      toast.error("Failed to update contact information");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contact information?")) {
      return;
    }

    try {
      await adminService.deleteContactInfo(id);
      toast.success("Contact information deleted successfully!");
      fetchAllContacts();
    } catch (error: any) {
      toast.error("Failed to delete contact information");
    }
  };

  const handleSetActive = async (id: string) => {
    try {
      await adminService.setActiveContactInfo(id);
      toast.success("Contact information activated successfully!");
      fetchAllContacts();
    } catch (error: any) {
      toast.error("Failed to activate contact information");
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Contact Information Management</h1>
            <p className="text-muted-foreground">Manage contact information displayed on the landing page</p>
          </div>
        </div>
        <Button onClick={() => setShowNewForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add New
        </Button>
      </div>

      {/* New Contact Form */}
      {showNewForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Add New Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="new-email">Email Address</Label>
                <Input
                  id="new-email"
                  type="email"
                  placeholder="support@digitalmenu.com"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="new-phone">Phone Number</Label>
                <Input
                  id="new-phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="new-address">Address</Label>
                <Input
                  id="new-address"
                  placeholder="123 Tech Street, San Francisco, CA"
                  value={newContact.address}
                  onChange={(e) => setNewContact({ ...newContact, address: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreate} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Creating..." : "Create"}
                </Button>
                <Button variant="outline" onClick={() => setShowNewForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Contact List */}
      <div className="space-y-4">
        {contacts.map((contact) => (
          <motion.div
            key={contact._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {editingContact?._id === contact._id ? (
                      <div className="space-y-4">
                        <div>
                          <Label>Email Address</Label>
                          <Input
                            value={editingContact.email}
                            onChange={(e) => setEditingContact({ ...editingContact, email: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Phone Number</Label>
                          <Input
                            value={editingContact.phone}
                            onChange={(e) => setEditingContact({ ...editingContact, phone: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Address</Label>
                          <Input
                            value={editingContact.address}
                            onChange={(e) => setEditingContact({ ...editingContact, address: e.target.value })}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleEdit(editingContact)} disabled={saving}>
                            <Save className="h-4 w-4 mr-2" />
                            {saving ? "Saving..." : "Save"}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingContact(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{contact.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{contact.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{contact.address}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={contact.isActive ? "success" : "secondary"}>
                            {contact.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Created: {new Date(contact.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {editingContact?._id !== contact._id && (
                    <div className="flex gap-2">
                      {!contact.isActive && (
                        <Button size="sm" variant="outline" onClick={() => handleSetActive(contact._id)}>
                          <Check className="h-4 w-4 mr-2" />
                          Activate
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => setEditingContact(contact)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(contact._id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {contacts.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Contact Information</h3>
            <p className="text-muted-foreground mb-4">Create your first contact information entry.</p>
            <Button onClick={() => setShowNewForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Contact Info
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
