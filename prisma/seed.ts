// // prisma\seed.ts
// import { PrismaClient } from '@prisma/client'
// import bcrypt from 'bcryptjs'

// const prisma = new PrismaClient()

// const defaultCategories = {
//   INCOME: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'],
//   EXPENSE: ['Food', 'Transport', 'Shopping', 'Utilities', 'Rent', 'Healthcare', 'Entertainment', 'Education', 'Other'],
// }

// async function main() {
//   const hashedPassword = await bcrypt.hash('password123', 10)

//   const user = await prisma.user.upsert({
//     where: { email: 'demo@example.com' },
//     update: {},
//     create: {
//       email: 'demo@example.com',
//       password: hashedPassword,
//       name: 'Demo User',
//     },
//   })

//   console.log({ user })

//   // Create default categories for the user
//   for (const [type, categories] of Object.entries(defaultCategories)) {
//     for (const name of categories) {
//       await prisma.category.upsert({
//         where: {
//           userId_name_type: {
//             userId: user.id,
//             name,
//             type: type as 'INCOME' | 'EXPENSE',
//           },
//         },
//         update: {},
//         create: {
//           name,
//           type: type as 'INCOME' | 'EXPENSE',
//           userId: user.id,
//           isDefault: true,
//         },
//       })
//     }
//   }

//   console.log('Default categories created')
// }

// main()
//   .catch((e) => {
//     console.error(e)
//     process.exit(1)
//   })
//   .finally(async () => {
//     await prisma.$disconnect()
//   })