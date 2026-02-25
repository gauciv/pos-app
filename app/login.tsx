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
import { CameraView } from 'expo-camera';
import { useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth';

type Tab = 'scan' | 'code';

export default function ActivationScreen() {
  const { activate } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('scan');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
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

  async function handleActivate(activationCode: string) {
    const trimmed = activationCode.toUpperCase().trim();
    if (trimmed.length !== 6) {
      setError('Activation code must be 6 characters');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await activate(trimmed);
      // AuthProvider will pick up the session via onAuthStateChange
      // and the index.tsx redirect will navigate to home
    } catch (err: any) {
      setError(err.message || 'Activation failed. Please try again.');
      setScanned(false);
    } finally {
      setLoading(false);
    }
  }

  function handleBarCodeScanned({ data }: { data: string }) {
    if (scanned || loading) return;
    setScanned(true);
    handleActivate(data);
  }

  function renderScanTab() {
    if (!permission) {
      return (
        <View className="flex-1 items-center justify-center p-8">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      );
    }

    if (!permission.granted) {
      return (
        <View className="flex-1 items-center justify-center p-8">
          <Ionicons name="camera-outline" size={48} color="#9ca3af" />
          <Text className="text-gray-600 text-center mt-4 mb-4">
            Camera permission is required to scan QR codes
          </Text>
          <TouchableOpacity
            className="bg-blue-500 rounded-lg px-6 py-3"
            onPress={requestPermission}
          >
            <Text className="text-white font-semibold">Grant Permission</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View className="flex-1">
        <View
          className="overflow-hidden rounded-xl mx-4 mt-4"
          style={{ height: isTablet ? 300 : 250 }}
        >
          <CameraView
            style={{ flex: 1 }}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          />
          {/* Overlay with scanning frame */}
          <View
            className="absolute inset-0 items-center justify-center"
            pointerEvents="none"
          >
            <View
              className="border-2 border-white rounded-lg"
              style={{ width: 200, height: 200, opacity: 0.7 }}
            />
          </View>
        </View>
        <Text className="text-gray-500 text-sm text-center mt-4 px-4">
          Point your camera at the QR code provided by your administrator
        </Text>
        {scanned && !loading && (
          <TouchableOpacity
            className="mx-4 mt-4 items-center py-3 bg-gray-100 rounded-lg"
            onPress={() => setScanned(false)}
          >
            <Text className="text-blue-500 font-medium">Tap to scan again</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  function renderCodeTab() {
    return (
      <View className="flex-1 px-4 pt-6">
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
          onPress={() => handleActivate(code)}
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
    );
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
          <Text className="text-base text-gray-500 text-center mb-6">
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

          {/* Tab switcher */}
          <View className="flex-row mx-4 mb-4 bg-gray-100 rounded-lg p-1">
            <TouchableOpacity
              className={`flex-1 py-2.5 rounded-md items-center flex-row justify-center ${
                activeTab === 'scan' ? 'bg-white shadow-sm' : ''
              }`}
              onPress={() => {
                setActiveTab('scan');
                setError('');
              }}
            >
              <Ionicons
                name="qr-code-outline"
                size={16}
                color={activeTab === 'scan' ? '#3b82f6' : '#6b7280'}
              />
              <Text
                className={`ml-1.5 font-medium text-sm ${
                  activeTab === 'scan' ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                Scan QR
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-2.5 rounded-md items-center flex-row justify-center ${
                activeTab === 'code' ? 'bg-white shadow-sm' : ''
              }`}
              onPress={() => {
                setActiveTab('code');
                setError('');
                setScanned(false);
              }}
            >
              <Ionicons
                name="keypad-outline"
                size={16}
                color={activeTab === 'code' ? '#3b82f6' : '#6b7280'}
              />
              <Text
                className={`ml-1.5 font-medium text-sm ${
                  activeTab === 'code' ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                Enter Code
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab content */}
          <View style={{ minHeight: isTablet ? 350 : 300 }}>
            {activeTab === 'scan' ? renderScanTab() : renderCodeTab()}
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
