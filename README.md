💰 TeeMoney - Personal Finance Manager
<div align="center">
https://img.shields.io/badge/TeeMoney-Personal%2520Finance-blue?style=for-the-badge&logo=next.js

Smart Financial Management at Your Fingertips

https://img.shields.io/badge/Next.js-14.0-black?style=flat-square&logo=next.js
https://img.shields.io/badge/Prisma-7.x-2D3748?style=flat-square&logo=prisma
https://img.shields.io/badge/Tailwind-3.x-38B2AC?style=flat-square&logo=tailwind-css
https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript
https://img.shields.io/badge/License-MIT-green?style=flat-square

Live Demo · Report Bug · Request Feature

</div>
📱 About TeeMoney
TeeMoney is a modern, mobile-responsive personal finance management application built with Next.js. It helps you track your income, expenses, budgets, and financial goals with an intuitive and beautiful interface.

✨ Key Features
💰 All-in-one Money Tracker - Record income and daily expenses by category for accurate financial insights

📊 Budget Planner & Tracker - Set spending limits, monitor budgets, and view progress with charts & graphs

🎯 Savings & Goal Planner - Track savings growth, set financial goals, and stay motivated

📈 Personal Finance & Cash Flow Manager - Understand your income vs. expenses to improve financial health

⚡ Quick & Easy Expense Tracker - Log daily spending in seconds with a clean, user-friendly interface

🔐 Secure Authentication - JWT-based authentication with bcrypt password hashing

📱 Mobile-First Design - Optimized for mobile devices with a responsive layout

🚀 Tech Stack
Frontend
Next.js 14 - React framework with App Router

TypeScript - Type-safe JavaScript

Tailwind CSS - Utility-first CSS framework

Chart.js - Interactive charts and graphs

React Icons - Beautiful icon library

Backend
Next.js API Routes - Serverless API endpoints

Prisma ORM - Type-safe database client

PostgreSQL - Relational database

JWT - JSON Web Tokens for authentication

bcryptjs - Password hashing

Libraries & Tools
React Hook Form - Form handling

React Toastify - Toast notifications

Zod - Schema validation

React Responsive - Responsive design utilities

📸 Screenshots
<div align="center">
Dashboard	Transactions	Budgets
https://screenshots/dashboard.png	https://screenshots/transactions.png	https://screenshots/budgets.png
</div>
🏗️ Project Structure
text
teemoney/
├── src/
│   ├── app/
│   │   ├── (protected)/        # Protected routes
│   │   │   ├── dashboard/
│   │   │   ├── transactions/
│   │   │   ├── budgets/
│   │   │   └── goals/
│   │   ├── api/                # API routes
│   │   │   ├── auth/
│   │   │   ├── transactions/
│   │   │   ├── budgets/
│   │   │   └── goals/
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── components/             # Reusable components
│   │   ├── layout/
│   │   ├── transactions/
│   │   ├── budgets/
│   │   └── goals/
│   ├── lib/                    # Utilities
│   │   ├── prisma.ts
│   │   ├── jwt.ts
│   │   └── auth.ts
│   ├── types/                  # TypeScript types
│   └── utils/                  # Helper functions
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed data
├── .env.local                  # Environment variables
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
🛠️ Installation
Prerequisites
Node.js 18+

PostgreSQL 14+

npm or yarn

Step-by-Step Setup
Clone the repository

bash
git clone https://github.com/yourusername/teemoney.git
cd teemoney
Install dependencies

bash
npm install
Set up environment variables

bash
cp .env.example .env.local
Then edit .env.local with your credentials:

env
DATABASE_URL="postgresql://username:password@localhost:5432/teemoney"
JWT_SECRET="your-super-secret-jwt-key"
Set up the database

bash
# Create the database
createdb teemoney

# Push the schema
npx prisma db push

# Generate Prisma client
npx prisma generate

# (Optional) Seed the database
npm run db:seed
Run the development server

bash
npm run dev
Open the application
Visit http://localhost:3000

📦 Available Scripts
Command	Description
npm run dev	Start development server
npm run build	Build for production
npm start	Start production server
npm run lint	Run ESLint
npx prisma studio	Open Prisma Studio
npx prisma db push	Push schema to database
npm run db:seed	Seed the database
npm run db:generate	Generate Prisma client
🗄️ Database Schema
User
prisma
model User {
  id           String         @id @default(cuid())
  email        String         @unique
  password     String
  name         String
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
  transactions Transaction[]
  budgets      Budget[]
  goals        Goal[]
}
Transaction
prisma
model Transaction {
  id          String         @id @default(cuid())
  userId      String
  user        User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  type        TransactionType // INCOME or EXPENSE
  category    String
  amount      Float
  description String?
  date        DateTime       @default(now())
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
}
Budget
prisma
model Budget {
  id          String         @id @default(cuid())
  userId      String
  user        User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  category    String
  amount      Float          // Budget limit
  spent       Float          @default(0) // Amount spent
  month       Int            @default(0) // 0-11
  year        Int
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
}
Goal
prisma
model Goal {
  id           String         @id @default(cuid())
  userId       String
  user         User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  name         String
  targetAmount Float
  currentAmount Float          @default(0)
  deadline     DateTime
  icon         String?         @default("🎯")
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt
}
🔒 Authentication
The application uses JWT-based authentication:

Registration - New users register with email, name, and password

Login - Users log in with email and password

Session Management - JWT tokens stored in HTTP-only cookies

Protected Routes - All routes except login and register are protected

🌐 API Endpoints
Authentication
Endpoint	Method	Description
/api/auth/register	POST	Register a new user
/api/auth/login	POST	Login user
/api/auth/me	GET	Get current user
/api/auth/logout	POST	Logout user
Transactions
Endpoint	Method	Description
/api/transactions	GET	Get all transactions
/api/transactions	POST	Create a transaction
/api/transactions/{id}	PUT	Update transaction
/api/transactions/{id}	DELETE	Delete transaction
Budgets
Endpoint	Method	Description
/api/budgets	GET	Get all budgets
/api/budgets	POST	Create/update budget
/api/budgets/{id}	DELETE	Delete budget
Goals
Endpoint	Method	Description
/api/goals	GET	Get all goals
/api/goals	POST	Create a goal
/api/goals/{id}	PUT	Update goal progress
/api/goals/{id}	DELETE	Delete goal
Dashboard
Endpoint	Method	Description
/api/dashboard	GET	Get dashboard summary
🎨 Contributing
Contributions are welcome! Please follow these steps:

Fork the repository

Create a feature branch (git checkout -b feature/AmazingFeature)

Commit your changes (git commit -m 'Add some AmazingFeature')

Push to the branch (git push origin feature/AmazingFeature)

Open a Pull Request

📝 License
This project is licensed under the MIT License - see the LICENSE file for details.

👨‍💻 Developer
Steven Omondi

Email: omondisteven@gmail.com

GitHub: @stevenomondi

🙏 Acknowledgments
Next.js for the amazing React framework

Prisma for the excellent ORM

Tailwind CSS for the utility-first CSS framework

Chart.js for the beautiful charts

All contributors who help make this project better

<div align="center">
Made with ❤️ by Steven Omondi

Report Bug · Request Feature

⭐ Star this project if you find it useful!

</div>