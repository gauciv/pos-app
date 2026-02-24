import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiGet, apiPost, apiPut } from '@/lib/api';
import { useProducts } from '@/hooks/useProducts';
import { ProductForm } from '@/components/ProductForm';
import type { Product } from '@/types';
import toast from 'react-hot-toast';

export function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { categories } = useProducts();
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [loading, setLoading] = useState(!!id);
  const isEditing = !!id;

  useEffect(() => {
    if (!id) return;
    async function fetchProduct() {
      try {
        const data = await apiGet<Product>(`/products/${id}`);
        setProduct(data);
      } catch {
        toast.error('Product not found');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id, navigate]);

  async function handleSubmit(data: Partial<Product>) {
    if (isEditing && id) {
      await apiPut(`/products/${id}`, data);
      toast.success('Product updated');
    } else {
      await apiPost('/products', data);
      toast.success('Product created');
    }
    navigate('/products');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {isEditing ? 'Edit Product' : 'New Product'}
      </h1>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <ProductForm
          product={product}
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/products')}
        />
      </div>
    </div>
  );
}
