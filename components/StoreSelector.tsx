import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import type { Store } from '@/types';

interface StoreSelectorProps {
  stores: Store[];
  selectedId: string | null;
  onSelect: (store: Store) => void;
}

export function StoreSelector({ stores, selectedId, onSelect }: StoreSelectorProps) {
  return (
    <ScrollView className="max-h-64">
      {stores.map((store) => (
        <TouchableOpacity
          key={store.id}
          className={`p-4 border rounded-lg mb-2 ${
            selectedId === store.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
          }`}
          onPress={() => onSelect(store)}
        >
          <Text
            className={`text-base font-semibold ${
              selectedId === store.id ? 'text-blue-700' : 'text-gray-800'
            }`}
          >
            {store.name}
          </Text>
          {store.address && (
            <Text className="text-sm text-gray-500 mt-1">{store.address}</Text>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
