import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';
import { formatShortDate } from '@/lib/formatters';

export default function HomeScreen() {
  const { user } = useAuth();
  const { setStore, getItemCount } = useCart();
  const cartCount = getItemCount();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  // Auto-set store from user's branch
  useEffect(() => {
    if (user?.branch_id && user?.branch_name) {
      setStore(user.branch_id, user.branch_name);
    }
  }, [user?.branch_id, user?.branch_name, setStore]);

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

          {/* Branch Info */}
          <View className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <Text className="text-xs text-gray-500 mb-1">Your Branch</Text>
            <Text className="text-lg font-semibold text-gray-800">
              {user?.branch_name || 'Not assigned'}
            </Text>
          </View>

          {/* Actions */}
          <TouchableOpacity
            className={`rounded-lg py-4 items-center mb-3 ${
              user?.branch_id ? 'bg-blue-500' : 'bg-gray-300'
            }`}
            onPress={() => router.push('/(collector)/products')}
            disabled={!user?.branch_id}
          >
            <Text className="text-white font-semibold text-base">
              {user?.branch_id ? 'Browse Products' : 'No branch assigned'}
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
