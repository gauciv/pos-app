import React from 'react';
import { View, Text, FlatList, TouchableOpacity, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { useCart } from '@/lib/cart';
import { CartItem } from '@/components/CartItem';
import { EmptyState } from '@/components/EmptyState';
import { formatCurrency } from '@/lib/formatters';

export default function CartScreen() {
  const { items, updateQuantity, removeItem, getSubtotal, storeName } = useCart();
  const subtotal = getSubtotal();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  if (items.length === 0) {
    return (
      <View className="flex-1 bg-gray-50">
        <EmptyState title="Your cart is empty" message="Add products from the product list" />
        <View className="items-center px-4 pb-6">
          <View style={isTablet ? { maxWidth: 600, width: '100%' } : { width: '100%' }}>
            <TouchableOpacity
              className="bg-blue-500 rounded-lg py-4 items-center"
              onPress={() => router.back()}
            >
              <Text className="text-white font-semibold">Browse Products</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="items-center">
        <View style={isTablet ? { maxWidth: 600, width: '100%' } : { width: '100%' }} className="px-4 pt-4">
          <Text className="text-sm text-gray-500 mb-4">
            Store: {storeName}
          </Text>
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.product_id}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 16,
          ...(isTablet ? { maxWidth: 600, alignSelf: 'center' as const, width: '100%' } : {}),
        }}
        renderItem={({ item }) => (
          <CartItem
            item={item}
            onUpdateQuantity={updateQuantity}
            onRemove={removeItem}
          />
        )}
      />

      <View className="border-t border-gray-200 bg-white items-center">
        <View style={isTablet ? { maxWidth: 600, width: '100%' } : { width: '100%' }} className="px-4 pb-6 pt-4">
          <View className="flex-row justify-between mb-4">
            <Text className="text-lg font-bold text-gray-800">Subtotal</Text>
            <Text className="text-lg font-bold text-blue-600">
              {formatCurrency(subtotal)}
            </Text>
          </View>

          <TouchableOpacity
            className="bg-blue-500 rounded-lg py-4 items-center mb-3"
            onPress={() => router.push('/(collector)/checkout')}
          >
            <Text className="text-white font-semibold text-base">Proceed to Checkout</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-gray-200 rounded-lg py-3 items-center"
            onPress={() => router.back()}
          >
            <Text className="text-gray-700 font-medium">Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
