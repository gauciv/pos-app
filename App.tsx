import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import "./global.css";

export default function App() {
  return (
    <View style={styles.container}>
      <Text className="text-2xl font-bold text-blue-600">POS App</Text>
      <Text className="text-lg mt-4">React Native with Expo SDK 54, Firebase & shadcn</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
