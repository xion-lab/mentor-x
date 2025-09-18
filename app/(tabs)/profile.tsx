import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Clipboard,
} from 'react-native';
import { useAbstraxionAccount } from '@burnt-labs/abstraxion-react-native';
import { useRouter } from 'expo-router';

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
}) => {
  const [revealed, setRevealed] = useState(false);

  // Abstraxion account hooks
  const abstraxionAccount = useAbstraxionAccount();
  const { data: account, login, logout, isConnected, isConnecting } = abstraxionAccount || {};

  // Effective address and nickname based on connection state
  const effectiveAddress = account?.bech32Address || address;
  const effectiveName = useMemo(() => {
    if (account?.bech32Address) {
      const a = account.bech32Address;
      const tail = a.slice(-6);
      return `夜行侠-${tail}`;
    }
    return displayName;
  }, [account?.bech32Address, displayName]);

  const router = useRouter();

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
              <Text style={styles.title}>{effectiveName}</Text>
              <Text style={styles.subtle}>匿名、客观、可留存 · on XION</Text>
            </View>
          </View>
        </View>

        {/* 地址（来自已连接钱包，否则显示占位）*/}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>XION 区块链地址</Text>
          <View style={styles.addressRow}>
            <Text style={[styles.mono, { flexShrink: 1 }]} numberOfLines={1}>
              {shorten(effectiveAddress)}
            </Text>
            <TouchableOpacity
              style={styles.copyBtn}
              onPress={async () => {
                try {
                  await Clipboard.setString(effectiveAddress);
                  Alert.alert('已复制', '地址已复制到剪贴板');
                } catch (e) {
                  Alert.alert('失败', '复制失败，请重试');
                }
              }}
            >
              <Text style={styles.copyBtnText}>复制</Text>
            </TouchableOpacity>
          </View>
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

        {/* 连接/登出 与 导航 */}
        <View style={{ flexDirection: 'row', marginTop: 8 }}>
          {/* 左：返回主页 */}
          <TouchableOpacity style={[styles.outlineBtn, { flex: 1, marginRight: 8 }]} onPress={() => router.replace('/(tabs)/home')}>
            <Text style={styles.outlineBtnText}>返回主页</Text>
          </TouchableOpacity>
          {/* 右：根据连接状态显示 Connect 或 Logout */}
          {!isConnected ? (
            <TouchableOpacity
              style={[styles.primaryBtn, { flex: 1, opacity: isConnecting ? 0.6 : 1 }]}
              onPress={login}
              disabled={!!isConnecting}
            >
              <Text style={styles.primaryBtnText}>{isConnecting ? '连接中…' : '连接钱包'}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.outlineBtn, { flex: 1, borderColor: '#EF4444' }]}
              onPress={() => {
                logout();
                router.replace('/(auth)/welcome');
              }}
            >
              <Text style={[styles.outlineBtnText, { color: '#EF4444' }]}>退出登录</Text>
            </TouchableOpacity>
          )}
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
  addressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  copyBtn: { marginLeft: 12, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingVertical: 4, paddingHorizontal: 10 },
  copyBtnText: { color: '#111827', fontWeight: '700', fontSize: 12 },
});

export default ProfileNative;
