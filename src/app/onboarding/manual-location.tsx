import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Search, MapPin, X, Check } from 'lucide-react-native';
import { Colors } from '../../constants/theme';
import { useOnboarding } from '../../context/OnboardingContext';
import { saveUserLocation } from '../../services/users';

const POPULAR_CITIES = [
  { id: '1', name: 'Patna', state: 'Bihar, India', latitude: 25.5941, longitude: 85.1376 },
  { id: '2', name: 'Bangalore', state: 'Karnataka, India', latitude: 12.9716, longitude: 77.5946 },
  { id: '3', name: 'Mumbai', state: 'Maharashtra, India', latitude: 19.076, longitude: 72.8777 },
  { id: '4', name: 'Delhi', state: 'Delhi NCR, India', latitude: 28.6139, longitude: 77.209 },
  { id: '5', name: 'Hyderabad', state: 'Telangana, India', latitude: 17.385, longitude: 78.4867 },
  { id: '6', name: 'Kolkata', state: 'West Bengal, India', latitude: 22.5726, longitude: 88.3639 },
  { id: '7', name: 'Pune', state: 'Maharashtra, India', latitude: 18.5204, longitude: 73.8567 },
  { id: '8', name: 'Chennai', state: 'Tamil Nadu, India', latitude: 13.0827, longitude: 80.2707 },
  { id: '9', name: 'London', state: 'United Kingdom', latitude: 51.5074, longitude: -0.1278 },
  { id: '10', name: 'New York', state: 'United States', latitude: 40.7128, longitude: -74.006 },
];

export default function ManualLocationScreen() {
  const router = useRouter();
  const onboarding = useOnboarding();
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const filteredCities = POPULAR_CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.state.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectCity = async (city: (typeof POPULAR_CITIES)[0]) => {
    setSelectedCity(city.name);
    const locationString = `${city.name}, ${city.state}`;
    onboarding.setLocation(locationString, { latitude: city.latitude, longitude: city.longitude });
    await saveUserLocation(locationString, city.latitude, city.longitude);

    setTimeout(() => {
      router.push('/onboarding/verification-intro');
    }, 200);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.content}
      >
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={22} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Set Location Manually</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchWrapper}>
            <Search size={20} color={Colors.textMuted} style={styles.searchIcon} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search city, state or country..."
              placeholderTextColor={Colors.textMuted}
              style={styles.searchInput}
              autoFocus
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')} style={styles.clearBtn}>
                <X size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Cities List */}
        <View style={styles.listSection}>
          <Text style={styles.sectionLabel}>POPULAR CITIES</Text>
          <FlatList
            data={filteredCities}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const isSelected = selectedCity === item.name;
              return (
                <TouchableOpacity
                  onPress={() => handleSelectCity(item)}
                  activeOpacity={0.7}
                  style={[styles.cityRow, isSelected && styles.cityRowSelected]}
                >
                  <View style={styles.pinWrapper}>
                    <MapPin size={18} color={isSelected ? Colors.white : Colors.pink} />
                  </View>
                  <View style={styles.cityInfo}>
                    <Text style={[styles.cityName, isSelected && styles.cityNameSelected]}>
                      {item.name}
                    </Text>
                    <Text style={styles.cityState}>{item.state}</Text>
                  </View>
                  {isSelected && (
                    <View style={styles.checkWrapper}>
                      <Check size={18} color={Colors.pink} strokeWidth={2.5} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <MapPin size={36} color={Colors.textMuted} opacity={0.5} />
                <Text style={styles.emptyTitle}>No locations found</Text>
                <Text style={styles.emptySubtitle}>
                  Try searching for another city or country.
                </Text>
              </View>
            }
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: '#F8DCE5',
  },
  headerTitle: {
    fontFamily: 'Outfit',
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#F8DCE5',
    paddingHorizontal: 14,
    height: 52,
    shadowColor: Colors.pink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    fontFamily: 'Inter',
  },
  clearBtn: {
    padding: 4,
  },
  listSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#F8DCE5',
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cityRowSelected: {
    borderColor: Colors.pink,
    backgroundColor: '#FFF0F5',
  },
  pinWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF1F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cityInfo: {
    flex: 1,
  },
  cityName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    fontFamily: 'Outfit',
  },
  cityNameSelected: {
    color: Colors.pink,
  },
  cityState: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  checkWrapper: {
    marginLeft: 10,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
});
