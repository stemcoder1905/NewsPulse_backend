import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  { name: 'General', icon: 'newspaper-outline' },
  { name: 'Technology', icon: 'hardware-chip-outline' },
  { name: 'AI', icon: 'sparkles-outline' },
  { name: 'Sports', icon: 'trophy-outline' },
  { name: 'Cricket', icon: 'baseball-outline' },
  { name: 'Business', icon: 'trending-up-outline' },
  { name: 'Health', icon: 'heart-outline' },
  { name: 'Science', icon: 'flask-outline' },
  { name: 'Education', icon: 'school-outline' },
  { name: 'Environment', icon: 'leaf-outline' },
  { name: 'Entertainment', icon: 'film-outline' },
  { name: 'India', icon: 'flag-outline' },
  { name: 'World', icon: 'earth-outline' },
  { name: 'Politics', icon: 'ribbon-outline' }
];

export const OnboardingScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { updatePreferences, setGuestMode } = useAuth();
  const [selected, setSelected] = useState<string[]>(['General', 'Technology']);

  const toggleCategory = (name: string) => {
    if (selected.includes(name)) {
      if (selected.length === 1) return; // Must keep at least one
      setSelected(selected.filter((c) => c !== name));
    } else {
      setSelected([...selected, name]);
    }
  };

  const handleContinue = async () => {
    await updatePreferences(selected);
    navigation.replace('MainTabs');
  };

  const handleSkip = () => {
    setGuestMode();
    navigation.replace('MainTabs');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Personalize Your Feed</Text>
        <Text style={styles.subtitle}>Select news topics you want NewsPulse AI to prioritize for you.</Text>
      </View>

      <ScrollView contentContainerStyle={styles.grid}>
        {CATEGORIES.map((cat) => {
          const isSel = selected.includes(cat.name);
          return (
            <TouchableOpacity
              key={cat.name}
              style={[styles.card, isSel && styles.cardSelected]}
              onPress={() => toggleCategory(cat.name)}
            >
              <Ionicons
                name={cat.icon as any}
                size={28}
                color={isSel ? '#38BDF8' : '#64748B'}
              />
              <Text style={[styles.cardText, isSel && styles.cardTextSelected]}>{cat.name}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip (Guest Mode)</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueText}>Continue ({selected.length})</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
    paddingTop: 50
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 20
  },
  title: {
    color: '#F8FAFC',
    fontSize: 26,
    fontWeight: '800'
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 6
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between'
  },
  card: {
    width: '46%',
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 18,
    marginVertical: 8,
    borderWidth: 2,
    borderColor: '#1E293B',
    alignItems: 'center'
  },
  cardSelected: {
    borderColor: '#38BDF8',
    backgroundColor: '#1E293B'
  },
  cardText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10
  },
  cardTextSelected: {
    color: '#F8FAFC',
    fontWeight: '700'
  },
  footer: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#1E293B'
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 16
  },
  skipText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600'
  },
  continueButton: {
    backgroundColor: '#0284C7',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 25
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700'
  }
});
