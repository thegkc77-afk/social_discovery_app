import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Zap, MessageSquare, User } from 'lucide-react-native';
import { Colors } from '../../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BottomNavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const navItems = [
    {
      name: 'Talk Now',
      route: '/talk-now',
      icon: Zap,
    },
    {
      name: 'Chats',
      route: '/chats',
      icon: MessageSquare,
    },
    {
      name: 'Profile',
      route: '/profile',
      icon: User,
    },
  ];

  return (
    <View style={[styles.container, { paddingBottom: Math.max(12, insets.bottom) }]}>
      {navItems.map((item) => {
        const Icon = item.icon;
        // Check if the current route matches the tab route
        const isActive = pathname.startsWith(item.route);

        return (
          <Pressable
            key={item.route}
            onPress={() => router.replace(item.route as any)}
            style={styles.navButton}
          >
            <Icon
              size={22}
              color={isActive ? Colors.pink : Colors.textMuted}
              strokeWidth={isActive ? 2.5 : 2}
            />
            <Text style={[styles.navText, isActive ? styles.activeNavText : styles.inactiveNavText]}>
              {item.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
  },
  navText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  activeNavText: {
    color: Colors.pink,
  },
  inactiveNavText: {
    color: Colors.textMuted,
  },
});
