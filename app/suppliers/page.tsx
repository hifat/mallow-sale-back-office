"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Edit, Trash2, Eye, Package, X } from "lucide-react";
import {
  fetchSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  Supplier,
  SupplierPayload,
} from "@/lib/supplier-api";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";

function SupplierForm({ supplier, onSave, onCancel, loading }: {
  supplier?: Supplier | null;
  onSave: (data: SupplierPayload) => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  const [formData, setFormData] = useState<SupplierPayload>({
    name: supplier?.name || "",
    imgUrl: supplier?.imgUrl || "",
  });
  const [errors, setErrors] = useState<{ name?: string; imgUrl?: string }>({});

  useEffect(() => {
    setFormData({
      name: supplier?.name || "",
      imgUrl: supplier?.imgUrl || "",
    });
  }, [supplier]);

  const validate = () => {
    const errs: typeof errors = {};
    if (!formData.name.trim()) errs.name = "Name is required";
    if (!formData.imgUrl.trim()) errs.imgUrl = "Image URL is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-gray-900">{supplier ? "Edit Supplier" : "Add Supplier"}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                value={formData.name}
                onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                className={errors.name ? "border-red-500" : "border-yellow-200 focus:border-yellow-500"}
                placeholder="Supplier name"
              />
              {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium mb-1">Image URL</label>
              <Input
                value={formData.imgUrl}
                onChange={e => setFormData(f => ({ ...f, imgUrl: e.target.value }))}
                className={errors.imgUrl ? "border-red-500" : "border-yellow-200 focus:border-yellow-500"}
                placeholder="https://..."
              />
              {errors.imgUrl && <p className="text-sm text-red-600">{errors.imgUrl}</p>}
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {supplier ? (loading ? "Saving..." : "Save") : (loading ? "Adding..." : "Add Supplier")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function SupplierDetails({ supplier, onClose, onEdit }: { supplier: Supplier; onClose: () => void; onEdit: (supplier: Supplier) => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-gray-900 flex items-center">
            <Package className="h-5 w-5 mr-2 text-yellow-600" />
            Supplier Details
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(supplier)}
              className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4 py-4">
            <div className="w-24 h-24 flex items-center justify-center bg-gray-100 overflow-hidden border">
              <img
                src={supplier.imgUrl}
                alt={supplier.name}
                className="max-w-full max-h-full"
                style={{ aspectRatio: '1/1' }}
                onLoad={e => {
                  const img = e.currentTarget;
                  img.className =
                    "max-w-full max-h-full " +
                    (img.naturalWidth >= img.naturalHeight ? "w-full h-auto" : "h-full w-auto");
                }}
              />
            </div>
            <div className="text-xl font-bold text-gray-900">{supplier.name}</div>
            <div className="text-xs text-gray-500">Updated: {formatDate(supplier.updatedAt)}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState<Supplier | null>(null);

  const fetchList = async (search = "") => {
    setLoading(true);
    try {
      const data = await fetchSuppliers(search);
      setSuppliers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleSave = async (data: SupplierPayload) => {
    setLoading(true);
    try {
      if (editingSupplier) {
        await updateSupplier(editingSupplier.id, data);
      } else {
        await createSupplier(data);
      }
      await fetchList(searchTerm);
    } catch (e) {
      console.error(e);
    } finally {
      setShowForm(false);
      setEditingSupplier(null);
      setLoading(false);
    }
  };

  const handleDelete = async (supplier: Supplier) => {
    setLoading(true);
    try {
      await deleteSupplier(supplier.id);
      await fetchList(searchTerm);
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingSupplier(null);
      setLoading(false);
    }
  };

  const filteredSuppliers = suppliers.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Supplier Management</h1>
            <p className="text-gray-600 mt-2">Manage your suppliers here</p>
          </div>
          <Button onClick={() => { setShowForm(true); setEditingSupplier(null); }} className="bg-yellow-500 hover:bg-yellow-600 text-white">
            <Plus className="h-4 w-4 mr-2" /> Add Supplier
          </Button>
        </div>
        <Card className="border-yellow-200">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center">
              <Package className="h-5 w-5 mr-2 text-yellow-600" />
              Suppliers
            </CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search suppliers..."
                  value={searchTerm}
                  onChange={e => {
                    setSearchTerm(e.target.value);
                    fetchList(e.target.value);
                  }}
                  className="pl-10 border-yellow-200 focus:border-yellow-500"
                />
              </div>
              <div className="flex-1" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSuppliers.map(supplier => (
                <Card key={supplier.id} className="border-gray-200 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-16 h-16 flex items-center justify-center bg-gray-100 overflow-hidden border">
                        <img
                          src={supplier.imgUrl}
                          alt={supplier.name}
                          className="max-w-full max-h-full"
                          style={{ aspectRatio: '1/1' }}
                          onLoad={e => {
                            const img = e.currentTarget;
                            img.className =
                              "max-w-full max-h-full " +
                              (img.naturalWidth >= img.naturalHeight ? "w-full h-auto" : "h-full w-auto");
                          }}
                        />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-gray-900 truncate max-w-[12rem] md:max-w-[16rem] lg:max-w-[24rem]">
                          {supplier.name}
                        </CardTitle>
                        <div className="text-xs text-gray-500 mt-1">Updated: {formatDate(supplier.updatedAt)}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => setShowDetails(supplier)} className="hover:bg-yellow-50">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { setEditingSupplier(supplier); setShowForm(true); }} className="hover:bg-yellow-50">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeletingSupplier(supplier)} className="hover:bg-red-50 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>

            {filteredSuppliers.length === 0 && (
                <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No suppliers found</p>
                    <p className="text-sm text-gray-500">Create your first supplier to get started</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
      {(showForm || editingSupplier) && (
        <SupplierForm
          supplier={editingSupplier}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingSupplier(null); }}
          loading={loading}
        />
      )}
      {showDetails && (
        <SupplierDetails
          supplier={showDetails}
          onClose={() => setShowDetails(null)}
          onEdit={(supplier) => {
            setEditingSupplier(supplier);
            setShowForm(true);
            setShowDetails(null);
          }}
        />
      )}
      {deletingSupplier && (
        <DeleteConfirmDialog
          title="Delete Supplier"
          description={`Are you sure you want to delete "${deletingSupplier.name}"? This action cannot be undone.`}
          onConfirm={() => handleDelete(deletingSupplier)}
          onCancel={() => setDeletingSupplier(null)}
        />
      )}
    </>
  );
} 