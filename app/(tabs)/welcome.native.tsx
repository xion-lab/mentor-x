import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function Welcome() {
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.brand}>mentorX</Text>
      </View>

      <View style={styles.center}>
        <Text style={styles.hero}>mentorX</Text>
        <Text style={styles.subtitle}>匿名、客观、永久储存的导师评价网</Text>

        <TouchableOpacity style={styles.primaryBtn} onPress={() => { /* TODO: 导航到主页或其他 */ }}>
          <Text style={styles.primaryBtnText}>匿名进入</Text>
        </TouchableOpacity>

        <Text style={styles.tip}>Powered by XION</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  brand: { fontSize: 18, fontWeight: '800', color: '#111827' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  hero: { fontSize: 48, fontWeight: '900', color: '#111827', letterSpacing: 0.5 },
  subtitle: { marginTop: 8, fontSize: 14, color: '#6B7280' },
  primaryBtn: { marginTop: 24, backgroundColor: '#0A84FF', borderRadius: 24, paddingVertical: 12, paddingHorizontal: 24 },
  primaryBtnText: { color: '#FFFFFF', fontWeight: '800' },
  tip: { marginTop: 16, color: '#9CA3AF', fontSize: 12 },
});
