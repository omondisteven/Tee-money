const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

const defaultCategories = {
  INCOME: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'],
  EXPENSE: ['Food', 'Transport', 'Shopping', 'Utilities', 'Rent', 'Healthcare', 'Entertainment', 'Education', 'Other'],
}

async function main() {
  console.log('Starting seed...')

  const hashedPassword = await bcrypt.hash('password123', 10)

  // Create or update demo user
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      password: hashedPassword,
      name: 'Demo User',
    },
  })

  console.log(`User created/updated: ${user.email}`)

  // Create default categories for the user
  let categoryCount = 0
  for (const [type, categories] of Object.entries(defaultCategories)) {
    for (const name of categories) {
      try {
        await prisma.category.upsert({
          where: {
            userId_name_type: {
              userId: user.id,
              name,
              type: type,
            },
          },
          update: {},
          create: {
            name,
            type: type,
            userId: user.id,
            isDefault: true,
          },
        })
        categoryCount++
      } catch (error) {
        console.error(`Error creating category ${name}:`, error.message)
      }
    }
  }

  console.log(`Created ${categoryCount} default categories`)
  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })