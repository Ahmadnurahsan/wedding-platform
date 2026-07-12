import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Seed admin user
  const adminEmail = 'admin@weddinginvite.com'
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } })
  if (!existing) {
    const passwordHash = await bcrypt.hash('admin123', 10)
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        name: 'Admin',
        role: 'admin',
      },
    })
    console.log('✅ Admin user created (admin@weddinginvite.com / admin123)')
  } else {
    console.log('ℹ️ Admin user already exists')
  }

  const themes = [
  { name: 'Classic Romance', category: 'Modern', thumbnailUrl: null, isPremium: false, sectionsConfig: JSON.stringify(['hero', 'couple', 'events', 'gallery', 'rsvp', 'maps', 'wishes', 'gift', 'footer']), defaultColors: JSON.stringify({ primaryColor: '#D4A574', secondaryColor: '#F5E6D3' }) },
  { name: 'Golden Elegance', category: 'Elegan', thumbnailUrl: null, isPremium: true, sectionsConfig: JSON.stringify(['hero', 'couple', 'events', 'gallery', 'rsvp', 'wishes', 'gift', 'footer']), defaultColors: JSON.stringify({ primaryColor: '#C5963A', secondaryColor: '#FDF3E0' }) },
  { name: 'Garden Bliss', category: 'Floral', thumbnailUrl: null, isPremium: false, sectionsConfig: JSON.stringify(['hero', 'couple', 'events', 'gallery', 'maps', 'wishes', 'gift', 'footer']), defaultColors: JSON.stringify({ primaryColor: '#7CB87C', secondaryColor: '#E8F5E8' }) },
  { name: 'Moonlight Serenade', category: 'Modern', thumbnailUrl: null, isPremium: true, sectionsConfig: JSON.stringify(['hero', 'couple', 'events', 'gallery', 'rsvp', 'maps', 'wishes', 'gift', 'footer']), defaultColors: JSON.stringify({ primaryColor: '#6B5B8D', secondaryColor: '#EDE7F6' }) },
  { name: 'Rustic Charm', category: 'Rustic', thumbnailUrl: null, isPremium: false, sectionsConfig: JSON.stringify(['hero', 'couple', 'events', 'rsvp', 'maps', 'wishes', 'gift', 'footer']), defaultColors: JSON.stringify({ primaryColor: '#A67C52', secondaryColor: '#F5EDE0' }) },
  { name: 'Royal Wedding', category: 'Elegan', thumbnailUrl: null, isPremium: true, sectionsConfig: JSON.stringify(['hero', 'couple', 'events', 'gallery', 'rsvp', 'maps', 'wishes', 'gift', 'footer']), defaultColors: JSON.stringify({ primaryColor: '#8B1A1A', secondaryColor: '#FDE8E8' }) },
  { name: 'Tropical Paradise', category: 'Modern', thumbnailUrl: null, isPremium: false, sectionsConfig: JSON.stringify(['hero', 'couple', 'events', 'gallery', 'rsvp', 'maps', 'wishes', 'gift', 'footer']), defaultColors: JSON.stringify({ primaryColor: '#2E9B8E', secondaryColor: '#E0F5F2' }) },
  { name: 'Vintage Love', category: 'Rustic', thumbnailUrl: null, isPremium: true, sectionsConfig: JSON.stringify(['hero', 'couple', 'events', 'gallery', 'rsvp', 'wishes', 'gift', 'footer']), defaultColors: JSON.stringify({ primaryColor: '#B87333', secondaryColor: '#F5E6CC' }) },
  { name: 'Minimalist White', category: 'Modern', thumbnailUrl: null, isPremium: false, sectionsConfig: JSON.stringify(['hero', 'couple', 'events', 'rsvp', 'maps', 'wishes', 'gift', 'footer']), defaultColors: JSON.stringify({ primaryColor: '#333333', secondaryColor: '#FFFFFF' }) },
  { name: 'Floral Fantasy', category: 'Floral', thumbnailUrl: null, isPremium: false, sectionsConfig: JSON.stringify(['hero', 'couple', 'events', 'gallery', 'rsvp', 'maps', 'wishes', 'gift', 'footer']), defaultColors: JSON.stringify({ primaryColor: '#E67E9F', secondaryColor: '#FFF0F5' }) },
  { name: 'Batak Tradition', category: 'Adat', thumbnailUrl: null, isPremium: true, sectionsConfig: JSON.stringify(['hero', 'couple', 'events', 'gallery', 'maps', 'wishes', 'gift', 'footer']), defaultColors: JSON.stringify({ primaryColor: '#8B0000', secondaryColor: '#FFF3E0' }) },
  { name: 'Javanese Classic', category: 'Adat', thumbnailUrl: null, isPremium: true, sectionsConfig: JSON.stringify(['hero', 'couple', 'events', 'gallery', 'rsvp', 'maps', 'wishes', 'gift', 'footer']), defaultColors: JSON.stringify({ primaryColor: '#8B6914', secondaryColor: '#FFF8E1' }) },
  { name: 'Sundanese Heritage', category: 'Adat', thumbnailUrl: null, isPremium: false, sectionsConfig: JSON.stringify(['hero', 'couple', 'events', 'gallery', 'rsvp', 'maps', 'wishes', 'gift', 'footer']), defaultColors: JSON.stringify({ primaryColor: '#4A6741', secondaryColor: '#F1F8E9' }) },
  { name: 'Bali Elegance', category: 'Adat', thumbnailUrl: null, isPremium: true, sectionsConfig: JSON.stringify(['hero', 'couple', 'events', 'gallery', 'rsvp', 'maps', 'wishes', 'gift', 'footer']), defaultColors: JSON.stringify({ primaryColor: '#C49000', secondaryColor: '#FFF8E1' }) },
  { name: 'Modern Dark', category: 'Modern', thumbnailUrl: null, isPremium: false, sectionsConfig: JSON.stringify(['hero', 'couple', 'events', 'gallery', 'rsvp', 'maps', 'wishes', 'gift', 'footer']), defaultColors: JSON.stringify({ primaryColor: '#D4A574', secondaryColor: '#1A1A2E' }) },
  { name: 'Eternal Love', category: 'Elegan', thumbnailUrl: null, isPremium: false, sectionsConfig: JSON.stringify(['hero', 'couple', 'events', 'gallery', 'rsvp', 'maps', 'wishes', 'gift', 'footer']), defaultColors: JSON.stringify({ primaryColor: '#9B59B6', secondaryColor: '#F3E5F5' }) },
  { name: 'Beach Sunset', category: 'Modern', thumbnailUrl: null, isPremium: false, sectionsConfig: JSON.stringify(['hero', 'couple', 'events', 'gallery', 'rsvp', 'maps', 'wishes', 'gift', 'footer']), defaultColors: JSON.stringify({ primaryColor: '#FF6B35', secondaryColor: '#FFF3E0' }) },
  { name: 'Navy & Gold', category: 'Elegan', thumbnailUrl: null, isPremium: true, sectionsConfig: JSON.stringify(['hero', 'couple', 'events', 'gallery', 'rsvp', 'maps', 'wishes', 'gift', 'footer']), defaultColors: JSON.stringify({ primaryColor: '#1A237E', secondaryColor: '#E8EAF6' }) },
  { name: 'Woodland Dream', category: 'Rustic', thumbnailUrl: null, isPremium: false, sectionsConfig: JSON.stringify(['hero', 'couple', 'events', 'gallery', 'rsvp', 'wishes', 'gift', 'footer']), defaultColors: JSON.stringify({ primaryColor: '#5D4037', secondaryColor: '#EFEBE9' }) },
  { name: 'Diamond Edition', category: 'Elegan', thumbnailUrl: null, isPremium: true, sectionsConfig: JSON.stringify(['hero', 'couple', 'events', 'gallery', 'rsvp', 'maps', 'wishes', 'gift', 'footer']), defaultColors: JSON.stringify({ primaryColor: '#455A64', secondaryColor: '#ECEFF1' }) },
]

  for (const theme of themes) {
    await prisma.theme.create({ data: theme })
  }
  console.log(`✅ Seeded ${themes.length} themes`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
