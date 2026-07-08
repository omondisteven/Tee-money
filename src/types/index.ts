export interface User {
  id: string
  email: string
  name: string
  createdAt: Date
}

export interface Transaction {
  id: string
  userId: string
  type: 'INCOME' | 'EXPENSE'
  category: string
  amount: number
  description?: string
  date: Date
  createdAt: Date
}

export interface Budget {
  id: string
  userId: string
  category: string
  amount: number
  spent: number
  month: number
  year: number
}

export interface Goal {
  id: string
  userId: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: Date
  icon?: string
}

export interface TransactionFormData {
  type: 'INCOME' | 'EXPENSE'
  category: string
  amount: number
  description?: string
  date: Date
}

export interface BudgetFormData {
  category: string
  amount: number
}

export interface GoalFormData {
  name: string
  targetAmount: number
  deadline: Date
  icon?: string
}