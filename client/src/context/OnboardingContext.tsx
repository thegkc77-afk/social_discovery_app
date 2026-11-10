import React, { createContext, useContext, useMemo, useState } from 'react';
import { VerificationStatus } from '../data/mockData';

interface OnboardingData {
  phone: string;
  countryCode: string;
  name: string;
  day: string;
  month: string;
  year: string;
  gender: string;
  photos: string[];
  interests: string[];
  connectionIntents: string[];
  verificationStatus: VerificationStatus;
  locationName: string;
  coordinates: { latitude: number; longitude: number } | null;
}

interface OnboardingContextValue extends OnboardingData {
  setPhone: (phone: string, countryCode: string) => void;
  setBasicProfile: (data: { name: string; day: string; month: string; year: string; gender: string }) => void;
  setPhotos: (photos: string[]) => void;
  setInterests: (interests: string[]) => void;
  setConnectionIntents: (intents: string[]) => void;
  setVerificationStatus: (status: VerificationStatus) => void;
  setLocation: (locationName: string, coordinates?: { latitude: number; longitude: number } | null) => void;
}

const defaultData: OnboardingData = {
  phone: '',
  countryCode: '+91',
  name: '',
  day: '',
  month: '',
  year: '',
  gender: '',
  photos: [],
  interests: [],
  connectionIntents: [],
  verificationStatus: 'not_started',
  locationName: '',
  coordinates: null,
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<OnboardingData>(defaultData);

  const value = useMemo<OnboardingContextValue>(
    () => ({
      ...data,
      setPhone: (phone, countryCode) => setData((prev) => ({ ...prev, phone, countryCode })),
      setBasicProfile: ({ name, day, month, year, gender }) =>
        setData((prev) => ({ ...prev, name, day, month, year, gender })),
      setPhotos: (photos) => setData((prev) => ({ ...prev, photos })),
      setInterests: (interests) => setData((prev) => ({ ...prev, interests })),
      setConnectionIntents: (connectionIntents) => setData((prev) => ({ ...prev, connectionIntents })),
      setVerificationStatus: (verificationStatus) => setData((prev) => ({ ...prev, verificationStatus })),
      setLocation: (locationName, coordinates = null) =>
        setData((prev) => ({ ...prev, locationName, coordinates })),
    }),
    [data]
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    return {
      ...defaultData,
      setPhone: () => {},
      setBasicProfile: () => {},
      setPhotos: () => {},
      setInterests: () => {},
      setConnectionIntents: () => {},
      setVerificationStatus: () => {},
      setLocation: () => {},
    };
  }
  return ctx;
}
