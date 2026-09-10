import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, ActivityIndicator, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NewsCard } from '../components/NewsCard';
import { NewsArticle } from '../types';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const BookmarkScreen: React.FC = () => {
  const { user, isGuest } = useAuth();
  const [bookmarks, setBookmarks] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBookmarks = async () => {
    if (isGuest || !user) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await api.get('/users/me/bookmarks');
      if (res.data?.data?.articles) {
        setBookmarks(res.data.data.articles);
      }
    } catch (e) {
      console.error('Error fetching bookmarks:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, [user, isGuest]);

  if (isGuest) {
    return (
      <View style={styles.center}>
        <Ionicons name="bookmark-outline" size={56} color="#38BDF8" />
        <Text style={styles.title}>Guest Mode Active</Text>
        <Text style={styles.subtitle}>Log in or create an account to save and access bookmarked news cards across devices.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#38BDF8" />
        </View>
      ) : bookmarks.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="bookmark-outline" size={56} color="#334155" />
          <Text style={styles.title}>No Bookmarks Saved</Text>
          <Text style={styles.subtitle}>Tap the bookmark icon on any news card to save articles for quick offline reading.</Text>
        </View>
      ) : (
        <FlatList
          data={bookmarks}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <NewsCard article={item} />
            </View>
          )}
          contentContainerStyle={{ paddingVertical: 12 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16'
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#090D16'
  },
  title: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20
  },
  cardWrapper: {
    marginVertical: 8,
    alignItems: 'center'
  }
});
