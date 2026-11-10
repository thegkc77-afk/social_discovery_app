import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, FlatList, TouchableOpacity } from 'react-native';
import { ChevronDown, X } from 'lucide-react-native';
import { Colors } from '../../constants/theme';

export interface Country {
  name: string;
  flag: string;
  dialCode: string;
  digits: number;
}

export const COUNTRIES: Country[] = [
  { name: 'India', flag: '🇮🇳', dialCode: '+91', digits: 10 },
  { name: 'United States', flag: '🇺🇸', dialCode: '+1', digits: 10 },
  { name: 'United Kingdom', flag: '🇬🇧', dialCode: '+44', digits: 10 },
  { name: 'Canada', flag: '🇨🇦', dialCode: '+1', digits: 10 },
  { name: 'Australia', flag: '🇦🇺', dialCode: '+61', digits: 9 },
  { name: 'United Arab Emirates', flag: '🇦🇪', dialCode: '+971', digits: 9 },
  { name: 'Singapore', flag: '🇸🇬', dialCode: '+65', digits: 8 },
];

interface CountryPickerProps {
  selected: Country;
  onSelect: (country: Country) => void;
}

export default function CountryPicker({ selected, onSelect }: CountryPickerProps) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={styles.trigger}
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.flagText}>{selected.flag}</Text>
        <Text style={styles.codeText}>{selected.dialCode}</Text>
        <ChevronDown size={16} color="#687080" />
      </TouchableOpacity>

      <Modal visible={visible} animationType="slide" transparent onRequestClose={() => setVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Select country</Text>
              <Pressable onPress={() => setVisible(false)} hitSlop={10}>
                <X size={22} color={Colors.textSecondary} />
              </Pressable>
            </View>
            <FlatList
              data={COUNTRIES}
              keyExtractor={(item) => item.name}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.row}
                  onPress={() => {
                    onSelect(item);
                    setVisible(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.rowFlag}>{item.flag}</Text>
                  <Text style={styles.rowName}>{item.name}</Text>
                  <Text style={styles.rowCode}>{item.dialCode}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  flagText: {
    fontSize: 20,
  },
  codeText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
    maxHeight: '70%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  rowFlag: {
    fontSize: 22,
  },
  rowName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  rowCode: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
});
