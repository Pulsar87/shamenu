import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create a test restaurant
  const restaurant = await prisma.restaurant.upsert({
    where: { slug: 'test-restaurant' },
    update: {},
    create: {
      name: 'Test Restaurant',
      slug: 'test-restaurant',
      timezone: 'America/New_York',
      currency: 'USD',
      address: '123 Main St, New York, NY 10001',
      phone: '+1-555-123-4567',
      website: 'https://example.com',
      hours: {
        monday: { open: '09:00', close: '22:00' },
        tuesday: { open: '09:00', close: '22:00' },
        wednesday: { open: '09:00', close: '22:00' },
        thursday: { open: '09:00', close: '22:00' },
        friday: { open: '09:00', close: '23:00' },
        saturday: { open: '10:00', close: '23:00' },
        sunday: { open: '10:00', close: '21:00' }
      },
      settings: {
        taxRate: 0.08,
        tipDefaults: [10, 15, 20],
        notificationsEnabled: true
      }
    }
  })

  console.log('Created restaurant:', restaurant.name)

  // Create owner user
  const hashedPassword = await hash('password123', 10)
  
  const owner = await prisma.user.upsert({
    where: { email: 'owner@example.com' },
    update: {},
    create: {
      email: 'owner@example.com',
      name: 'Restaurant Owner',
      role: 'OWNER',
      restaurantId: restaurant.id
    }
  })

  console.log('Created owner user:', owner.email)

  // Create manager user
  const manager = await prisma.user.upsert({
    where: { email: 'manager@example.com' },
    update: {},
    create: {
      email: 'manager@example.com',
      name: 'Restaurant Manager',
      role: 'MANAGER',
      restaurantId: restaurant.id
    }
  })

  console.log('Created manager user:', manager.email)

  // Create kitchen staff
  const kitchenStaff = await prisma.user.upsert({
    where: { email: 'kitchen@example.com' },
    update: {},
    create: {
      email: 'kitchen@example.com',
      name: 'Kitchen Staff',
      role: 'KITCHEN',
      restaurantId: restaurant.id
    }
  })

  console.log('Created kitchen staff:', kitchenStaff.email)

  // Create categories
  const appetizers = await prisma.category.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Appetizers',
      sortOrder: 1,
      image: 'https://images.unsplash.com/photo-1541544744-378ca6f001c9?w=400'
    }
  })

  const mains = await prisma.category.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Main Courses',
      sortOrder: 2,
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400'
    }
  })

  const desserts = await prisma.category.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Desserts',
      sortOrder: 3,
      image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400'
    }
  })

  const drinks = await prisma.category.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Beverages',
      sortOrder: 4,
      image: 'https://images.unsplash.com/photo-1470337458703-46ad1737a35f?w=400'
    }
  })

  console.log('Created categories')

  // Create menu items
  await prisma.menuItem.createMany({
    data: [
      {
        categoryId: appetizers.id,
        restaurantId: restaurant.id,
        name: 'Bruschetta',
        description: 'Toasted bread topped with fresh tomatoes, basil, garlic, and olive oil',
        priceCents: 899,
        imageUrl: 'https://images.unsplash.com/photo-1572695157363-bc31c5d4ef4b?w=400',
        isAvailable: true,
        isFeatured: true,
        allergens: ['gluten'],
        prepTimeMin: 10,
        sortOrder: 1
      },
      {
        categoryId: appetizers.id,
        restaurantId: restaurant.id,
        name: 'Calamari',
        description: 'Crispy fried squid rings served with marinara sauce and lemon',
        priceCents: 1299,
        imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400',
        isAvailable: true,
        isFeatured: false,
        allergens: ['seafood', 'gluten'],
        prepTimeMin: 15,
        sortOrder: 2
      },
      {
        categoryId: mains.id,
        restaurantId: restaurant.id,
        name: 'Grilled Salmon',
        description: 'Fresh Atlantic salmon with seasonal vegetables and lemon butter sauce',
        priceCents: 2499,
        imageUrl: 'https://images.unsplash.com/photo-1467003909585-fac80ca77c03?w=400',
        isAvailable: true,
        isFeatured: true,
        allergens: ['fish'],
        prepTimeMin: 20,
        sortOrder: 1
      },
      {
        categoryId: mains.id,
        restaurantId: restaurant.id,
        name: 'Ribeye Steak',
        description: '12oz prime ribeye with garlic mashed potatoes and grilled asparagus',
        priceCents: 3499,
        imageUrl: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400',
        isAvailable: true,
        isFeatured: true,
        allergens: [],
        prepTimeMin: 25,
        sortOrder: 2
      },
      {
        categoryId: mains.id,
        restaurantId: restaurant.id,
        name: 'Margherita Pizza',
        description: 'Classic pizza with San Marzano tomato sauce, fresh mozzarella, and basil',
        priceCents: 1699,
        imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
        isAvailable: true,
        isFeatured: false,
        allergens: ['gluten', 'dairy'],
        prepTimeMin: 15,
        sortOrder: 3
      },
      {
        categoryId: desserts.id,
        restaurantId: restaurant.id,
        name: 'Tiramisu',
        description: 'Classic Italian dessert with espresso-soaked ladyfingers and mascarpone',
        priceCents: 899,
        imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400',
        isAvailable: true,
        isFeatured: true,
        allergens: ['gluten', 'dairy', 'eggs'],
        prepTimeMin: 5,
        sortOrder: 1
      },
      {
        categoryId: desserts.id,
        restaurantId: restaurant.id,
        name: 'Chocolate Lava Cake',
        description: 'Warm chocolate cake with molten center, served with vanilla ice cream',
        priceCents: 999,
        imageUrl: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400',
        isAvailable: true,
        isFeatured: false,
        allergens: ['gluten', 'dairy', 'eggs'],
        prepTimeMin: 12,
        sortOrder: 2
      },
      {
        categoryId: drinks.id,
        restaurantId: restaurant.id,
        name: 'Fresh Lemonade',
        description: 'House-made lemonade with fresh mint',
        priceCents: 499,
        imageUrl: 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f66?w=400',
        isAvailable: true,
        isFeatured: false,
        allergens: [],
        prepTimeMin: 5,
        sortOrder: 1
      },
      {
        categoryId: drinks.id,
        restaurantId: restaurant.id,
        name: 'Iced Coffee',
        description: 'Cold brew coffee served over ice',
        priceCents: 399,
        imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b5dd7359?w=400',
        isAvailable: true,
        isFeatured: false,
        allergens: [],
        prepTimeMin: 3,
        sortOrder: 2
      }
    ]
  })

  console.log('Created menu items')

  // Create tables
  const tables = []
  for (let i = 1; i <= 10; i++) {
    const table = await prisma.table.create({
      data: {
        restaurantId: restaurant.id,
        number: `${i}`,
        seats: i <= 4 ? 4 : 6,
        zone: i <= 5 ? 'Main Hall' : 'Patio',
        qrToken: `table-${restaurant.id}-${i}-${Date.now()}`
      }
    })
    tables.push(table)
  }

  console.log('Created 10 tables')

  // Create sample reviews
  await prisma.review.createMany({
    data: [
      {
        restaurantId: restaurant.id,
        customerName: 'John D.',
        rating: 5,
        text: 'Amazing food and great service! The salmon was perfectly cooked.',
        images: []
      },
      {
        restaurantId: restaurant.id,
        customerName: 'Sarah M.',
        rating: 4,
        text: 'Lovely atmosphere and delicious dishes. Will definitely come back!',
        images: []
      },
      {
        restaurantId: restaurant.id,
        customerName: 'Mike R.',
        rating: 5,
        text: 'Best pizza in town! The tiramisu is also a must-try.',
        images: []
      }
    ]
  })

  console.log('Created sample reviews')
  console.log('\n✅ Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
