<!-- README.md -->

<h1 align="center">
  💰 TeeMoney - Personal Finance Manager
</h1>

<h4 align="center">
  Smart Financial Management at Your Fingertips
</h4>

<p align="center">
  <a href="https://nextjs.org/">
    <img src="https://img.shields.io/badge/Next.js-14.0-black?style=flat-square&logo=next.js" alt="Next.js">
  </a>
  <a href="https://www.prisma.io/">
    <img src="https://img.shields.io/badge/Prisma-7.x-2D3748?style=flat-square&logo=prisma" alt="Prisma">
  </a>
  <a href="https://tailwindcss.com/">
    <img src="https://img.shields.io/badge/Tailwind-3.x-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind CSS">
  </a>
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript" alt="TypeScript">
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License">
  </a>
</p>

<p align="center">
  <a href="#-about-teemoney">About</a> •
  <a href="#-key-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-contributing">Contributing</a> •
  <a href="#-license">License</a>
</p>

---

# 📱 About TeeMoney

**TeeMoney** is a modern, mobile-responsive personal finance management application built with **Next.js**. It helps you track your income, expenses, budgets, and financial goals with an intuitive and beautiful interface.

🔗 **GitHub Repository:**  
https://github.com/omondisteven/Tee-money

---

# ✨ Key Features

| Feature | Description |
|---------|-------------|
| 💰 **All-in-one Money Tracker** | Record income and daily expenses by category for accurate financial insights. |
| 📊 **Budget Planner & Tracker** | Set spending limits, monitor budgets, and visualize progress with charts and graphs. |
| 🎯 **Savings & Goal Planner** | Track savings growth, set financial goals, and stay motivated. |
| 📈 **Cash Flow Manager** | Understand income versus expenses to improve financial health. |
| ⚡ **Quick Expense Tracker** | Log daily spending in seconds with a clean, user-friendly interface. |
| 🔐 **Secure Authentication** | JWT-based authentication with bcrypt password hashing. |
| 📱 **Mobile-First Design** | Fully responsive layout optimized for desktop, tablet, and mobile devices. |

---

# 🚀 Tech Stack

<details>
<summary><strong>Frontend</strong></summary>

- Next.js 14
- TypeScript
- Tailwind CSS
- Chart.js
- React Icons

</details>

<details>
<summary><strong>Backend</strong></summary>

- Next.js API Routes
- Prisma ORM
- PostgreSQL
- JWT Authentication
- bcryptjs

</details>

<details>
<summary><strong>Libraries & Tools</strong></summary>

- React Hook Form
- React Toastify
- Zod
- React Responsive

</details>

---

# 🏗️ Project Structure

```text
teemoney/
├── src/
│   ├── app/
│   │   ├── (protected)/           # Protected routes
│   │   │   ├── dashboard/
│   │   │   ├── transactions/
│   │   │   ├── budgets/
│   │   │   └── goals/
│   │   ├── api/                   # API routes
│   │   │   ├── auth/
│   │   │   ├── transactions/
│   │   │   ├── budgets/
│   │   │   └── goals/
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── components/                # Reusable UI components
│   │   ├── layout/
│   │   ├── transactions/
│   │   ├── budgets/
│   │   └── goals/
│   ├── lib/                       # Core libraries & utilities
│   │   ├── prisma.ts
│   │   ├── jwt.ts
│   │   └── auth.ts
│   ├── types/                     # TypeScript type definitions
│   └── utils/                     # Helper functions
├── prisma/
│   ├── schema.prisma              # Database schema
│   └── seed.ts                    # Database seed script
├── .env.local                     # Environment variables
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

### 📂 Folder Overview

| Folder/File | Purpose |
|--------------|---------|
| **src/app** | Next.js App Router pages, layouts and API routes |
| **src/app/(protected)** | Authenticated pages requiring user login |
| **src/components** | Reusable React UI components |
| **src/lib** | Database, authentication and shared application logic |
| **src/types** | Shared TypeScript interfaces and types |
| **src/utils** | Utility and helper functions |
| **prisma/schema.prisma** | Prisma database schema and models |
| **prisma/seed.ts** | Database seed script for sample data |
| **.env.local** | Local environment configuration |
| **package.json** | Project dependencies and scripts |

---

# 🛠 Installation

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or Yarn

## 1. Clone the repository

```bash
git clone https://github.com/omondisteven/Tee-money.git
cd Tee-money
```

## 2. Install dependencies

```bash
npm install
```

## 3. Configure environment variables

```bash
cp .env.example .env.local
```

Edit **.env.local**

```env
TM_PRISMA_DATABASE_URL="postgresql://username:password@localhost:5432/teemoney"
JWT_SECRET="your-super-secret-jwt-key"
```

## 4. Set up the database

Create the database:

```bash
createdb teemoney
```

Push the schema:

```bash
npx prisma db push
```

Generate the Prisma Client:

```bash
npx prisma generate
```

(Optional) Seed the database:

```bash
npm run db:seed
```

## 5. Start the development server

```bash
npm run dev
```

## 6. Open the application

Visit:

```
http://localhost:3000
```

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository.
2. Create your feature branch.

```bash
git checkout -b feature/AmazingFeature
```

3. Commit your changes.

```bash
git commit -m "Add some AmazingFeature"
```

4. Push to your branch.

```bash
git push origin feature/AmazingFeature
```

5. Open a Pull Request.

---

# 📝 License

This project is licensed under the **MIT License**. See the **LICENSE** file for details.

---

# 👨‍💻 Developer

**Steven Omondi**

📧 Email: omondisteven@gmail.com

🐙 GitHub: https://github.com/omondisteven

---

# 🙏 Acknowledgments

- Next.js for the amazing React framework.
- Prisma for the excellent ORM.
- Tailwind CSS for the utility-first CSS framework.
- Chart.js for beautiful charts.
- Everyone who contributes to making this project better.

---

<p align="center">
  <strong>Made with ❤️ by Steven Omondi</strong>

  <br><br>

  <a href="https://github.com/omondisteven/Tee-money/issues">🐞 Report Bug</a>
  &nbsp; | &nbsp;
  <a href="https://github.com/omondisteven/Tee-money/issues">✨ Request Feature</a>

  <br><br>

  ⭐ If you find this project useful, please consider starring the repository!
</p>