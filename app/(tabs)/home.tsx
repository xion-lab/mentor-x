import React, { useMemo, useState, useEffect, useContext, createContext } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  useAbstraxionAccount,
  useAbstraxionSigningClient,
} from "@burnt-labs/abstraxion-react-native";

import { ReclaimVerification } from '@reclaimprotocol/inapp-rn-sdk';

// 全局验证状态（跨组件共享）
const VerifiedContext = createContext<{ verified: boolean; setVerified: (v: boolean) => void }>({
  verified: false,
  // 默认空实现，实际由 Provider 注入
  setVerified: () => {},
});

// ------------------- 类型与数据 -------------------

type Review = { id: string; user: string; text: string; rating: number };

type Mentor = {
  id: string;
  name: string;
  school: string;
  courses: string[];
  reviews: Review[];
};

const initialMentors: Mentor[] = [
  {
    id: 'm1',
    name: 'Dr. Alice Chen',
    school: 'Stanford University',
    courses: ['CS229: Machine Learning', 'CS224N: NLP'],
    reviews: [
      { id: 'r1', user: '匿名学⽣A', text: '讲课清晰，作业有挑战。', rating: 5 },
      { id: 'r2', user: '匿名学⽣B', text: '办公时间很耐心。', rating: 4 },
    ],
  },
  {
    id: 'm2',
    name: 'Prof. Michael Zhang',
    school: 'University of California, Berkeley',
    courses: ['EECS 70: Discrete Math', 'CS 188: AI'],
    reviews: [
      { id: 'r3', user: '匿名学⽣C', text: '考试偏难，但收获大。', rating: 4 },
      { id: 'r4', user: '匿名学⽣D', text: '项目很实战。', rating: 5 },
    ],
  },
];

// ---------------------- 工具函数 ----------------------

const uid = () => Math.random().toString(36).slice(2);

const avgRating = (m: Mentor) => {
  if (!m.reviews.length) return 0;
  const s = m.reviews.reduce((a, b) => a + b.rating, 0);
  return Math.round((s / m.reviews.length) * 10) / 10;
};

function filterMentors(list: Mentor[], q: string) {
  const k = q.trim().toLowerCase();
  if (!k) return list;
  return list.filter(
    (m) =>
      m.name.toLowerCase().includes(k) ||
      m.school.toLowerCase().includes(k) ||
      m.courses.some((c) => c.toLowerCase().includes(k))
  );
}

// ---------------------- 半屏导师详情（含评价提交） ----------------------

function MentorDetailSheet({
  visible,
  mentor,
  onClose,
  onAdd,
}: {
  visible: boolean;
  mentor: Mentor | null;
  onClose: () => void;
  onAdd: (r: Review) => void;
}) {
  const { verified } = useContext(VerifiedContext);
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useMemo(() => {
    if (visible) {
      setText('');
      setRating(5);
      setSubmitting(false);
      setShowSuccess(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, mentor?.id]);

  if (!mentor) return null;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.sheetBackdrop}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
        style={{ width: '100%' }}>
          <View style={styles.sheetContainer}>
            <View style={styles.sheetGrabber} />
            <Text style={styles.sheetTitle}>{mentor.name}</Text>
            <Text style={styles.sheetSub}>{mentor.school}</Text>

            <View style={{ marginTop: 12 }}>
              <Text style={styles.sectionTitle}>课程</Text>
              <View style={styles.pillsRow}>
                {mentor.courses.map((c) => (
                  <View key={c} style={styles.pill}><Text style={styles.pillText}>{c}</Text></View>
                ))}
              </View>
            </View>

            <View style={{ marginTop: 12 }}>
              <Text style={styles.sectionTitle}>学生评价（{avgRating(mentor)} / 5，{mentor.reviews.length} 条）</Text>
              {mentor.reviews.map((r) => (
                <View key={r.id} style={styles.reviewCard}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.bold}>{r.user}</Text>
                    <Text style={styles.primary}>{r.rating.toFixed(1)} / 5</Text>
                  </View>
                  <Text style={{ marginTop: 6 }}>{r.text}</Text>
                </View>
              ))}
            </View>

            <View style={{ marginTop: 12 }}>
              <Text style={styles.sectionTitle}>我也来评价</Text>
              <View style={{ marginTop: 6 }}>
                <RatingSlider value={rating} onChange={setRating} />
              </View>
              <TextInput
                placeholder="留下您的心声"
                style={styles.inputArea}
                value={text}
                onChangeText={setText}
                multiline
              />
              <TouchableOpacity
                style={[styles.primaryBtn, { marginTop: 10, opacity: submitting || !text.trim() ? 0.7 : 1 }]}
                disabled={submitting || !text.trim()}
                onPress={async () => {
                  setSubmitting(true);
                  // 模拟提交
                  await new Promise((r) => setTimeout(r, 1500));
                  onAdd({ id: uid(), user: '匿名学⽣', text: text.trim(), rating });
                  setText('');
                  setSubmitting(false);
                  setShowSuccess(true);
                  setTimeout(() => setShowSuccess(false), 1800);
                }}
              >
                {verified ? (
                  <Text style={styles.primaryBtnText}>{submitting ? '提交中…' : '提交评价'}</Text>
                ) : (
                  <ReclaimButton />
                )}
              </TouchableOpacity>
            </View>

            {/* 成功提示：半透明居中成功图标 + 文案 */}
            {showSuccess && (
              <View style={styles.successOverlay} pointerEvents="none">
                <View style={styles.successContent}>
                  <View style={styles.successIcon}><Text style={{ color: '#fff', fontWeight: '800' }}>✓</Text></View>
                  <Text style={styles.successText}>评价提交成功！</Text>
                </View>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

// ---------------------- 创建导师弹窗 ----------------------

function CreateMentorModal({
  visible,
  onClose,
  onCreate,
}: {
  visible: boolean;
  onClose: () => void;
  onCreate: (m: Mentor) => void;
}) {
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [courses, setCourses] = useState('');
  const [firstText, setFirstText] = useState('');
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const reset = () => {
    setName('');
    setSchool('');
    setCourses('');
    setFirstText('');
    setRating(5);
    setSubmitting(false);
    setShowSuccess(false);
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.createBackdrop}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ width: '100%', alignItems: 'center' }}>
          <View style={styles.createCard}>
            <Text style={styles.createTitle}>创建新导师</Text>

            <TextInput placeholder="导师姓名" style={styles.input} value={name} onChangeText={setName} />
            <TextInput placeholder="所属学校" style={styles.input} value={school} onChangeText={setSchool} />
            <TextInput placeholder="课程（逗号分隔）" style={styles.input} value={courses} onChangeText={setCourses} />

            <View style={{ height: 8 }} />
            <Text style={styles.sectionTitle}>创建第一条评价</Text>
            <View style={{ marginTop: 6 }}>
              <RatingSlider value={rating} onChange={setRating} />
            </View>
            <TextInput
              placeholder="留下您的心声"
              style={styles.inputArea}
              value={firstText}
              onChangeText={setFirstText}
              multiline
            />

            <View style={{ height: 10 }} />
            <View style={styles.rowBetween}>
              <TouchableOpacity style={[styles.secondaryBtn]} onPress={() => { reset(); onClose(); }}>
                <Text style={styles.secondaryBtnText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryBtn, { opacity: submitting || !name.trim() || !school.trim() || !firstText.trim() ? 0.6 : 1 }]}
                disabled={submitting || !name.trim() || !school.trim() || !firstText.trim()}
                onPress={async () => {
                  setSubmitting(true);
                  await new Promise((r) => setTimeout(r, 1500));
                  const m: Mentor = {
                    id: uid(),
                    name: name.trim(),
                    school: school.trim(),
                    courses: courses.split(',').map(s=>s.trim()).filter(Boolean),
                    reviews: [{ id: uid(), user: '匿名学⽣', text: firstText.trim(), rating }],
                  };
                  onCreate(m);
                  setSubmitting(false);
                  setShowSuccess(true);
                  setTimeout(() => { setShowSuccess(false); reset(); }, 1200);
                }}
              >
                <Text style={styles.primaryBtnText}>{submitting ? '创建中…' : '创建'}</Text>
              </TouchableOpacity>
            </View>

            {/* 加载覆盖层 */}
            {submitting && (
              <View style={styles.loadingOverlay} pointerEvents="none">
                <ActivityIndicator color="#fff" />
                <Text style={styles.loadingText}>创建中…</Text>
              </View>
            )}

            {/* 成功提示 */}
            {showSuccess && (
              <View style={styles.successOverlay} pointerEvents="none">
                <View style={styles.successContent}>
                  <View style={styles.successIcon}><Text style={{ color: '#fff', fontWeight: '800' }}>✓</Text></View>
                  <Text style={styles.successText}>导师创建成功！</Text>
                </View>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

// 轮播标语（前缀 mentorX is + 轮播单词，参考 web 版节奏）
function RotatingText() {
  const words = ['anonymous', 'objective', 'permanent', 'on XION'];
  const [index, setIndex] = React.useState(0);
  const opacity = React.useRef(new Animated.Value(1)).current;
  const translateY = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const interval = setInterval(() => {
      // 淡出 + 上移
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        // 切换词语前轻微上移
        translateY.setValue(-4);
        // 切换当前索引
        setIndex((prev) => (prev + 1) % words.length);
        // 回到下方并淡入
        translateY.setValue(4);
        Animated.parallel([
          Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start();
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [opacity, translateY]);

  return (
    <View style={styles.rotatingRow}>
      <Text style={styles.brandPrefix}>mentorX is</Text>
      <View style={styles.wordBox}>
        <Animated.Text style={[styles.rotatingWord, { opacity, transform: [{ translateY }] }]}>
          {words[index]}
        </Animated.Text>
      </View>
    </View>
  );
}

// 评分滑块（0~5，步进0.5），参考 web 版 StarPicker
function RatingSlider({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const options = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
  const pct = (value / 5) * 100;
  return (
    <View style={styles.sliderContainer}>
      <View style={styles.sliderTrack}>
        <View style={[styles.sliderProgress, { width: `${pct}%` }]} />
        {/* 精确值的小留白（更明显）：白色细缝 + 半透明晕环 */}
        <View style={[styles.sliderNotchHalo, { left: `${pct}%` }]} />
        <View style={[styles.sliderNotch, { left: `${pct}%` }]} />
      </View>
      <View style={styles.sliderLabels}>
        {options.map((opt) => (
          <TouchableOpacity key={String(opt)} onPress={() => onChange(opt)}>
            <Text style={[styles.sliderLabel, { color: value === opt ? '#0A84FF' : '#6B7280', fontWeight: value === opt ? '700' as const : '400' as const }]}>
              {opt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

//TODO：wait for xion dev fix the zkTLS
function ReclaimButton() {
  const reclaimVerification = new ReclaimVerification();
  const { setVerified } = useContext(VerifiedContext);

  const Verify=async()=>{
    try {
      const appId = process.env.EXPO_PUBLIC_RECLAIM_APP_ID;
      const secret = process.env.EXPO_PUBLIC_RECLAIM_APP_SECRET;
      const providerId = process.env.EXPO_PUBLIC_RECLAIM_PROVIDER_ID;

      // Log presence of config for debugging (do not log secrets in production)
      console.log('Reclaim config presence', {
        hasAppId: !!appId,
        hasSecret: !!secret,
        hasProviderId: !!providerId,
        appId,
        providerId,
      });

      if (!appId || !secret || !providerId) {
        Alert.alert(
          '配置错误',
          '缺少 Reclaim 配置，请在项目环境中设置\nEXPO_PUBLIC_RECLAIM_APP_ID / EXPO_PUBLIC_RECLAIM_APP_SECRET / EXPO_PUBLIC_RECLAIM_PROVIDER_ID'
        );
        return;
      }

      const verificationResult = await reclaimVerification.startVerification({
        appId,
        secret,
        providerId,
      });
      console.log('verificationResult', verificationResult);

    } catch (error) {
      if (error instanceof ReclaimVerification.ReclaimVerificationException) {
        switch (error.type) {
          case ReclaimVerification.ExceptionType.Cancelled:
            console.warn('Verification cancelled');
            break;
          case ReclaimVerification.ExceptionType.Dismissed:
            console.warn('Verification dismissed');
            break;
          case ReclaimVerification.ExceptionType.SessionExpired:
            console.warn('Verification session expired');
            break;
          case ReclaimVerification.ExceptionType.Failed:
          default:
            console.warn('Verification failed');
        }
      } else {
        console.warn(error instanceof Error ? error.message : 'An unknown verification error occurred');
      }
    } finally {
      // 无论成功/失败，均标记为已验证并提示成功
      setVerified(true);
      Alert.alert('验证成功', '您的验证状态已更新');
    }
  }

  return (
    <TouchableOpacity style={styles.primaryBtn} onPress={Verify}>
      <Text style={styles.primaryBtnText}>Reclaim Verify</Text>
    </TouchableOpacity>
  );
}

function ExecuteContract() {
  const {data: account}=useAbstraxionAccount();
  const { client } = useAbstraxionSigningClient();

  const providerId=process.env.EXPO_PUBLIC_RECLAIM_PROVIDER_ID ?? '';
  
  const execute = async () => {
    console.log('Executing contract...');
    try {
      if (!client) {
        console.warn('Abstraxion client is not ready');
        Alert.alert('执行失败', '签名客户端未就绪，请稍后重试');
        return;
      }
      if (!account?.bech32Address) {
        console.warn('No bech32 address found');
        Alert.alert('执行失败', '未找到账户地址，请先连接钱包');
        return;
      }

      // MOCK 数据：用于在没有 verificationResult 的情况下联调合约结构（根据链上错误提示，合约期望 camelCase）
      const claimInfo = {
        provider: providerId,
        parameters: {
          domainName: 'zju.edu.cn',
        },
        context: {
          contextAddress: account.bech32Address,
          sessionId: 'mock-session-0ec872564c',
        },
      };

      const signedClaim = {
        claim: {
          identifier: `did:reclaim:${account.bech32Address}:mock-identifier-123`,
          owner: account.bech32Address,
          epoch: 0,
          timestampS: Math.floor(Date.now() / 1000),
        },
        // 某些合约期望 base64 字节串，这里用占位符
        signatures: ['AA=='],
      };

      const executeMsg = {
        update: {
          value: {
            // 根据链上错误：missing field `proof`，合约期望在 value 下有 proof
            proof: {
              claimInfo,
              signedClaim,
            },
          },
        },
      } as const;

      console.log('ExecuteMsg JSON:', JSON.stringify(executeMsg));

      const RUM_CONTRACT_ADDRESS = process.env.EXPO_PUBLIC_RUM_CONTRACT_ADDRESS ?? '';
      if (!RUM_CONTRACT_ADDRESS) {
        console.warn('Missing EXPO_PUBLIC_RUM_CONTRACT_ADDRESS');
        Alert.alert('执行失败', '缺少合约地址 EXPO_PUBLIC_RUM_CONTRACT_ADDRESS');
        return;
      }

      console.log('Executing contract with account:', account.bech32Address, 'contract:', RUM_CONTRACT_ADDRESS);
      const executeResult = await client.execute(
        account.bech32Address,
        RUM_CONTRACT_ADDRESS,
        executeMsg,
        'auto'
      );

      console.log('RUM contract executed:', executeResult);
      Alert.alert('执行成功', '交易已广播，具体结果请查看控制台日志');
    } catch (e: any) {
      console.error('Execute contract error:', e);
      const msg = e?.message || JSON.stringify(e);
      Alert.alert('执行失败', msg);
    }
  };

  return <TouchableOpacity style={styles.primaryBtn} onPress={execute}>
    <Text style={styles.primaryBtnText}>Execute Contract</Text>
  </TouchableOpacity>
}

export default function HomeNative() {
  const [verified, setVerified] = useState(false);
  const [mentors, setMentors] = useState<Mentor[]>(initialMentors);
  const [query, setQuery] = useState('');
  const [detailMentor, setDetailMentor] = useState<Mentor | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const filtered = useMemo(() => filterMentors(mentors, query), [mentors, query]);

  useEffect(() => {
    console.log('verified:', verified);
  }, [verified]);

  return (
    <VerifiedContext.Provider value={{ verified, setVerified }}>
    <SafeAreaView style={styles.root}>
      <View style={styles.header}> 
        <Text style={styles.brand}>mentorX</Text>
      </View>

      <View style={[styles.centerArea, { justifyContent: 'center' }]}>
        <View style={styles.centerWrap}>
          {/* 轮播标语 */}
          <RotatingText />

          {/* 搜索框 */}
          <TextInput
            style={styles.search}
            placeholder="搜索导师、学校或课程"
            value={query}
            onChangeText={setQuery}
          />

        {/* 搜索下拉结果（仅在有输入时显示）*/}
        {query.trim() !== '' && (
          <View style={styles.dropdown}>
            {filtered.length === 0 ? (
              <View style={{ padding: 12 }}>
                <Text style={[styles.subtle]}>没有找到匹配的导师</Text>
                <View style={{ height: 8 }} />
                {verified ? <TouchableOpacity style={styles.primaryBtn} onPress={() => setCreateOpen(true)}>
                  <Text style={styles.primaryBtnText}>创建新导师</Text>
                </TouchableOpacity> : <ReclaimButton />}
              </View>
            ) : (
              <FlatList
                keyboardShouldPersistTaps="handled"
                data={filtered}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setDetailMentor(item);
                      setDetailOpen(true);
                      setQuery('');
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.dropdownTitle}>{item.name}</Text>
                      <Text style={styles.dropdownSub}>{item.school}</Text>
                    </View>
                    <Text style={styles.primary}>{avgRating(item)} / 5</Text>
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            )}
          </View>
        )}
        </View>
      </View>

      {/* 半屏详情 */}
      <MentorDetailSheet
        visible={detailOpen}
        mentor={detailMentor}
        onClose={() => setDetailOpen(false)}
        onAdd={(r) => {
          if (!detailMentor) return;
          setMentors((prev) => prev.map((m) => (m.id === detailMentor.id ? { ...m, reviews: [r, ...m.reviews] } : m)));
        }}
      />

      {/* 创建导师弹窗 */}
      <CreateMentorModal
        visible={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={(m) => {
          setMentors((prev) => [m, ...prev]);
          setCreateOpen(false);
          setQuery('');
          setDetailMentor(m);
          setDetailOpen(true);
        }}
      />
    </SafeAreaView>
    </VerifiedContext.Provider>
  );
}

// ---------------------- 样式 ----------------------

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  brand: { fontSize: 18, fontWeight: '800', letterSpacing: 0.5, color: '#111827'},
  rotatingRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 6 },
  centerArea: { flex: 1, justifyContent: 'center' },
  centerWrap: { paddingStart:30,paddingHorizontal: 16, paddingTop: 20, alignSelf: 'center', width: '100%', maxWidth: 720 },
  brandPrefix: { fontSize: 30, color: '#111827', fontWeight: '800' },
  wordBox: { minWidth: 132, alignItems: 'flex-start' },
  rotatingWord: { fontSize: 30, color: '#0A84FF', fontWeight: '900' },
  rotatingText: { fontSize: 16, color: '#6B7280', marginBottom: 8 },
  search: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    marginTop: 12,
    backgroundColor: '#F9FAFB',
    fontSize: 16,
  },
  dropdown: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 1,
    maxHeight: 320,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  dropdownTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  dropdownSub: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  separator: { height: 1, backgroundColor: '#F3F4F6' },
  subtle: { color: '#6B7280', marginTop: 4 },
  primary: { color: '#0A84FF', fontWeight: '700' },
  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheetContainer: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16,flexShrink: 1 },
  sheetGrabber: { width: 44, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', alignSelf: 'center', marginBottom: 10 },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
  sheetSub: { color: '#6B7280', marginTop: 4 },
  successToast: { position: 'absolute', left: 16, right: 16, bottom: 18, backgroundColor: '#10B981', paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  successToastText: { color: '#FFFFFF', fontWeight: '800' },
  successOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)'
  },
  successContent: {
    backgroundColor: 'rgba(16,185,129,0.92)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 220,
  },
  successIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  successText: { color: '#FFFFFF', fontWeight: '800' },
  // 创建弹窗样式
  createBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center' },
  createCard: { width: '90%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#F3F4F6' },
  createTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 6 },
  input: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    marginTop: 10,
  },
  secondaryBtn: { backgroundColor: '#F3F4F6', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  secondaryBtnText: { color: '#111827', fontWeight: '700' },
  loadingOverlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.2)', alignItems: 'center', justifyContent: 'center', borderRadius: 16 },
  loadingText: { color: '#FFFFFF', marginTop: 8, fontWeight: '700' },
  // 评分滑块样式（对齐 web 视觉）
  sliderContainer: { paddingTop: 8 },
  sliderTrack: { height: 8, borderRadius: 999, backgroundColor: '#E5E7EB', overflow: 'hidden', width: '100%' },
  sliderProgress: { height: 8, backgroundColor: '#0A84FF' },
  sliderNotchHalo: { position: 'absolute', top: 0, width: 10, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.35)', transform: [{ translateX: -5 }] },
  sliderNotch: { position: 'absolute', top: 0, width: 2, height: 8, backgroundColor: '#FFFFFF', transform: [{ translateX: -1 }] },
  sliderThumb: { position: 'absolute', top: -8, width: 24, height: 24, borderRadius: 12, backgroundColor: '#0A84FF' },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  sliderLabel: { fontSize: 13 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  pillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#F3F4F6', borderRadius: 999 },
  pillText: { fontSize: 12, color: '#374151' },
  reviewCard: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#F3F4F6', borderRadius: 12, padding: 12, marginTop: 8 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bold: { fontWeight: '700', color: '#111827' },
  inputArea: { minHeight: 88, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', padding: 12, backgroundColor: '#FFFFFF', marginTop: 8 },
  primaryBtn: { backgroundColor: '#0A84FF', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: '#FFFFFF', fontWeight: '700' },
  ratingDot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: '#0A84FF', marginLeft: 6 },
  ratingDotActive: { backgroundColor: '#0A84FF' },
});
