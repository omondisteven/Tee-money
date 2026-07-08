💰 TeeMoney - Personal Finance Manager
<div align="center">
Smart Financial Management at Your Fingertips
</div>
📱 About TeeMoney
<p />
TeeMoney is a modern, mobile-responsive personal finance management application built with Next.js. It helps you track your income, expenses, budgets, and financial goals with an intuitive and beautiful interface.
<p />
✨ Key Features
💰 All-in-one Money Tracker - Record income and daily expenses by category for accurate financial insights
<p />
📊 Budget Planner & Tracker - Set spending limits, monitor budgets, and view progress with charts & graphs
<p />
🎯 Savings & Goal Planner - Track savings growth, set financial goals, and stay motivated
<p />
📈 Personal Finance & Cash Flow Manager - Understand your income vs. expenses to improve financial health
<p />
⚡ Quick & Easy Expense Tracker - Log daily spending in seconds with a clean, user-friendly interface
<p />
🔐 Secure Authentication - JWT-based authentication with bcrypt password hashing
<p />
📱 Mobile-First Design - Optimized for mobile devices with a responsive layout
<p />
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

<strong>🏗️ Project Structure<strong/>
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

<p />
🛠️ Installation
<p />
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
<p />
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