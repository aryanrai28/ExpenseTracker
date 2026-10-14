import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency } from '../utils/formatters';
import { audioEffects } from '../utils/audioEffects';

export function ChallengesModal({
  visible,
  challengesManager,
  currencySymbol = '$',
  onClose,
}) {
  const { colors, shadows } = useTheme();
  const [sharingChallenge, setSharingChallenge] = useState(null);

  if (!challengesManager) return null;
  const { challenges, joinChallenge, logDayProgress, leaveChallenge } = challengesManager;

  const totalSaved = challenges.reduce((sum, c) => {
    return sum + (c.isActive || c.isCompleted ? c.currentStreakDays * c.estimatedDailySavings : 0);
  }, 0);

  const handleShareStory = async (ch) => {
    audioEffects.cashChime();
    setSharingChallenge(ch);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Financial Habits & Challenges</Text>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                Gamified money-saving micro-sprints
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: colors.surfaceLight }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Total Saved Hero Banner */}
            <LinearGradient
              colors={['#10B981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.heroCard, shadows.md]}
            >
              <View style={styles.heroTop}>
                <Ionicons name="flame" size={18} color="#FFD700" />
                <Text style={styles.heroTopLabel}>TOTAL CHALLENGE SAVINGS</Text>
              </View>
              <Text style={styles.heroAmount}>{formatCurrency(totalSaved, currencySymbol)}</Text>
              <Text style={styles.heroSub}>Saved through active behavioral habits</Text>
            </LinearGradient>

            {/* Share Story Card Preview if selected */}
            {sharingChallenge && (
              <View style={[styles.storyCardContainer, shadows.lg]}>
                <LinearGradient
                  colors={colors.cardGradient}
                  style={styles.storyCard}
                >
                  <View style={styles.storyHeader}>
                    <Ionicons name={sharingChallenge.icon} size={28} color="#FFF" />
                    <Text style={styles.storyWatermark}>EXPENSE TRACKER</Text>
                  </View>
                  <Text style={styles.storyTitle}>{sharingChallenge.title}</Text>
                  <Text style={styles.storyStreak}>
                    🔥 {sharingChallenge.currentStreakDays} DAY STREAK
                  </Text>
                  <Text style={styles.storyAmount}>
                    +{formatCurrency(sharingChallenge.currentStreakDays * sharingChallenge.estimatedDailySavings, currencySymbol)} Saved
                  </Text>
                  <Text style={styles.storyQuote}>"Small daily habits compound into massive wealth."</Text>

                  <TouchableOpacity
                    style={styles.dismissStoryBtn}
                    onPress={() => setSharingChallenge(null)}
                  >
                    <Text style={styles.dismissStoryText}>Done</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            )}

            {/* Challenges List */}
            <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>AVAILABLE SCL-CHALLENGES</Text>
            {challenges.map((ch) => {
              const pct = Math.min(100, Math.round((ch.currentStreakDays / ch.durationDays) * 100));
              const chSavings = ch.currentStreakDays * ch.estimatedDailySavings;

              return (
                <View
                  key={ch.id}
                  style={[
                    styles.challengeCard,
                    { backgroundColor: colors.surfaceLight, borderColor: ch.isActive ? ch.color : colors.surfaceBorder },
                  ]}
                >
                  <View style={styles.chTopRow}>
                    <View style={[styles.chIconWrap, { backgroundColor: ch.color + '22' }]}>
                      <Ionicons name={ch.icon} size={22} color={ch.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.chTitle, { color: colors.textPrimary }]}>{ch.title}</Text>
                      <Text style={[styles.chTagline, { color: colors.textSecondary }]}>{ch.tagline}</Text>
                    </View>
                    {ch.isActive && (
                      <View style={[styles.activeBadge, { backgroundColor: ch.color + '22' }]}>
                        <Text style={[styles.activeBadgeText, { color: ch.color }]}>Active</Text>
                      </View>
                    )}
                  </View>

                  {ch.isActive ? (
                    <>
                      {/* Streak Progress Track */}
                      <View style={styles.progressSection}>
                        <View style={styles.progressLabels}>
                          <Text style={[styles.progLeft, { color: colors.textPrimary }]}>
                            Day {ch.currentStreakDays} of {ch.durationDays}
                          </Text>
                          <Text style={[styles.progRight, { color: ch.color }]}>
                            +{formatCurrency(chSavings, currencySymbol)} saved
                          </Text>
                        </View>
                        <View style={[styles.track, { backgroundColor: colors.surfaceHighlight }]}>
                          <View
                            style={[
                              styles.fill,
                              { width: `${pct}%`, backgroundColor: ch.color },
                            ]}
                          />
                        </View>
                      </View>

                      {/* Actions */}
                      <View style={styles.actionsRow}>
                        <TouchableOpacity
                          style={[styles.checkInBtn, { backgroundColor: ch.color }]}
                          onPress={() => logDayProgress(ch.id)}
                        >
                          <Ionicons name="checkmark-circle" size={16} color="#FFF" style={{ marginRight: 4 }} />
                          <Text style={styles.checkInText}>Check-In Day</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.shareStoryBtn, { borderColor: colors.surfaceBorder }]}
                          onPress={() => handleShareStory(ch)}
                        >
                          <Ionicons name="share-social-outline" size={16} color={colors.textSecondary} />
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.leaveBtn}
                          onPress={() => leaveChallenge(ch.id)}
                        >
                          <Ionicons name="close-circle-outline" size={18} color={colors.textMuted} />
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    <TouchableOpacity
                      style={[styles.joinBtn, { backgroundColor: colors.primaryGlow, borderColor: colors.primaryLight }]}
                      onPress={() => joinChallenge(ch.id)}
                    >
                      <Ionicons name="flash" size={15} color={colors.primaryLight} style={{ marginRight: 6 }} />
                      <Text style={[styles.joinBtnText, { color: colors.primaryLight }]}>Join Challenge</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 34,
    maxHeight: '90%',
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  heroCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  heroTopLabel: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  heroAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 2,
  },
  heroSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  challengeCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  chTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  chIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  chTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  chTagline: {
    fontSize: 11,
    marginTop: 2,
  },
  activeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  progressSection: {
    marginBottom: 12,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progLeft: {
    fontSize: 12,
    fontWeight: '600',
  },
  progRight: {
    fontSize: 12,
    fontWeight: '800',
  },
  track: {
    height: 7,
    borderRadius: 3.5,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3.5,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkInBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
  },
  checkInText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  shareStoryBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  leaveBtn: {
    padding: 8,
  },
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  joinBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  storyCardContainer: {
    marginBottom: 16,
    borderRadius: 22,
    overflow: 'hidden',
  },
  storyCard: {
    padding: 24,
    borderRadius: 22,
    alignItems: 'center',
  },
  storyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  storyWatermark: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
  },
  storyTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 6,
    textAlign: 'center',
  },
  storyStreak: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFD700',
    marginBottom: 12,
  },
  storyAmount: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 12,
  },
  storyQuote: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 16,
  },
  dismissStoryBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
  },
  dismissStoryText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 12,
  },
});
