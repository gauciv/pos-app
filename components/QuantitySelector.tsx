import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';

interface QuantitySelectorProps {
  value: number;
  max: number;
  onChange: (value: number) => void;
}

export function QuantitySelector({ value, max, onChange }: QuantitySelectorProps) {
  return (
    <View className="flex-row items-center">
      <TouchableOpacity
        className="w-8 h-8 bg-gray-200 rounded items-center justify-center"
        onPress={() => onChange(Math.max(0, value - 1))}
      >
        <Text className="text-lg font-bold text-gray-700">-</Text>
      </TouchableOpacity>
      <TextInput
        className="w-12 h-8 text-center border border-gray-300 rounded mx-1"
        value={String(value)}
        keyboardType="number-pad"
        onChangeText={(text) => {
          const num = parseInt(text, 10);
          if (!isNaN(num) && num >= 0 && num <= max) {
            onChange(num);
          }
        }}
      />
      <TouchableOpacity
        className="w-8 h-8 bg-blue-500 rounded items-center justify-center"
        onPress={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
      >
        <Text className="text-lg font-bold text-white">+</Text>
      </TouchableOpacity>
    </View>
  );
}
