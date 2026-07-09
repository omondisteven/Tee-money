const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

const defaultCategories = {
  INCOME: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'],
  EXPENSE: ['Food', 'Transport', 'Shopping', 'Utilities', 'Rent', 'Healthcare', 'Entertainment', 'Education', 'Other'],
}

async function main() {
  console.log('Starting seed in APPEND mode...')

  // 1. Create or update demo user
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {
      // Only update name if it's different
      name: 'Demo User',
    },
    create: {
      email: 'demo@example.com',
      password: hashedPassword,
      name: 'Demo User',
    },
  })

  console.log(`User: ${user.email} (ID: ${user.id})`)

  // 2. Append default categories without duplicates
  let createdCount = 0
  let skippedCount = 0

  for (const [type, categories] of Object.entries(defaultCategories)) {
    for (const name of categories) {
      try {
        // Check if category already exists for this user
        const existing = await prisma.category.findFirst({
          where: {
            userId: user.id,
            name: name,
            type: type,
          },
        })

        if (existing) {
          // Category exists - skip it
          skippedCount++
          console.log(`  ⏭️ Skipping existing: ${type} / ${name}`)
          continue
        }

        // Category doesn't exist - create it
        await prisma.category.create({
          data: {
            name,
            type: type,
            userId: user.id,
            isDefault: true,
          },
        })
        createdCount++
        console.log(`  ✅ Created: ${type} / ${name}`)
      } catch (error) {
        console.error(`  ❌ Error creating category ${name}:`, error.message)
      }
    }
  }

  console.log(`\n📊 Summary:`)
  console.log(`  ✅ Created: ${createdCount} categories`)
  console.log(`  ⏭️  Skipped: ${skippedCount} existing categories`)
  console.log('✨ Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })