import { Stack } from 'expo-router';
import { AuthProvider } from '@/lib/auth';
import { CartProvider } from '@/lib/cart';
import { NetworkGuard } from '@/components/NetworkGuard';
import '../global.css';

export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <NetworkGuard>
          <Stack screenOptions={{ headerShown: false }} />
        </NetworkGuard>
      </CartProvider>
    </AuthProvider>
  );
}
