import bcrypt from 'bcryptjs'
import { prisma } from './db.js'

async function seed() {
  const passwordAdmin = await bcrypt.hash('admin1234', 10)
  const passwordCashier = await bcrypt.hash('cashier1234', 10)

  const [coffee, coldDrinks, tea, desserts, snacks] = await Promise.all([
    prisma.categories.upsert({ where: { name: 'Coffee' }, update: {}, create: { name: 'Coffee' } }),
    prisma.categories.upsert({ where: { name: 'Cold Drinks' }, update: {}, create: { name: 'Cold Drinks' } }),
    prisma.categories.upsert({ where: { name: 'Tea' }, update: {}, create: { name: 'Tea' } }),
    prisma.categories.upsert({ where: { name: 'Desserts' }, update: {}, create: { name: 'Desserts' } }),
    prisma.categories.upsert({ where: { name: 'Snacks' }, update: {}, create: { name: 'Snacks' } })
  ])

  await prisma.users.upsert({
    where: { email: 'admin@coffee.local' },
    update: { passwordHash: passwordAdmin, role: 'ADMIN', active: true, name: 'Admin User' },
    create: { email: 'admin@coffee.local', passwordHash: passwordAdmin, role: 'ADMIN', active: true, name: 'Admin User' }
  })

  await prisma.users.upsert({
    where: { email: 'cashier@coffee.local' },
    update: { passwordHash: passwordCashier, role: 'CASHIER', active: true, name: 'Cashier User' },
    create: { email: 'cashier@coffee.local', passwordHash: passwordCashier, role: 'CASHIER', active: true, name: 'Cashier User' }
  })

  const products = [
    { name: 'Espresso', price: 2.5, stock: 120, categoryId: coffee.id },
    { name: 'Cappuccino', price: 3.8, stock: 90, categoryId: coffee.id },
    { name: 'Iced Latte', price: 4.2, stock: 80, categoryId: coldDrinks.id },
    { name: 'Green Tea', price: 2.9, stock: 60, categoryId: tea.id },
    { name: 'Cheesecake Slice', price: 5.4, stock: 40, categoryId: desserts.id },
    { name: 'Croissant', price: 3.1, stock: 65, categoryId: snacks.id }
  ]

  for (const product of products) {
    const created = await prisma.products.upsert({
      where: { id: `seed-${product.name.toLowerCase().replace(/\s+/g, '-')}` },
      update: {
        name: product.name,
        categoryId: product.categoryId,
        price: product.price,
        stock: product.stock,
        unavailable: false
      },
      create: {
        id: `seed-${product.name.toLowerCase().replace(/\s+/g, '-')}`,
        name: product.name,
        categoryId: product.categoryId,
        price: product.price,
        stock: product.stock,
        unavailable: false,
        imageUrl: ''
      }
    })

    await prisma.inventory.upsert({
      where: { productId: created.id },
      update: { quantity: product.stock },
      create: { productId: created.id, quantity: product.stock }
    })
  }

  const existing = await prisma.settings.findFirst()
  if (existing) {
    await prisma.settings.update({
      where: { id: existing.id },
      data: {
        shopName: 'BrewPoint Café',
        taxPercentage: 10,
        currency: 'USD',
        receiptFooter: 'Thank you for visiting BrewPoint Café!',
        language: 'en'
      }
    })
  } else {
    await prisma.settings.create({
      data: {
        shopName: 'BrewPoint Café',
        taxPercentage: 10,
        currency: 'USD',
        receiptFooter: 'Thank you for visiting BrewPoint Café!',
        language: 'en'
      }
    })
  }

  console.log('Seed completed.')
}

seed()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
