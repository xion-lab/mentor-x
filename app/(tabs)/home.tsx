import React, { useMemo, useState } from 'react';
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
} from 'react-native';

// ---------------------- 类型与数据 ----------------------

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

// ---------------------- 详情弹窗 ----------------------

function MentorDetailModal({
  visible,
  mentor,
  onClose,
  onAddReview,
}: {
  visible: boolean;
  mentor: Mentor | null;
  onClose: () => void;
  onAddReview: (review: Review) => void;
}) {
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);

  if (!mentor) return null;

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <SafeAreaView style={styles.modalRoot}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{mentor.name}</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.link}>关闭</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subtle}>{mentor.school}</Text>

        <View style={{ height: 12 }} />
        <Text style={styles.sectionTitle}>课程</Text>
        <View style={styles.pillsRow}>
          {mentor.courses.map((c) => (
            <View key={c} style={styles.pill}>
              <Text style={styles.pillText}>{c}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 12 }} />
        <Text style={styles.sectionTitle}>学生评价（{avgRating(mentor)} / 5）</Text>
        {mentor.reviews.map((r) => (
          <View key={r.id} style={styles.reviewCard}>
            <View style={styles.rowBetween}>
              <Text style={styles.bold}>{r.user}</Text>
              <Text style={styles.primary}>{r.rating.toFixed(1)} / 5</Text>
            </View>
            <Text style={{ marginTop: 6 }}>{r.text}</Text>
          </View>
        ))}

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={{ height: 8 }} />
          <Text style={styles.sectionTitle}>我也来评价</Text>
          <View style={styles.rowBetween}>
            <Text style={{ color: '#6B7280' }}>评分</Text>
            <View style={styles.row}>
              {[1, 2, 3, 4, 5].map((n) => (
                <TouchableOpacity key={n} onPress={() => setRating(n)} style={[styles.ratingDot, rating >= n && styles.ratingDotActive]} />
              ))}
            </View>
          </View>
          <TextInput
            placeholder="留下您的心声"
            style={styles.inputArea}
            value={text}
            onChangeText={setText}
            multiline
          />
          <View style={{ height: 8 }} />
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => {
              if (!text.trim()) return;
              onAddReview({ id: uid(), user: '匿名学⽣', text: text.trim(), rating });
              setText('');
            }}
          >
            <Text style={styles.primaryBtnText}>提交评价</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </SafeAreaView>
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

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <SafeAreaView style={styles.modalRoot}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>创建导师</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.link}>取消</Text>
          </TouchableOpacity>
        </View>

        <TextInput placeholder="导师姓名" style={styles.input} value={name} onChangeText={setName} />
        <TextInput placeholder="所属学校" style={styles.input} value={school} onChangeText={setSchool} />
        <TextInput placeholder="课程（逗号分隔）" style={styles.input} value={courses} onChangeText={setCourses} />

        <View style={{ height: 12 }} />
        <Text style={styles.sectionTitle}>创建第一条评价</Text>
        <View style={styles.rowBetween}>
          <Text style={{ color: '#6B7280' }}>评分</Text>
          <View style={styles.row}>
            {[1, 2, 3, 4, 5].map((n) => (
              <TouchableOpacity key={n} onPress={() => setRating(n)} style={[styles.ratingDot, rating >= n && styles.ratingDotActive]} />
            ))}
          </View>
        </View>
        <TextInput
          placeholder="留下您的心声"
          style={styles.inputArea}
          value={firstText}
          onChangeText={setFirstText}
          multiline
        />

        <View style={{ height: 12 }} />
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => {
            if (!name.trim() || !school.trim() || !firstText.trim()) return;
            const m: Mentor = {
              id: uid(),
              name: name.trim(),
              school: school.trim(),
              courses: courses.split(',').map((s) => s.trim()).filter(Boolean),
              reviews: [{ id: uid(), user: '匿名学⽣', text: firstText.trim(), rating }],
            };
            onCreate(m);
            onClose();
            setName('');
            setSchool('');
            setCourses('');
            setFirstText('');
            setRating(5);
          }}
        >
          <Text style={styles.primaryBtnText}>Create</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );
}

// ---------------------- 主页面（原生） ----------------------

export default function HomeNative() {
  const [mentors, setMentors] = useState<Mentor[]>(initialMentors);
  const [query, setQuery] = useState('');
  const [detailMentor, setDetailMentor] = useState<Mentor | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = useMemo(() => filterMentors(mentors, query), [mentors, query]);

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}> 
        <Text style={styles.brand}>mentorX</Text>
      </View>

      <View style={{ paddingHorizontal: 16 }}>
        <TextInput
          style={styles.search}
          placeholder="搜索导师、学校或课程"
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {filtered.length === 0 && query.trim() !== '' ? (
        <View style={styles.emptyBox}>
          <Text style={styles.subtle}>没有找到匹配的导师</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => setCreateOpen(true)}>
            <Text style={styles.primaryBtnText}>Create New</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => {
                setDetailMentor(item);
                setDetailOpen(true);
              }}
            >
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.subtle}>{item.school}</Text>
              <View style={styles.rowBetween}>
                <Text style={styles.pillText}>课程 {item.courses.slice(0, 2).join(' · ')}</Text>
                <Text style={styles.primary}>{avgRating(item)} / 5</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      <MentorDetailModal
        visible={detailOpen}
        mentor={detailMentor}
        onClose={() => setDetailOpen(false)}
        onAddReview={(r) => {
          if (!detailMentor) return;
          setMentors((prev) => prev.map((m) => (m.id === detailMentor.id ? { ...m, reviews: [r, ...m.reviews] } : m)));
        }}
      />

      <CreateMentorModal
        visible={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={(m) => setMentors((prev) => [m, ...prev])}
      />
    </SafeAreaView>
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
  brand: { fontSize: 18, fontWeight: '800', letterSpacing: 0.5, color: '#111827' },
  search: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    marginTop: 12,
    backgroundColor: '#F9FAFB',
  },
  emptyBox: {
    padding: 16,
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 1,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  subtle: { color: '#6B7280', marginTop: 4 },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 999,
  },
  pillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pillText: { fontSize: 12, color: '#374151' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  reviewCard: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  bold: { fontWeight: '700', color: '#111827' },
  primary: { color: '#0A84FF', fontWeight: '700' },
  input: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    marginTop: 12,
  },
  inputArea: {
    minHeight: 88,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    backgroundColor: '#FFFFFF',
    marginTop: 12,
  },
  primaryBtn: {
    backgroundColor: '#0A84FF',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { color: '#FFFFFF', fontWeight: '700' },
  ratingDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#0A84FF',
    marginLeft: 6,
  },
  ratingDotActive: { backgroundColor: '#0A84FF' },
  modalRoot: { flex: 1, padding: 16, backgroundColor: '#FFFFFF' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  link: { color: '#0A84FF', fontWeight: '700' },
});
