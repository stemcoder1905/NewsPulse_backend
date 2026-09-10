import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, isGuest, logout } = useAuth();
  const [interestScores, setInterestScores] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchInterests = async () => {
    try {
      const res = await api.get('/users/me/interests');
      if (res.data?.data?.categoryScores) {
        setInterestScores(res.data.data.categoryScores);
      }
    } catch (e) {
      console.error('Error fetching interest profile:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInterests();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Account Box */}
      <View style={styles.profileBox}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={32} color="#38BDF8" />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{isGuest ? 'Guest Reader' : user?.name}</Text>
          <Text style={styles.userEmail}>{isGuest ? 'Anonymous AI Personalization Session' : user?.email}</Text>
        </View>
      </View>

      {/* AI Interest Engine Scores Breakdown */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="analytics-outline" size={20} color="#38BDF8" style={{ marginRight: 8 }} />
          <Text style={styles.sectionTitle}>AI Personalization Profile</Text>
        </View>
        <Text style={styles.sectionSub}>Real-time behavioral category interest scores (0 - 100):</Text>

        {isLoading ? (
          <ActivityIndicator color="#38BDF8" style={{ marginVertical: 16 }} />
        ) : Object.keys(interestScores).length === 0 ? (
          <Text style={styles.emptyScoreText}>Read more articles to build your personalized AI profile.</Text>
        ) : (
          Object.entries(interestScores)
            .sort((a, b) => b[1] - a[1])
            .map(([cat, score]) => (
              <View key={cat} style={styles.scoreRow}>
                <Text style={styles.categoryName}>{cat.toUpperCase()}</Text>
                <View style={styles.barBackground}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${Math.min(100, score)}%`,
                        backgroundColor: score > 70 ? '#10B981' : score > 40 ? '#38BDF8' : '#F59E0B'
                      }
                    ]}
                  />
                </View>
                <Text style={styles.scoreNumber}>{score}</Text>
              </View>
            ))
        )}
      </View>

      {/* Actions */}
      <View style={styles.section}>
        {isGuest ? (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Auth')}
          >
            <Ionicons name="log-in-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.buttonText}>Log In or Create Account</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.dangerButton} onPress={logout}>
            <Ionicons name="log-out-outline" size={20} color="#EF4444" style={{ marginRight: 8 }} />
            <Text style={styles.dangerButtonText}>Sign Out</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16'
  },
  content: {
    padding: 20
  },
  profileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 20
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  userInfo: {
    flex: 1
  },
  userName: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700'
  },
  userEmail: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 2
  },
  section: {
    backgroundColor: '#0F172A',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 20
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700'
  },
  sectionSub: {
    color: '#64748B',
    fontSize: 13,
    marginBottom: 16
  },
  emptyScoreText: {
    color: '#64748B',
    fontStyle: 'italic',
    marginVertical: 12
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  categoryName: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
    width: 95
  },
  barBackground: {
    flex: 1,
    height: 10,
    backgroundColor: '#1E293B',
    borderRadius: 5,
    overflow: 'hidden',
    marginHorizontal: 10
  },
  barFill: {
    height: '100%',
    borderRadius: 5
  },
  scoreNumber: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
    width: 28,
    textAlign: 'right'
  },
  primaryButton: {
    backgroundColor: '#0284C7',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700'
  },
  dangerButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12
  },
  dangerButtonText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '700'
  }
});
