import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable, Image, Alert, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Plus, X } from 'lucide-react-native';
import { Colors } from '../../constants/theme';
import Button from '../../components/ui/Button';
import OnboardingHeader from '../../components/onboarding/OnboardingHeader';

export default function PhotosScreen() {
  const router = useRouter();
  const [images, setImages] = useState<(string | null)[]>([null, null, null, null, null, null]);

  const addedCount = images.filter((img) => img !== null).length;
  const isValid = addedCount >= 4;

  const handleSelectImage = async (index: number) => {
    // Request permission first
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll access to upload photos.');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        const newImages = [...images];
        newImages[index] = uri;
        setImages(newImages);
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'An error occurred while picking an image.');
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages[index] = null;
    
    // Shift remaining images forward so there are no empty gaps
    const filtered = newImages.filter((img) => img !== null);
    const padded = [...filtered, ...Array(6 - filtered.length).fill(null)];
    setImages(padded);
  };

  const handleContinue = () => {
    if (!isValid) return;
    router.push('/onboarding/verification');
  };

  const slotWidth = (Dimensions.get('window').width - 56) / 2; // (Screen width - horizontal paddings - gap) / 2
  const slotHeight = slotWidth * (4 / 3);

  return (
    <SafeAreaView style={styles.container}>
      <OnboardingHeader progress={0.62} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerTextSection}>
          <Text style={styles.title}>Upload your photos</Text>
          <Text style={styles.description}>
            Upload at least 4 photos to continue. The first photo is your cover.
          </Text>
        </View>

        {/* Progress label */}
        <View style={styles.progressLabelContainer}>
          <Text style={styles.progressLabelText}>
            {addedCount >= 4 ? (
              <Text style={styles.successText}>✓ {addedCount} of 6 photos added</Text>
            ) : (
              <Text style={styles.progressText}>{addedCount} of 4 photos added (minimum 4)</Text>
            )}
          </Text>
        </View>

        {/* 6 Slot Grid */}
        <View style={styles.grid}>
          {images.map((imageUri, index) => {
            const isMain = index === 0 && imageUri !== null;
            return (
              <View
                key={index}
                style={[
                  styles.slot,
                  { width: slotWidth, height: slotHeight },
                  imageUri ? styles.slotWithImage : styles.slotEmpty,
                ]}
              >
                {imageUri ? (
                  <View style={styles.imageWrapper}>
                    <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
                    {isMain && (
                      <View style={styles.mainBadge}>
                        <Text style={styles.mainBadgeText}>MAIN</Text>
                      </View>
                    )}
                    <Pressable
                      onPress={() => handleRemoveImage(index)}
                      style={styles.removeButton}
                    >
                      <X size={16} color={Colors.white} strokeWidth={2.5} />
                    </Pressable>
                  </View>
                ) : (
                  <Pressable
                    onPress={() => handleSelectImage(index)}
                    style={styles.emptyWrapper}
                  >
                    <View style={styles.plusCircle}>
                      <Plus size={24} color={Colors.pink} strokeWidth={2.5} />
                    </View>
                    <Text style={styles.addPhotoText}>Add photo</Text>
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>

        <Button
          onPress={handleContinue}
          title="CONTINUE"
          disabled={!isValid}
          style={styles.submitBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  headerTextSection: {
    width: '100%',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 6,
  },
  description: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '500',
    lineHeight: 22,
  },
  progressLabelContainer: {
    width: '100%',
    backgroundColor: Colors.veryLightPink,
    borderWidth: 1,
    borderColor: Colors.lightPink,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 24,
  },
  progressLabelText: {
    fontSize: 14,
    fontWeight: '700',
  },
  successText: {
    color: Colors.success,
  },
  progressText: {
    color: Colors.pink,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
    marginBottom: 32,
  },
  slot: {
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  slotWithImage: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  slotEmpty: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.lightPink,
    backgroundColor: Colors.veryLightPink,
  },
  imageWrapper: {
    flex: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(36, 33, 36, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  plusCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.lightPink,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.pink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  addPhotoText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.pink,
  },
  mainBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: Colors.pink,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  mainBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  submitBtn: {
    width: '100%',
  },
});
