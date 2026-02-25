import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/lib/auth';

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  async function handleRegister() {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await signUp(email.trim(), password, fullName.trim());
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <View className="flex-1 bg-white justify-center items-center px-4">
        <View style={isTablet ? { maxWidth: 400, width: '100%' } : { width: '100%', paddingHorizontal: 16 }}>
          <View className="items-center mb-6">
            <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-4">
              <Text className="text-3xl">✉️</Text>
            </View>
            <Text className="text-xl font-bold text-gray-800 mb-2">Check your email</Text>
            <Text className="text-sm text-gray-500 text-center">
              We sent a confirmation link to{' '}
              <Text className="font-medium text-gray-700">{email}</Text>.
              {'\n'}Click the link to activate your account.
            </Text>
          </View>

          <TouchableOpacity
            className="rounded-lg py-4 items-center bg-blue-500"
            onPress={() => router.replace('/login')}
          >
            <Text className="text-white font-semibold text-base">Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 justify-center items-center px-4">
          <View style={isTablet ? { maxWidth: 400, width: '100%' } : { width: '100%', paddingHorizontal: 16 }}>
            <Text className="text-3xl font-bold text-blue-600 text-center mb-2">POS App</Text>
            <Text className="text-base text-gray-500 text-center mb-8">
              Create your collector account
            </Text>

            {error ? (
              <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <Text className="text-red-600 text-sm text-center">{error}</Text>
              </View>
            ) : null}

            <Text className="text-sm font-medium text-gray-700 mb-1">Full Name</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your full name"
              autoCapitalize="words"
            />

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
            <View className="mb-4">
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

            <Text className="text-sm font-medium text-gray-700 mb-1">Confirm Password</Text>
            <View className="mb-6">
              <View className="flex-row items-center border border-gray-300 rounded-lg">
                <TextInput
                  className="flex-1 px-4 py-3 text-base"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm your password"
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  className="px-3 py-3"
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#9ca3af"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              className={`rounded-lg py-4 items-center ${loading ? 'bg-blue-300' : 'bg-blue-500'}`}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text className="text-white font-semibold text-base">
                {loading ? 'Creating account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="mt-4 items-center mb-8"
              onPress={() => router.replace('/login')}
            >
              <Text className="text-blue-500 text-sm">
                Already have an account? Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
