import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';

const CATEGORIES = [
  'General',
  'Technology',
  'AI',
  'Sports',
  'Cricket',
  'Business',
  'Health',
  'Science',
  'Education',
  'Environment',
  'Entertainment',
  'India',
  'World',
  'Politics'
];

interface CategoryHeaderProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategoryHeader: React.FC<CategoryHeaderProps> = ({
  selectedCategory,
  onSelectCategory
}) => {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
          return (
            <TouchableOpacity
              key={cat}
              style={[styles.pill, isSelected && styles.selectedPill]}
              onPress={() => onSelectCategory(cat)}
            >
              <Text style={[styles.pillText, isSelected && styles.selectedPillText]}>{cat}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 48,
    backgroundColor: '#090D16',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B'
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 12
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    marginRight: 8
  },
  selectedPill: {
    backgroundColor: '#0284C7'
  },
  pillText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600'
  },
  selectedPillText: {
    color: '#FFFFFF',
    fontWeight: '700'
  }
});
