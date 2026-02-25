import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';
import { useStores } from '@/hooks/useStores';
import { StoreSelector } from '@/components/StoreSelector';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { formatShortDate } from '@/lib/formatters';

export default function HomeScreen() {
  const { user } = useAuth();
  const { storeId, setStore, getItemCount } = useCart();
  const { stores, loading, error } = useStores();
  const cartCount = getItemCount();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  if (loading) {
    return <LoadingSpinner message="Loading stores..." />;
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="items-center">
        <View style={isTablet ? { maxWidth: 600, width: '100%' } : { width: '100%' }} className="px-4 py-6">
          {/* Header */}
          <View className="flex-row justify-between items-start mb-6">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-800">
                Welcome, {user?.full_name}
              </Text>
              <Text className="text-sm text-gray-500 mt-1">
                {formatShortDate(new Date().toISOString())}
              </Text>
            </View>
            <TouchableOpacity
              className="bg-gray-100 p-2.5 rounded-lg"
              onPress={() => router.push('/(collector)/settings')}
            >
              <Ionicons name="settings-outline" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Store Selection */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-3">
              Select Client Store
            </Text>
            {error ? (
              <Text className="text-red-500 text-sm">{error}</Text>
            ) : stores.length === 0 ? (
              <Text className="text-gray-500 text-sm">No stores available</Text>
            ) : (
              <StoreSelector
                stores={stores}
                selectedId={storeId}
                onSelect={(store) => setStore(store.id, store.name)}
              />
            )}
          </View>

          {/* Actions */}
          <TouchableOpacity
            className={`rounded-lg py-4 items-center mb-3 ${
              storeId ? 'bg-blue-500' : 'bg-gray-300'
            }`}
            onPress={() => router.push('/(collector)/products')}
            disabled={!storeId}
          >
            <Text className="text-white font-semibold text-base">
              {storeId ? 'Browse Products' : 'Select a store first'}
            </Text>
          </TouchableOpacity>

          {cartCount > 0 && (
            <TouchableOpacity
              className="bg-green-500 rounded-lg py-4 items-center"
              onPress={() => router.push('/(collector)/cart')}
            >
              <Text className="text-white font-semibold text-base">
                View Cart ({cartCount} items)
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
