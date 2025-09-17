import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

// ---------------------- Props ----------------------

type ProfileProps = {
  address?: string;
  caoPoints?: number;
  displayName?: string;
  onNavigateHome?: () => void;
};

const shorten = (s?: string, head = 10, tail = 8) => !s ? '' : (s.length <= head + tail + 3 ? s : `${s.slice(0, head)}...${s.slice(-tail)}`);

const ProfileNative: React.FC<ProfileProps> = ({
  address = 'xion1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  caoPoints = 0,
  displayName = '夜行侠',
  onNavigateHome,
}) => {
  const [revealed, setRevealed] = useState(false);

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.brand}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        {/* 简易头像与昵称 */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={styles.avatar}>
              <Text style={{ color: '#FFF', fontWeight: '800' }}>夜</Text>
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.title}>{displayName}</Text>
              <Text style={styles.subtle}>匿名、客观、可留存 · on XION</Text>
            </View>
          </View>
        </View>

        {/* 地址 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>XION 区块链地址</Text>
          <Text style={styles.mono}>{shorten(address)}</Text>
        </View>

        {/* CAO Points */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>CAO 积分余额</Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
            <Text style={styles.points}>{caoPoints}</Text>
            <Text style={[styles.subtle, { marginLeft: 8 }]}>points</Text>
          </View>
        </View>

        {/* 私钥提示（原生端默认不显示明文，仅示例逻辑）*/}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>账户安全</Text>
          <Text style={styles.subtle}>为避免误触，原生端暂未提供明文私钥显示/导出。</Text>
          <TouchableOpacity style={[styles.primaryBtn, { marginTop: 12 }]} onPress={() => setRevealed(!revealed)}>
            <Text style={styles.primaryBtnText}>{revealed ? '隐藏提示' : '显示提示'}</Text>
          </TouchableOpacity>
          {revealed && (
            <Text style={[styles.subtle, { marginTop: 8 }]}>请在 Web 端使用“备份账户（导出私钥）”。</Text>
          )}
        </View>

        {/* 底部按钮（示例）*/}
        <View style={{ flexDirection: 'row', marginTop: 8 }}>
          <TouchableOpacity style={[styles.outlineBtn, { flex: 1, marginRight: 8 }]} disabled={!onNavigateHome} onPress={onNavigateHome}>
            <Text style={styles.outlineBtnText}>返回主页</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.outlineBtn, { flex: 1, opacity: 0.5 }]} disabled>
            <Text style={styles.outlineBtnText}>圈子（稍后）</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

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
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
    shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 1,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#0A84FF', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: '700', color: '#111827' },
  subtle: { color: '#6B7280' },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 6 },
  mono: { fontFamily: 'Courier', color: '#111827', marginTop: 4 },
  points: { fontSize: 28, fontWeight: '800', color: '#0A84FF' },
  primaryBtn: { backgroundColor: '#0A84FF', borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  primaryBtnText: { color: '#FFFFFF', fontWeight: '700' },
  outlineBtn: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  outlineBtnText: { color: '#111827', fontWeight: '700' },
});

export default ProfileNative;
