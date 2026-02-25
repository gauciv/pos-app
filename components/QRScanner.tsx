import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

interface QRScannerProps {
  onScanned: (code: string) => void;
  isTablet: boolean;
  disabled: boolean;
}

export default function QRScanner({ onScanned, isTablet, disabled }: QRScannerProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    Camera.getCameraPermissionsAsync().then(({ status }) => {
      setHasPermission(status === 'granted');
    });
  }, []);

  async function handleRequestPermission() {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  }

  const handleBarCodeScanned = useCallback(
    ({ data }: { data: string }) => {
      if (scanned || disabled) return;
      setScanned(true);
      onScanned(data);
    },
    [scanned, disabled, onScanned]
  );

  if (hasPermission === null) {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <Ionicons name="camera-outline" size={48} color="#9ca3af" />
        <Text className="text-gray-600 text-center mt-4 mb-4">
          Camera permission is required to scan QR codes
        </Text>
        <TouchableOpacity
          className="bg-blue-500 rounded-lg px-6 py-3"
          onPress={handleRequestPermission}
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
      {scanned && !disabled && (
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
