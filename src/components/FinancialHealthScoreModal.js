import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { LiquidGlassModal } from './LiquidGlassModal';

export function FinancialHealthScoreModal({
  visible,
  healthData,
  onClose,
}) {
  const { colors, shadows } = useTheme();

  if (!healthData) return null;
  const { score, tier, pillars, recommendations } = healthData;

  // SVG circular gauge geometry
  const radius = 68;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  // Progress arc from 0 to 1000
  const progressRatio = Math.min(1, Math.max(0, score / 1000));
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <LiquidGlassModal
      visible={visible}
      onClose={onClose}
      title="Financial Health Score"
      subtitle="Holistic wealth & fiscal velocity rating"
      maxHeight="92%"
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Radial Gauge Card */}
        <View style={[styles.gaugeCard, shadows.md, { backgroundColor: colors.surfaceLight, borderColor: colors.surfaceBorder }]}>
          <View style={styles.gaugeContainer}>
            <Svg width={160} height={160}>
              <Defs>
                <LinearGradient id="gaugeGradient" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0%" stopColor={tier.color} />
                  <Stop offset="100%" stopColor={colors.primaryLight} />
                </LinearGradient>
              </Defs>
              {/* Track Circle */}
              <Circle
                cx={80}
                cy={80}
                r={radius}
                stroke={colors.surfaceHighlight}
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              {/* Progress Circle */}
              <Circle
                cx={80}
                cy={80}
                r={radius}
                stroke="url(#gaugeGradient)"
                strokeWidth={strokeWidth}
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                transform="rotate(-90 80 80)"
              />
            </Svg>

            <View style={styles.gaugeCenterText}>
              <Text style={[styles.scoreNumber, { color: colors.textPrimary, fontVariant: ['tabular-nums'] }]}>
                {score}
              </Text>
              <Text style={[styles.scoreMax, { color: colors.textMuted }]}>/ 1000</Text>
            </View>
          </View>

          {/* Tier Badge */}
          <View style={[styles.tierBadge, { backgroundColor: tier.bg, borderColor: tier.color }]}>
            <Ionicons name={tier.icon} size={15} color={tier.color} style={{ marginRight: 6 }} />
            <Text style={[styles.tierText, { color: tier.color }]}>{tier.label}</Text>
          </View>
          <Text style={[styles.tierSummary, { color: colors.textSecondary }]}>{tier.summary}</Text>
        </View>

        {/* 4 Pillars Breakdown */}
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>SCORE PILLARS</Text>
        {pillars.map((p) => (
          <View
            key={p.name}
            style={[styles.pillarCard, { backgroundColor: colors.surfaceLight, borderColor: colors.surfaceBorder }]}>
            <View style={styles.pillarHeader}>
              <Text style={[styles.pillarName, { color: colors.textPrimary }]}>{p.name}</Text>
              <Text style={[styles.pillarScore, { color: tier.color, fontVariant: ['tabular-nums'] }]}>
                {p.score}{' '}
                <Text style={{ color: colors.textMuted, fontSize: 11 }}>/ {p.maxScore}</Text>
              </Text>
            </View>

            {/* Progress Bar */}
            <View style={[styles.progressTrack, { backgroundColor: colors.surfaceHighlight }]}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${p.pct}%`,
                    backgroundColor: p.pct >= 70 ? colors.income : p.pct >= 40 ? colors.warning : colors.expense,
                  },
                ]}
              />
            </View>
          </View>
        ))}

        {/* Personalized Recommendations */}
        {recommendations.length > 0 && (
          <View style={{ marginTop: 12 }}>
            <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>RECOMMENDED ACTIONS</Text>
            {recommendations.map((rec, i) => (
              <View
                key={i}
                style={[styles.recCard, { backgroundColor: colors.surfaceLight, borderColor: colors.surfaceBorder }]}
              >
                <View style={[styles.recIconWrap, { backgroundColor: colors.primaryGlow }]}>
                  <Ionicons name={rec.icon} size={18} color={colors.primaryLight} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.recTitle, { color: colors.textPrimary }]}>{rec.title}</Text>
                  <Text style={[styles.recDesc, { color: colors.textSecondary }]}>{rec.description}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </LiquidGlassModal>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 28,
  },
  gaugeCard: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 16,
  },
  gaugeContainer: {
    position: 'relative',
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeCenterText: {
    position: 'absolute',
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: -1,
  },
  scoreMax: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: -2,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 14,
    marginBottom: 8,
  },
  tierText: {
    fontSize: 13,
    fontWeight: '800',
  },
  tierSummary: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 12,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 10,
    marginTop: 6,
  },
  pillarCard: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  pillarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pillarName: {
    fontSize: 13,
    fontWeight: '600',
  },
  pillarScore: {
    fontSize: 13,
    fontWeight: '800',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  recCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  recIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  recDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
});
