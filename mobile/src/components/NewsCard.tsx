import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  Share,
  Modal,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { NewsArticle } from '../types';
import { tracker } from '../services/tracker';
import api from '../services/api';

const { height, width } = Dimensions.get('window');

interface NewsCardProps {
  article: NewsArticle;
  recommendationReasons?: string[];
}

export const NewsCard: React.FC<NewsCardProps> = ({ article, recommendationReasons = [] }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isNotInterested, setIsNotInterested] = useState(false);
  const [showExplainModal, setShowExplainModal] = useState(false);
  const [explanations, setExplanations] = useState<string[]>(recommendationReasons);

  const handleOpenSource = async () => {
    tracker.sendInteraction(article._id, article.category, 'open', 0, 100);
    if (article.articleUrl) {
      await WebBrowser.openBrowserAsync(article.articleUrl);
    }
  };

  const handleLike = () => {
    const next = !isLiked;
    setIsLiked(next);
    tracker.sendInteraction(article._id, article.category, next ? 'like' : 'dislike');
  };

  const handleBookmark = async () => {
    const next = !isBookmarked;
    setIsBookmarked(next);
    tracker.sendInteraction(article._id, article.category, next ? 'bookmark' : 'skip');
    try {
      if (next) {
        await api.post(`/bookmarks/${article._id}`);
      } else {
        await api.delete(`/bookmarks/${article._id}`);
      }
    } catch (e) {}
  };

  const handleNotInterested = () => {
    setIsNotInterested(true);
    tracker.sendInteraction(article._id, article.category, 'not_interested');
  };

  const handleShare = async () => {
    tracker.sendInteraction(article._id, article.category, 'share');
    try {
      await Share.share({
        message: `${article.title}\n\nRead on NewsPulse AI: ${article.articleUrl}`
      });
    } catch (e) {}
  };

  const handleExplain = async () => {
    setShowExplainModal(true);
    try {
      const res = await api.get(`/news/${article._id}/explain`);
      if (res.data?.data?.reasons) {
        setExplanations(res.data.data.reasons);
      }
    } catch (e) {}
  };

  if (isNotInterested) {
    return (
      <View style={[styles.card, styles.hiddenCard]}>
        <Ionicons name="eye-off-outline" size={48} color="#64748B" />
        <Text style={styles.hiddenText}>Article hidden based on your preference</Text>
      </View>
    );
  }

  const timeAgo = (dateStr: string) => {
    const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <View style={styles.card}>
      {/* Article Image Container */}
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri:
              article.imageUrl ||
              'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80'
          }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.badgeContainer}>
          <Text style={styles.categoryBadge}>{article.category.toUpperCase()}</Text>
          <TouchableOpacity style={styles.explainButton} onPress={handleExplain}>
            <Ionicons name="sparkles" size={14} color="#38BDF8" />
            <Text style={styles.explainText}>Why this?</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Card Content Area */}
      <View style={styles.content}>
        <View style={styles.metaRow}>
          <Text style={styles.sourceName}>{article.sourceName}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.timeText}>{timeAgo(article.publishedAt)}</Text>
        </View>

        <Text style={styles.title} numberOfLines={3}>
          {article.title}
        </Text>

        <Text style={styles.summary} numberOfLines={5}>
          {article.shortSummary}
        </Text>
      </View>

      {/* Footer Action Bar */}
      <View style={styles.footer}>
        <View style={styles.leftActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={24}
              color={isLiked ? '#EF4444' : '#94A3B8'}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={handleBookmark}>
            <Ionicons
              name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={24}
              color={isBookmarked ? '#F59E0B' : '#94A3B8'}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={24} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={handleNotInterested}>
            <Ionicons name="thumbs-down-outline" size={22} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.readMoreBtn} onPress={handleOpenSource}>
          <Text style={styles.readMoreText}>Read Source</Text>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Explainability Modal ("Why am I seeing this?") */}
      <Modal visible={showExplainModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="sparkles" size={20} color="#38BDF8" style={{ marginRight: 8 }} />
                <Text style={styles.modalTitle}>Why am I seeing this story?</Text>
              </View>
              <TouchableOpacity onPress={() => setShowExplainModal(false)}>
                <Ionicons name="close" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ marginTop: 12 }}>
              {explanations.map((reason, idx) => (
                <View key={idx} style={styles.reasonRow}>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#10B981" />
                  <Text style={styles.reasonText}>{reason}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: width,
    height: height * 0.82,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1E293B'
  },
  hiddenCard: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E293B'
  },
  hiddenText: {
    color: '#94A3B8',
    marginTop: 12,
    fontSize: 15
  },
  imageContainer: {
    height: '42%',
    width: '100%',
    position: 'relative'
  },
  image: {
    width: '100%',
    height: '100%'
  },
  badgeContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  categoryBadge: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: 'hidden'
  },
  explainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20
  },
  explainText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start'
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  sourceName: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '600'
  },
  dot: {
    color: '#64748B',
    marginHorizontal: 6
  },
  timeText: {
    color: '#64748B',
    fontSize: 12
  },
  title: {
    color: '#F8FAFC',
    fontSize: 19,
    fontWeight: '700',
    lineHeight: 26,
    marginBottom: 12
  },
  summary: {
    color: '#CBD5E1',
    fontSize: 14,
    lineHeight: 22
  },
  footer: {
    height: 64,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F172A'
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  actionBtn: {
    marginRight: 18
  },
  readMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284C7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20
  },
  readMoreText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
    marginRight: 6
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '40%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155'
  },
  modalTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700'
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  reasonText: {
    color: '#CBD5E1',
    fontSize: 14,
    marginLeft: 8
  }
});
