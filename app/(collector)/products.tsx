import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/lib/cart';
import { SearchBar } from '@/components/SearchBar';
import { ProductCard } from '@/components/ProductCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';

export default function ProductsScreen() {
  const {
    products,
    categories,
    loading,
    error,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
  } = useProducts();
  const { addItem, items, getItemCount } = useCart();
  const cartCount = getItemCount();

  function getCartQuantity(productId: string): number {
    const item = items.find((i) => i.product_id === productId);
    return item?.quantity || 0;
  }

  if (loading && products.length === 0) {
    return <LoadingSpinner message="Loading products..." />;
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-4 pt-4">
        <SearchBar value={search} onChangeText={setSearch} />

        {/* Category filter */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ id: null, name: 'All' }, ...categories]}
          keyExtractor={(item) => item.id || 'all'}
          className="mb-3"
          renderItem={({ item }) => (
            <TouchableOpacity
              className={`px-4 py-2 rounded-full mr-2 ${
                categoryFilter === item.id
                  ? 'bg-blue-500'
                  : item.id === null && !categoryFilter
                  ? 'bg-blue-500'
                  : 'bg-gray-200'
              }`}
              onPress={() => setCategoryFilter(item.id as string | null)}
            >
              <Text
                className={`text-sm font-medium ${
                  categoryFilter === item.id || (item.id === null && !categoryFilter)
                    ? 'text-white'
                    : 'text-gray-700'
                }`}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {error ? (
        <View className="px-4">
          <Text className="text-red-500">{error}</Text>
        </View>
      ) : products.length === 0 ? (
        <EmptyState title="No products found" message="Try adjusting your search or filter" />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onAdd={(product) =>
                addItem({
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  stock_quantity: product.stock_quantity,
                })
              }
              cartQuantity={getCartQuantity(item.id)}
            />
          )}
        />
      )}

      {/* Floating cart button */}
      {cartCount > 0 && (
        <TouchableOpacity
          className="absolute bottom-6 right-6 bg-blue-500 rounded-full px-6 py-4 shadow-lg"
          onPress={() => router.push('/(collector)/cart')}
        >
          <Text className="text-white font-bold">Cart ({cartCount})</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
