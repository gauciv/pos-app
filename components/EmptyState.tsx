import React from 'react';
import { View, Text } from 'react-native';

interface EmptyStateProps {
  title: string;
  message?: string;
}

export function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center py-12">
      <Text className="text-lg font-semibold text-gray-400">{title}</Text>
      {message && <Text className="text-sm text-gray-400 mt-2 text-center px-8">{message}</Text>}
    </View>
  );
}
