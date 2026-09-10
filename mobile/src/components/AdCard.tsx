import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AdItem } from '../types';
import { tracker } from '../services/tracker';

const { height, width } = Dimensions.get('window');

interface AdCardProps {
  ad: AdItem;
}

export const AdCard: React.FC<AdCardProps> = ({ ad }) => {
  useEffect(() => {
    tracker.trackAdImpression(ad.adId, ad.campaignId);
  }, [ad.adId]);

  const handlePressCTA = async () => {
    tracker.trackAdClick(ad.adId, ad.campaignId);
    if (ad.targetUrl) {
      await Linking.openURL(ad.targetUrl);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.sponsorBadge}>
          <Ionicons name="megaphone" size={14} color="#F59E0B" style={{ marginRight: 4 }} />
          <Text style={styles.sponsorTag}>SPONSORED</Text>
        </View>
        <Text style={styles.sponsorName}>{ad.sponsorName}</Text>
      </View>

      <View style={styles.imageContainer}>
        <Image source={{ uri: ad.imageUrl }} style={styles.image} resizeMode="cover" />
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {ad.title}
        </Text>
        <Text style={styles.description} numberOfLines={4}>
          {ad.description}
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.ctaButton} onPress={handlePressCTA}>
          <Text style={styles.ctaText}>{ad.callToAction || 'Learn More'}</Text>
          <Ionicons name="open-outline" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: width,
    height: height * 0.82,
    backgroundColor: '#1E1B4B',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#4338CA',
    justifyContent: 'space-between'
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#312E81'
  },
  sponsorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  sponsorTag: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  sponsorName: {
    color: '#E0E7FF',
    fontSize: 13,
    fontWeight: '600'
  },
  imageContainer: {
    height: '40%',
    width: '100%'
  },
  image: {
    width: '100%',
    height: '100%'
  },
  content: {
    padding: 20,
    flex: 1
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 28,
    marginBottom: 8
  },
  description: {
    color: '#C7D2FE',
    fontSize: 14,
    lineHeight: 22
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#312E81'
  },
  ctaButton: {
    backgroundColor: '#6366F1',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8
  }
});
