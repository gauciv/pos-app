import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth';

export default function ActivationScreen() {
  const { activate } = useAuth();
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const inputRef = useRef<TextInput>(null);

  const VALID_CHARS = '23456789ACDEFGHJKMNPQRSTUVWXYZ';

  function filterCode(text: string): string {
    return text
      .toUpperCase()
      .split('')
      .filter((c) => VALID_CHARS.includes(c))
      .join('')
      .slice(0, 6);
  }

  async function handleActivate() {
    const trimmed = code.toUpperCase().trim();
    if (trimmed.length !== 6) {
      setError('Activation code must be 6 characters');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await activate(trimmed);
    } catch (err: any) {
      setError(err.message || 'Activation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="flex-1 justify-center items-center px-4">
        <View
          style={
            isTablet
              ? { maxWidth: 420, width: '100%' }
              : { width: '100%', paddingHorizontal: 0 }
          }
        >
          {/* Header */}
          <Text className="text-3xl font-bold text-blue-600 text-center mb-2">
            POS App
          </Text>
          <Text className="text-base text-gray-500 text-center mb-8">
            Activate your collector account
          </Text>

          {/* Error */}
          {error ? (
            <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 mx-4">
              <Text className="text-red-600 text-sm text-center">{error}</Text>
            </View>
          ) : null}

          {/* Loading overlay */}
          {loading ? (
            <View className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 mx-4 flex-row items-center justify-center">
              <ActivityIndicator size="small" color="#3b82f6" />
              <Text className="text-blue-600 text-sm ml-2">Activating...</Text>
            </View>
          ) : null}

          {/* Scan QR Button */}
          <TouchableOpacity
            className="mx-4 mb-6 bg-blue-500 rounded-xl py-4 flex-row items-center justify-center"
            onPress={() => router.push('/scan')}
            disabled={loading}
          >
            <Ionicons name="qr-code-outline" size={22} color="#ffffff" />
            <Text className="text-white font-semibold text-base ml-2">
              Scan QR Code
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center mx-4 mb-6">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="text-gray-400 text-sm mx-3">or enter code manually</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          {/* Manual Code Entry */}
          <View className="px-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Activation Code
            </Text>
            <TextInput
              ref={inputRef}
              className="border border-gray-300 rounded-lg px-4 py-4 text-center text-2xl font-mono tracking-widest"
              value={code}
              onChangeText={(text) => setCode(filterCode(text))}
              placeholder="ABC123"
              placeholderTextColor="#d1d5db"
              maxLength={6}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <Text className="text-gray-400 text-xs text-center mt-2">
              Enter the 6-character code from your administrator
            </Text>

            <TouchableOpacity
              className={`rounded-lg py-4 items-center mt-6 ${
                loading || code.length !== 6 ? 'bg-blue-300' : 'bg-blue-500'
              }`}
              onPress={handleActivate}
              disabled={loading || code.length !== 6}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-white font-semibold text-base">
                  Activate
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
