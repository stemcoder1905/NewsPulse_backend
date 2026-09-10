import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export const AuthScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { login, register, isLoading } = useAuth();
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async () => {
    setErrorMsg('');
    if (!email || !password || (!isLoginTab && !name)) {
      setErrorMsg('Please fill in all required fields');
      return;
    }
    try {
      if (isLoginTab) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      navigation.replace('MainTabs');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Authentication failed');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="newspaper-sharp" size={48} color="#38BDF8" />
        <Text style={styles.appTitle}>NewsPulse AI</Text>
        <Text style={styles.appSub}>Personalized news at your fingertips</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, isLoginTab && styles.activeTab]}
          onPress={() => setIsLoginTab(true)}
        >
          <Text style={[styles.tabText, isLoginTab && styles.activeTabText]}>Log In</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, !isLoginTab && styles.activeTab]}
          onPress={() => setIsLoginTab(false)}
        >
          <Text style={[styles.tabText, !isLoginTab && styles.activeTabText]}>Sign Up</Text>
        </TouchableOpacity>
      </View>

      {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

      <View style={styles.form}>
        {!isLoginTab && (
          <View style={styles.inputGroup}>
            <Ionicons name="person-outline" size={20} color="#64748B" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#64748B"
              value={name}
              onChangeText={setName}
            />
          </View>
        )}

        <View style={styles.inputGroup}>
          <Ionicons name="mail-outline" size={20} color="#64748B" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor="#64748B"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputGroup}>
          <Ionicons name="lock-closed-outline" size={20} color="#64748B" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#64748B"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitBtnText}>{isLoginTab ? 'Log In' : 'Create Account'}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
    justifyContent: 'center',
    padding: 24
  },
  header: {
    alignItems: 'center',
    marginBottom: 32
  },
  appTitle: {
    color: '#F8FAFC',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 8
  },
  appSub: {
    color: '#64748B',
    fontSize: 14,
    marginTop: 4
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8
  },
  activeTab: {
    backgroundColor: '#1E293B'
  },
  tabText: {
    color: '#64748B',
    fontWeight: '600',
    fontSize: 14
  },
  activeTabText: {
    color: '#38BDF8',
    fontWeight: '700'
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 13
  },
  form: {
    width: '100%'
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 14
  },
  icon: {
    marginRight: 10
  },
  input: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 15
  },
  submitBtn: {
    backgroundColor: '#0284C7',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700'
  }
});
