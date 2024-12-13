import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useAuth } from '../../contexts/AuthContext';
import { SessionService } from '../../services/SessionService';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

const sessionService = SessionService.getInstance();

interface Session {
  sessionId: string;
  deviceInfo: {
    platform: string;
    deviceName: string;
    os: string;
  };
  lastActive: Date;
  isCurrentSession: boolean;
  createdAt: Date;
  isActive: boolean;
}

export const SessionManager = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    if (!currentUser?.uid) return;

    try {
      setLoading(true);
      const activeSessions = await sessionService.getSessions(currentUser.uid);
      setSessions(activeSessions);
    } catch (error) {
      console.error('Errore nel caricamento delle sessioni:', error);
      Alert.alert('Errore', 'Impossibile caricare le sessioni attive');
    } finally {
      setLoading(false);
    }
  };

  const handleTerminateSession = async (session: Session) => {
    if (!currentUser) return;

    try {
      if (session.isCurrentSession) {
        Alert.alert(
          'Attenzione',
          'Stai per terminare la sessione corrente. Verrai disconnesso.',
          [
            { text: 'Annulla', style: 'cancel' },
            { 
              text: 'Termina', 
              style: 'destructive',
              onPress: async () => {
                await sessionService.terminateSession(currentUser.uid, session.sessionId);
                await loadSessions();
              }
            }
          ]
        );
      } else {
        Alert.alert(
          'Conferma',
          'Vuoi terminare questa sessione?',
          [
            { text: 'Annulla', style: 'cancel' },
            { 
              text: 'Termina', 
              style: 'destructive',
              onPress: async () => {
                await sessionService.terminateSession(currentUser.uid, session.sessionId);
                await loadSessions();
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Errore nella terminazione della sessione:', error);
      Alert.alert('Errore', 'Impossibile terminare la sessione');
    }
  };

  const formatLastActive = (date: Date) => {
    return format(date, "d MMMM yyyy 'alle' HH:mm", { locale: it });
  };

  const SessionItem = ({ session }: { session: Session }) => (
    <View style={styles.sessionItem}>
      <View style={styles.sessionInfo}>
        <View style={styles.deviceInfo}>
          <Ionicons 
            name={session.deviceInfo.platform.toLowerCase() === 'ios' ? 'phone-portrait' : 'phone-portrait-outline'} 
            size={24} 
            color={colors.text.primary} 
          />
          <View style={styles.textContainer}>
            <Text style={styles.deviceName}>
              {session.deviceInfo.deviceName}
              {session.isCurrentSession && (
                <Text style={styles.currentDevice}> (Dispositivo corrente)</Text>
              )}
            </Text>
            <Text style={styles.lastActive}>
              Ultimo accesso: {formatLastActive(session.lastActive)}
            </Text>
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={styles.terminateButton}
        onPress={() => handleTerminateSession(session)}
      >
        <Ionicons name="close-circle-outline" size={24} color={colors.status.error} />
      </TouchableOpacity>
    </View>
  );

  if (!currentUser) {
    return null;
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {sessions.length === 0 ? (
        <Text style={styles.noSessions}>Nessuna sessione attiva</Text>
      ) : (
        sessions.map((session) => (
          <SessionItem key={session.sessionId} session={session} />
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
  noSessions: {
    padding: 16,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  sessionInfo: {
    flex: 1,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  deviceName: {
    color: colors.text.primary,
    fontSize: 16,
    marginBottom: 4,
  },
  currentDevice: {
    color: colors.text.secondary,
    fontSize: 14,
    fontStyle: 'italic',
  },
  lastActive: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  terminateButton: {
    padding: 8,
  },
});
