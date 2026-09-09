import { PrismaClient, VerificationStatus } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_INTERESTS = [
  { name: 'Gaming', category: 'Entertainment' },
  { name: 'Music', category: 'Entertainment' },
  { name: 'Travel', category: 'Lifestyle' },
  { name: 'Hobbies', category: 'Lifestyle' },
  { name: 'Sports', category: 'Fitness' },
  { name: 'Movies & Shows', category: 'Entertainment' },
  { name: 'Technology', category: 'Tech' },
  { name: 'Anime', category: 'Entertainment' },
  { name: 'Coding', category: 'Tech' },
  { name: 'Foodie', category: 'Lifestyle' },
  { name: 'Fashion', category: 'Lifestyle' },
  { name: 'Fitness', category: 'Fitness' },
  { name: 'Reading', category: 'Lifestyle' },
  { name: 'Photography', category: 'Creative' },
];

const SEED_USERS = [
  {
    phoneNumber: '+919876543210',
    countryCode: '+91',
    profile: {
      name: 'Alex Rivera',
      username: 'rivera_vibe',
      age: 24,
      gender: 'Non-binary',
      bio: 'Exploring the city & good vibes ☕✨',
      locationName: 'Koramangala, Bangalore',
      online: true,
      isAvailable: true,
      intent: 'Chatting & Fun',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&h=800&q=80',
      coverPhotoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&h=800&q=80',
      verificationStatus: VerificationStatus.VERIFIED,
      likesCount: 15,
      commentsCount: 6,
    },
    interests: ['Coding', 'Music', 'Travel'],
  },
  {
    phoneNumber: '+919876543211',
    countryCode: '+91',
    profile: {
      name: 'Aanya',
      username: 'aanya_vibes',
      age: 25,
      gender: 'Woman',
      bio: 'Anyone up for coffee? ☕',
      locationName: 'Koramangala, Bangalore',
      online: true,
      isAvailable: true,
      intent: 'Chatting & Fun',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&h=800&q=80',
      coverPhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&h=800&q=80',
      verificationStatus: VerificationStatus.VERIFIED,
      likesCount: 12,
      commentsCount: 8,
    },
    interests: ['Gaming', 'Music'],
  },
  {
    phoneNumber: '+919876543212',
    countryCode: '+91',
    profile: {
      name: 'Rohan',
      username: 'rohan_s',
      age: 26,
      gender: 'Man',
      bio: "Bored on a Sunday. Let's talk!",
      locationName: 'Indiranagar, Bangalore',
      online: true,
      isAvailable: true,
      intent: 'Dating & Romance',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&h=800&q=80',
      coverPhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&h=800&q=80',
      verificationStatus: VerificationStatus.VERIFIED,
      likesCount: 7,
      commentsCount: 3,
    },
    interests: ['Sports', 'Music'],
  },
  {
    phoneNumber: '+919876543213',
    countryCode: '+91',
    profile: {
      name: 'Neha',
      username: 'neha_explore',
      age: 24,
      gender: 'Woman',
      bio: 'Looking for meaningful conversations.',
      locationName: 'HSR Layout, Bangalore',
      online: true,
      isAvailable: true,
      intent: 'Deep Conversations',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&h=800&q=80',
      coverPhotoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&h=800&q=80',
      verificationStatus: VerificationStatus.VERIFIED,
      likesCount: 9,
      commentsCount: 3,
    },
    interests: ['Gaming', 'Travel'],
  },
  {
    phoneNumber: '+919876543214',
    countryCode: '+91',
    profile: {
      name: 'Arjun',
      username: 'arjun_tech',
      age: 25,
      gender: 'Man',
      bio: "Let's talk about ideas that matter.",
      locationName: 'Koramangala, Bangalore',
      online: true,
      isAvailable: false,
      intent: 'Networking & Projects',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&h=800&q=80',
      coverPhotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&h=800&q=80',
      verificationStatus: VerificationStatus.VERIFIED,
      likesCount: 11,
      commentsCount: 4,
    },
    interests: ['Technology', 'Coding'],
  },
];

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Seed Interests
  console.log('Seeding default interests...');
  for (const item of DEFAULT_INTERESTS) {
    await prisma.interest.upsert({
      where: { name: item.name },
      update: { category: item.category },
      create: item,
    });
  }

  // 2. Seed Users and Profiles
  console.log('Seeding demo users & profiles...');
  for (const u of SEED_USERS) {
    const user = await prisma.user.upsert({
      where: { phoneNumber: u.phoneNumber },
      update: {
        isPhoneVerified: true,
      },
      create: {
        phoneNumber: u.phoneNumber,
        countryCode: u.countryCode,
        isPhoneVerified: true,
        preferences: {
          create: {
            minAge: 18,
            maxAge: 35,
            maxDistanceKm: 25,
            preferredGenders: ['Woman', 'Man', 'Non-binary'],
            preferredIntents: [u.profile.intent || 'Chatting & Fun'],
          },
        },
      },
    });

    // Profile
    await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        ...u.profile,
      },
      create: {
        userId: user.id,
        ...u.profile,
      },
    });

    // Photos
    if (u.profile.avatarUrl) {
      await prisma.photo.deleteMany({ where: { userId: user.id } });
      await prisma.photo.create({
        data: {
          userId: user.id,
          url: u.profile.avatarUrl,
          order: 0,
          isMain: true,
        },
      });
    }

    // Interests
    for (const interestName of u.interests) {
      const interest = await prisma.interest.findUnique({ where: { name: interestName } });
      if (interest) {
        await prisma.userInterest.upsert({
          where: {
            userId_interestId: {
              userId: user.id,
              interestId: interest.id,
            },
          },
          update: {},
          create: {
            userId: user.id,
            interestId: interest.id,
          },
        });
      }
    }
  }

  console.log('✅ Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
