import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { X, ShieldCheck } from 'lucide-react-native';
import { Colors } from '../../constants/theme';
import Button from '../ui/Button';

interface WhyVerifySheetProps {
  visible: boolean;
  onClose: () => void;
}

const REASONS = ['Fake profiles', 'Bots', 'Spam accounts', 'Impersonation'];

export default function WhyVerifySheet({ visible, onClose }: WhyVerifySheetProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <View style={styles.iconWrapper}>
              <ShieldCheck size={20} color={Colors.pink} />
            </View>
            <Pressable onPress={onClose} hitSlop={10}>
              <X size={22} color={Colors.textSecondary} />
            </Pressable>
          </View>

          <Text style={styles.title}>Why verify?</Text>
          <Text style={styles.body}>
            VibeMatch connects you with real people. Verification helps us reduce:
          </Text>

          <View style={styles.reasonsList}>
            {REASONS.map((reason) => (
              <View key={reason} style={styles.reasonRow}>
                <View style={styles.bullet} />
                <Text style={styles.reasonText}>{reason}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.privacyNote}>
            Your verification video is used for authenticity checks and should not automatically
            become a public profile video.
          </Text>

          <Text style={styles.learnMore}>Learn more about privacy</Text>

          <Button onPress={onClose} title="GOT IT" style={styles.gotItBtn} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 36,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.veryLightPink,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: 16,
  },
  reasonsList: {
    gap: 10,
    marginBottom: 20,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.pink,
  },
  reasonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  privacyNote: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
    lineHeight: 19,
    marginBottom: 12,
  },
  learnMore: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.pink,
    marginBottom: 24,
  },
  gotItBtn: {
    width: '100%',
  },
});
