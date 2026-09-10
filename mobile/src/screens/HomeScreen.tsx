import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  ActivityIndicator,
  Text,
  RefreshControl,
  Dimensions,
  ViewToken
} from 'react-native';
import { NewsCard } from '../components/NewsCard';
import { AdCard } from '../components/AdCard';
import { CategoryHeader } from '../components/CategoryHeader';
import { FeedItem, NewsArticle, AdItem } from '../types';
import { tracker } from '../services/tracker';
import api from '../services/api';

const { height } = Dimensions.get('window');

export const HomeScreen: React.FC = () => {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('General');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();

  const loadFeed = async (cursor?: string, category: string = selectedCategory) => {
    try {
      let endpoint = '/feed';
      if (category.toLowerCase() !== 'general') {
        endpoint = `/news/category/${category.toLowerCase()}`;
      }

      const res = await api.get(endpoint, {
        params: { limit: 15, cursor }
      });

      let fetchedItems: FeedItem[] = [];
      if (res.data?.data?.articles) {
        if (category.toLowerCase() === 'general') {
          fetchedItems = res.data.data.articles;
        } else {
          fetchedItems = res.data.data.articles.map((art: NewsArticle) => ({
            type: 'article',
            data: art
          }));
        }
      }

      if (cursor) {
        setFeedItems((prev) => [...prev, ...fetchedItems]);
      } else {
        setFeedItems(fetchedItems);
      }

      setNextCursor(res.data?.data?.nextCursor);
    } catch (e) {
      console.error('Error loading feed:', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    loadFeed(undefined, selectedCategory);
  }, [selectedCategory]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadFeed(undefined, selectedCategory);
  };

  const handleEndReached = () => {
    if (nextCursor && !isLoading) {
      loadFeed(nextCursor, selectedCategory);
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].item) {
      const item = viewableItems[0].item as FeedItem;
      if (item.type === 'article') {
        const article = item.data as NewsArticle;
        tracker.onArticleVisible(article._id, article.category);
      }
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 70
  }).current;

  return (
    <View style={styles.container}>
      <CategoryHeader
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
      />

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#38BDF8" />
          <Text style={styles.loaderText}>Personalizing news feed...</Text>
        </View>
      ) : (
        <FlatList
          data={feedItems}
          keyExtractor={(item, index) =>
            item.type === 'article'
              ? (item.data as NewsArticle)._id || index.toString()
              : (item.data as AdItem).adId || index.toString()
          }
          renderItem={({ item }) => {
            if (item.type === 'article') {
              return (
                <View style={styles.cardWrapper}>
                  <NewsCard
                    article={item.data as NewsArticle}
                    recommendationReasons={item.recommendationReasons}
                  />
                </View>
              );
            } else {
              return (
                <View style={styles.cardWrapper}>
                  <AdCard ad={item.data as AdItem} />
                </View>
              );
            }
          }}
          pagingEnabled
          snapToInterval={height * 0.82 + 16}
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#38BDF8"
            />
          }
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loaderText: {
    color: '#94A3B8',
    marginTop: 12,
    fontSize: 14
  },
  cardWrapper: {
    marginVertical: 8,
    alignItems: 'center'
  }
});
