import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/lib/auth';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await signIn(email.trim(), password);
      router.replace('/(collector)/home');
    } catch (err: any) {
      setError(err.message || 'Login failed');
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
        <View style={isTablet ? { maxWidth: 400, width: '100%' } : { width: '100%', paddingHorizontal: 16 }}>
          <Text className="text-3xl font-bold text-blue-600 text-center mb-2">POS App</Text>
          <Text className="text-base text-gray-500 text-center mb-8">
            Field Sales & Order Management
          </Text>

          {error ? (
            <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <Text className="text-red-600 text-sm text-center">{error}</Text>
            </View>
          ) : null}

          <Text className="text-sm font-medium text-gray-700 mb-1">Email</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text className="text-sm font-medium text-gray-700 mb-1">Password</Text>
          <View className="mb-6">
            <View className="flex-row items-center border border-gray-300 rounded-lg">
              <TextInput
                className="flex-1 px-4 py-3 text-base"
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                className="px-3 py-3"
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#9ca3af"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            className={`rounded-lg py-4 items-center ${loading ? 'bg-blue-300' : 'bg-blue-500'}`}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text className="text-white font-semibold text-base">
              {loading ? 'Signing in...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="mt-4 items-center"
            onPress={() => router.replace('/register')}
          >
            <Text className="text-blue-500 text-sm">
              Don't have an account? Create Account
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
