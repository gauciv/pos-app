import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

export default function ConfirmationScreen() {
  const { orderNumber } = useLocalSearchParams<{ orderNumber: string }>();

  return (
    <View className="flex-1 bg-white items-center justify-center px-8">
      <View className="bg-green-100 w-20 h-20 rounded-full items-center justify-center mb-6">
        <Text className="text-4xl text-green-600">✓</Text>
      </View>

      <Text className="text-2xl font-bold text-gray-800 mb-2">Order Submitted!</Text>
      <Text className="text-gray-500 text-center mb-6">
        Your order has been sent for processing.
      </Text>

      <View className="bg-gray-50 rounded-lg p-4 w-full mb-8">
        <Text className="text-sm text-gray-500 text-center">Order Number</Text>
        <Text className="text-xl font-bold text-blue-600 text-center mt-1">
          {orderNumber}
        </Text>
      </View>

      <TouchableOpacity
        className="bg-blue-500 rounded-lg py-4 items-center w-full"
        onPress={() => router.replace('/(collector)/home')}
      >
        <Text className="text-white font-semibold text-base">New Order</Text>
      </TouchableOpacity>
    </View>
  );
}
