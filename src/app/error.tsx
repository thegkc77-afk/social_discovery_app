import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ErrorBoundaryProps } from 'expo-router';

export default function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Something went wrong</Text>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.errorText}>{error?.message || String(error)}</Text>
        {error?.stack && <Text style={styles.stackText}>{error.stack}</Text>}
      </ScrollView>
      <TouchableOpacity style={styles.button} onPress={retry}>
        <Text style={styles.buttonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#EF4444',
    marginTop: 40,
    marginBottom: 16,
  },
  scroll: {
    flex: 1,
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  errorText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F87171',
    marginBottom: 12,
  },
  stackText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#94A3B8',
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
