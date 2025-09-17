import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Platform, Modal } from 'react-native';
import { useRouter } from 'expo-router';

const ShimmerText: React.FC<{ text: string; style?: any }> = ({ text, style }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, [opacity]);

  return (
    <Animated.Text style={[styles.hero, style, { opacity }]}>
      {text}
    </Animated.Text>
  );
};

export default function Welcome() {
  const router = useRouter();
  const [showInfo, setShowInfo] = useState(false);
  const TOOLTIP_TEXT = "我们发挥XION链抽象技术前所未有的优势，为你分配一个完全随机的隐私身份。在mentorX，任何人都是夜行侠，现实中没有人会知道这个隐私身份是谁，以保护你的隐私与表达自由";
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.brand}>mentorX</Text>
      </View>

      <View style={styles.center}>
        {/* 字体擦亮动效标题（与 web 的 mx-shimmer 一致的视觉语感）*/}
        <ShimmerText text="mentorX" />
        <Text style={styles.subtitle}>匿名、客观、永久储存的导师评价网</Text>

        {/* 小问号（点击出现说明文案）*/}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="隐私身份说明"
          onPress={() => setShowInfo(true)}
          style={styles.infoDot}
        >
          <Text style={styles.infoDotText}>?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => {
            router.push('/home');
          }}
        >
          <Text style={styles.primaryBtnText}>匿名进入</Text>
        </TouchableOpacity>

        <Text style={styles.tip}>Powered by XION</Text>
        {Platform.OS === 'android' ? (
          <Text style={styles.hint}>提示：如未看到动效，请确保已安装 expo-linear-gradient 与 @react-native-masked-view/masked-view</Text>
        ) : null}
      </View>

      {/* 信息弹窗 */}
      <Modal transparent visible={showInfo} animationType="fade" onRequestClose={() => setShowInfo(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>隐私身份说明</Text>
            <Text style={styles.modalText}>{TOOLTIP_TEXT}</Text>
            <TouchableOpacity style={[styles.primaryBtn, { alignSelf: 'center', marginTop: 12 }]} onPress={() => setShowInfo(false)}>
              <Text style={styles.primaryBtnText}>我知道了</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  shimmerWrapper: {
    position: "relative",
    overflow: "hidden",
  },
  text: {
    fontSize: 16,
    color: "#555",
    fontWeight: "500",
  },
  shimmerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.6)",
    width: 80,
    borderRadius: 20,
  },

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
  hint: { marginTop: 8, color: '#9CA3AF', fontSize: 11 },
  infoDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0A84FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  infoDotText: { color: '#0A84FF', fontWeight: '800' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(17,24,39,0.35)', alignItems: 'center', justifyContent: 'center' },
  modalCard: { width: '86%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#F3F4F6' },
  modalTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  modalText: { marginTop: 8, color: '#374151', fontSize: 13, lineHeight: 20 },
});
