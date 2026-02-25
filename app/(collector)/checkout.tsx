import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';
import { useOrderSubmit } from '@/hooks/useOrderSubmit';
import { OrderSummaryCard } from '@/components/OrderSummaryCard';
import { formatShortDate } from '@/lib/formatters';

export default function CheckoutScreen() {
  const { user } = useAuth();
  const { items, storeName, getSubtotal } = useCart();
  const { submitOrder, loading, error } = useOrderSubmit();
  const [notes, setNotes] = useState('');
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

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="items-center">
        <View style={isTablet ? { maxWidth: 600, width: '100%' } : { width: '100%' }} className="px-4 py-6">
          <Text className="text-xl font-bold text-gray-800 mb-4">Order Review</Text>

          {/* Order info */}
          <View className="bg-white rounded-lg p-4 mb-4 border border-gray-100">
            <Text className="text-sm text-gray-500">Collector</Text>
            <Text className="text-base font-medium text-gray-800">{user?.full_name}</Text>
            <Text className="text-sm text-gray-500 mt-2">Date</Text>
            <Text className="text-base text-gray-800">
              {formatShortDate(new Date().toISOString())}
            </Text>
          </View>

          {/* Items summary */}
          <OrderSummaryCard
            items={items}
            storeName={storeName || ''}
            subtotal={getSubtotal()}
          />

          {/* Notes */}
          <View className="mt-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Notes (optional)</Text>
            <TextInput
              className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-base"
              value={notes}
              onChangeText={setNotes}
              placeholder="Add notes for this order..."
              multiline
              numberOfLines={3}
            />
          </View>

          {error && (
            <View className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
              <Text className="text-red-600 text-sm">{error}</Text>
            </View>
          )}

          {/* Actions */}
          <TouchableOpacity
            className={`rounded-lg py-4 items-center mt-6 ${loading ? 'bg-blue-300' : 'bg-blue-500'}`}
            onPress={handleConfirm}
            disabled={loading}
          >
            <Text className="text-white font-semibold text-base">
              {loading ? 'Submitting...' : 'Confirm Order'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-gray-200 rounded-lg py-3 items-center mt-3"
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text className="text-gray-700 font-medium">Edit Cart</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
