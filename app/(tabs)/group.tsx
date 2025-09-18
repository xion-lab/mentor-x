import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  Platform,
} from 'react-native';
import { useAbstraxionAccount } from '@burnt-labs/abstraxion-react-native';

// ---------- 数据模型 & 工具 ----------

type Post = { id: string; user: string; text: string; ts: number; school: string };
const DEFAULT_SCHOOL = 'ZJU';
const uid = () => Math.random().toString(36).slice(2);
const formatTime = (ts: number) => {
  const diff = Math.max(0, Date.now() - ts);
  const m = Math.floor(diff / 60000);
  if (m < 1) return '刚刚';
  if (m < 60) return `${m} 分钟前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} 小时前`;
  const d = Math.floor(h / 24);
  return `${d} 天前`;
};
const canPostText = (s: string) => { const n = s.trim().length; return n > 0 && n <= 500; };

const seedPosts: Record<string, Post[]> = {
  ZJU: [
    { id: uid(), user: '匿名学⽣-7Q', text: '6.824 作业硬核但收获很大，大家互相加油～', ts: Date.now() - 1000 * 60 * 45, school: 'ZJU' },
    { id: uid(), user: '匿名学⽣-MM', text: '校图书馆新开通了数据库访问，记得试试！', ts: Date.now() - 1000 * 60 * 120, school: 'ZJU' },
  ],
};

// ---------- 主界面（原生） ----------

const CirclesJoined: React.FC = () => {
  const [school] = useState<string>(DEFAULT_SCHOOL);
  const [posts, setPosts] = useState<Post[]>(() => seedPosts[school] ? [...seedPosts[school]] : []);
  const [text, setText] = useState('');
  const abstraxionAccount = useAbstraxionAccount();
  const { data: account } = abstraxionAccount || {};
  const nick = useMemo(() => {
    if (account?.bech32Address) {
      const a = account.bech32Address;
      const tail = a.slice(-6);
      return `夜行侠-${tail}`;
    }
    return `夜行侠-${Math.random().toString(36).slice(2,6)}`;
  }, [account?.bech32Address]);
  const [showWelcome, setShowWelcome] = useState(true);

  const canPost = canPostText(text);

  return (
    <SafeAreaView style={styles.root}>
      {/* 小标题栏 */}
      <View style={styles.header}>
        <Text style={styles.brand}>mentorX</Text>
      </View>

      {/* 小标题栏下面的圈子信息区域 */}
      <View style={styles.circleHeader}>
        <Text style={styles.circleTitle}>{school}</Text>
        <Text style={styles.circleSub}>匿名树洞 · 你的发言将以隐私身份 <Text style={styles.bold}>{nick}</Text> 展示</Text>
      </View>

      {/* Composer + 列表 */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.composer}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="聊聊课程、选课、社团、生活……保持友善与客观"
            style={styles.textarea}
            multiline
          />
          <View style={styles.composerBar}>
            <Text style={styles.counter}>{text.trim().length} / 500</Text>
            <TouchableOpacity
              style={[styles.primaryBtn, { opacity: canPost ? 1 : 0.6 }]}
              disabled={!canPost}
              onPress={() => {
                if (!canPost) return;
                const p: Post = { id: uid(), user: nick, text: text.trim(), ts: Date.now(), school };
                setPosts((prev: Post[]) => [p, ...prev]);
                setText('');
              }}
            >
              <Text style={styles.primaryBtnText}>发表</Text>
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.postCard}>
              <View style={styles.postHead}>
                <Text style={styles.postUser}>{item.user}</Text>
                <Text style={styles.postTime}>{formatTime(item.ts)}</Text>
              </View>
              <Text style={styles.postText}>{item.text}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>圈子里还没有内容，来发第一条吧～</Text>}
        />
      </KeyboardAvoidingView>

      {/* 欢迎浮层 */}
      <Modal transparent visible={showWelcome} animationType="fade" onRequestClose={() => setShowWelcome(false)}>
        <View style={styles.overlayBackdrop}>
          <View style={styles.overlayCard}>
            <View style={styles.checkIcon}><Text style={styles.checkIconText}>✓</Text></View>
            <Text style={styles.overlayTitle}>已加入 {school} 圈子</Text>
            <Text style={styles.overlaySub}>你的匿名身份 <Text style={styles.bold}>{nick}</Text> 已就绪</Text>
            <View style={{ marginTop: 10 }}>
              <Text style={styles.overlayList}>• 友善交流，尊重事实</Text>
              <Text style={styles.overlayList}>• 客观理性，拒绝人身攻击</Text>
              <Text style={styles.overlayList}>• 不泄露任何可识别个人信息</Text>
            </View>
            <TouchableOpacity style={[styles.primaryBtn, { marginTop: 12 }]} onPress={() => setShowWelcome(false)}>
              <Text style={styles.primaryBtnText}>开始发帖</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default CirclesJoined;

// ---------- 样式（原生） ----------

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
  circleHeader: { paddingHorizontal: 16, paddingVertical: 10 },
  circleTitle: { fontSize: 20, fontWeight: '900', color: '#111827' },
  circleSub: { marginTop: 4, color: '#6B7280', fontSize: 12 },
  bold: { fontWeight: '800', color: '#111827' },

  composer: { marginTop: 8, marginBottom: 8, marginHorizontal: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F3F4F6', borderRadius: 16, padding: 12, shadowColor:'#000', shadowOpacity:0.05, shadowOffset:{width:0,height:2}, shadowRadius:8, elevation:1 },
  textarea: { minHeight: 96, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, textAlignVertical: 'top', backgroundColor: '#FFFFFF' },
  composerBar: { marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  counter: { color: '#9CA3AF', fontSize: 12 },
  primaryBtn: { backgroundColor: '#0A84FF', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: '#FFFFFF', fontWeight: '800' },

  postCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F3F4F6', borderRadius: 16, padding: 12, marginVertical: 6, shadowColor:'#000', shadowOpacity:0.05, shadowOffset:{width:0,height:2}, shadowRadius:8, elevation:1 },
  postHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  postUser: { fontWeight: '700', color: '#111827', fontSize: 13 },
  postTime: { color: '#9CA3AF', fontSize: 12 },
  postText: { marginTop: 8, color: '#111827', lineHeight: 20 },
  empty: { textAlign: 'center', color: '#6B7280', marginTop: 24, fontSize: 13 },

  overlayBackdrop: { flex:1, backgroundColor: 'rgba(17,24,39,0.35)', alignItems:'center', justifyContent:'center' },
  overlayCard: { width: '90%', maxWidth: 520, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#F3F4F6' },
  checkIcon: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: '#10B981', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 12 },
  checkIconText: { color: '#10B981', fontWeight: '800', fontSize: 20 },
  overlayTitle: { textAlign: 'center', fontSize: 18, fontWeight: '900', color: '#111827' },
  overlaySub: { textAlign: 'center', color: '#6B7280', fontSize: 12, marginTop: 4 },
  overlayList: { color: '#374151', fontSize: 12, lineHeight: 20 },
});
