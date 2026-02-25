import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '@/lib/cart';
import { useOrderSubmit } from '@/hooks/useOrderSubmit';
import { formatCurrency } from '@/lib/formatters';

export default function CartScreen() {
  const { items, updateQuantity, removeItem, getSubtotal, clearCart } = useCart();
  const { submitOrder, loading, error } = useOrderSubmit();
  const [notes, setNotes] = useState('');
  const subtotal = getSubtotal();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  async function handleConfirm() {
    const result = await submitOrder(notes || undefined);
    if (result) {
      router.replace({
        pathname: '/(collector)/confirmation',
        params: { orderNumber: result.order_number },
      });
    }
  }

  function handleCancel() {
    clearCart();
    router.replace('/(collector)/products');
  }

  if (items.length === 0) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center px-4">
        <Ionicons name="receipt-outline" size={48} color="#d1d5db" />
        <Text className="text-gray-500 text-lg font-medium mt-4">Your cart is empty</Text>
        <Text className="text-gray-400 text-sm mt-1">Add products to get started</Text>
        <TouchableOpacity
          className="mt-6 bg-blue-500 rounded-lg px-8 py-3"
          onPress={() => router.back()}
        >
          <Text className="text-white font-semibold">Browse Products</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 24,
          ...(isTablet ? { maxWidth: 600, alignSelf: 'center' as const, width: '100%' } : {}),
        }}
      >
        {/* Receipt-style order list */}
        <View className="bg-white mx-4 mt-4 rounded-xl border border-gray-100 overflow-hidden">
          {/* Receipt header */}
          <View className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <Text className="text-xs text-gray-500 font-medium uppercase tracking-wide">
              Order Summary
            </Text>
          </View>

          {/* Items */}
          {items.map((item, index) => (
            <View
              key={item.product_id}
              className={`px-4 py-3 ${index < items.length - 1 ? 'border-b border-gray-50' : ''}`}
            >
              <View className="flex-row justify-between items-start">
                <View className="flex-1 mr-3">
                  <Text className="text-sm font-semibold text-gray-800">
                    {item.product_name}
                  </Text>
                  <Text className="text-xs text-gray-400 mt-0.5">
                    {formatCurrency(item.unit_price)} x {item.quantity}
                  </Text>
                </View>
                <Text className="text-sm font-bold text-gray-800">
                  {formatCurrency(item.line_total)}
                </Text>
              </View>

              {/* Quantity controls */}
              <View className="flex-row items-center mt-2">
                <TouchableOpacity
                  className="w-7 h-7 rounded-full bg-gray-100 items-center justify-center"
                  onPress={() => {
                    if (item.quantity <= 1) {
                      removeItem(item.product_id);
                    } else {
                      updateQuantity(item.product_id, item.quantity - 1);
                    }
                  }}
                >
                  <Ionicons
                    name={item.quantity <= 1 ? 'trash-outline' : 'remove'}
                    size={14}
                    color={item.quantity <= 1 ? '#ef4444' : '#374151'}
                  />
                </TouchableOpacity>
                <Text className="mx-3 text-sm font-medium text-gray-700 min-w-[20px] text-center">
                  {item.quantity}
                </Text>
                <TouchableOpacity
                  className="w-7 h-7 rounded-full bg-gray-100 items-center justify-center"
                  onPress={() => updateQuantity(item.product_id, item.quantity + 1)}
                  disabled={item.quantity >= item.stock_quantity}
                >
                  <Ionicons
                    name="add"
                    size={14}
                    color={item.quantity >= item.stock_quantity ? '#d1d5db' : '#374151'}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {/* Total */}
          <View className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <View className="flex-row justify-between items-center">
              <Text className="text-base font-bold text-gray-800">Total</Text>
              <Text className="text-lg font-bold text-blue-600">
                {formatCurrency(subtotal)}
              </Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        <View className="mx-4 mt-4">
          <Text className="text-sm font-medium text-gray-600 mb-2">Notes (optional)</Text>
          <TextInput
            className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-800"
            value={notes}
            onChangeText={setNotes}
            placeholder="Add notes for this order..."
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Error */}
        {error && (
          <View className="mx-4 mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
            <Text className="text-red-600 text-sm text-center">{error}</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom action buttons */}
      <View className="border-t border-gray-200 bg-white px-4 pb-8 pt-4">
        <View
          style={isTablet ? { maxWidth: 600, alignSelf: 'center' as const, width: '100%' } : {}}
        >
          <TouchableOpacity
            className={`rounded-xl py-4 items-center mb-3 ${
              loading ? 'bg-green-300' : 'bg-green-500'
            }`}
            onPress={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color="#ffffff" />
                <Text className="text-white font-bold text-base ml-2">Submitting...</Text>
              </View>
            ) : (
              <Text className="text-white font-bold text-base">Confirm & Submit Order</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="rounded-xl py-3.5 items-center bg-gray-200"
            onPress={handleCancel}
            disabled={loading}
          >
            <Text className="text-gray-700 font-medium text-base">Cancel Order</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
