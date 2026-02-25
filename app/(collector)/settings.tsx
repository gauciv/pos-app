import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/lib/auth';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  async function handleLogout() {
    setShowLogoutModal(false);
    await signOut();
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="items-center">
        <View
          style={isTablet ? { maxWidth: 600, width: '100%' } : { width: '100%' }}
          className="px-4 py-6"
        >
          {/* Profile Section */}
          <View className="bg-white rounded-xl p-5 mb-6 shadow-sm">
            <View className="items-center mb-4">
              <View className="w-16 h-16 rounded-full bg-blue-100 items-center justify-center mb-3">
                <Ionicons name="person" size={32} color="#3b82f6" />
              </View>
              <Text className="text-xl font-bold text-gray-800">
                {user?.full_name}
              </Text>
              <Text className="text-sm text-gray-500 mt-1">{user?.email}</Text>
              <View className="bg-blue-100 px-3 py-1 rounded-full mt-2">
                <Text className="text-blue-700 text-xs font-medium capitalize">
                  {user?.role}
                </Text>
              </View>
            </View>
          </View>

          {/* App Info */}
          <View className="bg-white rounded-xl p-5 mb-6 shadow-sm">
            <Text className="text-sm font-semibold text-gray-500 uppercase mb-3">
              App Info
            </Text>
            <View className="flex-row justify-between py-3 border-b border-gray-100">
              <Text className="text-gray-600">Version</Text>
              <Text className="text-gray-800 font-medium">1.0.0</Text>
            </View>
            <View className="flex-row justify-between py-3">
              <Text className="text-gray-600">Account Status</Text>
              <Text className="text-green-600 font-medium">Active</Text>
            </View>
          </View>

          {/* Danger Zone */}
          <View className="bg-white rounded-xl p-5 shadow-sm">
            <Text className="text-sm font-semibold text-gray-500 uppercase mb-3">
              Account
            </Text>
            <TouchableOpacity
              className="flex-row items-center py-3"
              onPress={() => setShowLogoutModal(true)}
            >
              <Ionicons name="log-out-outline" size={20} color="#ef4444" />
              <Text className="text-red-500 font-medium ml-3">Log Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <View className="items-center mb-4">
              <View className="w-14 h-14 rounded-full bg-red-100 items-center justify-center mb-3">
                <Ionicons name="warning" size={28} color="#ef4444" />
              </View>
              <Text className="text-lg font-bold text-gray-800 text-center">
                Are you sure?
              </Text>
            </View>
            <Text className="text-gray-600 text-center mb-6 leading-5">
              You will need the Admin's QR code or activation code to log back
              in. Make sure you have access before logging out.
            </Text>
            <TouchableOpacity
              className="bg-red-500 rounded-lg py-3.5 items-center mb-3"
              onPress={handleLogout}
            >
              <Text className="text-white font-semibold">Yes, Log Out</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-gray-100 rounded-lg py-3.5 items-center"
              onPress={() => setShowLogoutModal(false)}
            >
              <Text className="text-gray-700 font-semibold">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
