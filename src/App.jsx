import { startTransition, useDeferredValue, useEffect, useRef, useState } from 'react'
import './App.css'

const API_BASE_URL = '/api'
const SESSION_KEY = 'spendsmart.session'
const USERS_KEY = 'spendsmart.known-users'
const THEME_KEY = 'spendsmart.theme'

const userNavItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'expenses', label: 'Expenses' },
  { id: 'income', label: 'Income' },
  { id: 'categories', label: 'Categories' },
  { id: 'budgets', label: 'Budgets' },
  { id: 'recurring', label: 'Recurring' },
  { id: 'profile', label: 'Profile' },
]

const adminNavItems = [
  { id: 'dashboard', label: 'Overview' },
  { id: 'users', label: 'Users' },
  { id: 'transactions', label: 'Transactions' },
  { id: 'broadcast', label: 'Broadcast' },
  { id: 'audit', label: 'Audit Logs' },
]

const paymentMethods = ['CASH', 'CARD', 'UPI', 'BANK', 'WALLET']
const expenseTypes = ['EXPENSE', 'SPLIT']
const categoryTypes = ['EXPENSE', 'INCOME']
const recurringTypes = ['EXPENSE', 'INCOME']
const recurringFrequencies = ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']
const incomeSources = ['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Other']
const supportedCurrencies = ['INR', 'USD', 'EUR', 'GBP']
const timezoneOptions = [
  { id: 'asia', label: 'Asia', value: 'Asia/Kolkata' },
  { id: 'africa', label: 'Africa', value: 'Africa/Cairo' },
  { id: 'north-america', label: 'North America', value: 'America/New_York' },
  { id: 'south-america', label: 'South America', value: 'America/Sao_Paulo' },
  { id: 'antarctica', label: 'Antarctica', value: 'Antarctica/McMurdo' },
  { id: 'europe', label: 'Europe', value: 'Europe/London' },
  { id: 'australia', label: 'Australia', value: 'Australia/Sydney' },
]
const passwordPolicy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/
const emailPolicy = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const authFeatureHighlights = [
  {
    key: 'income',
    title: 'INCOME TRACKING',
    description: 'Track salary and side income in one place.',
  },
  {
    key: 'expense',
    title: 'EXPENSE TRACKING',
    description: 'Log and categorize expenses effortlessly.',
  },
  {
    key: 'budget',
    title: 'SMART BUDGETS',
    description: 'Set focused limits and stay in control.',
  },
  {
    key: 'recurring',
    title: 'RECURRING FLOWS',
    description: 'Automate recurring income and expenses.',
  },
]

function renderAuthFeatureIcon(type) {
  if (type === 'income') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 16h3v3H4v-3Zm6-5h3v8h-3v-8Zm6-3h3v11h-3V8Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="m4 12 4-4 3 3 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (type === 'expense') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 7.5 12 4l9 3.5v9L12 20l-9-3.5v-9Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8.5 10.5h7m-7 3h4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    )
  }

  if (type === 'budget') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 4a8 8 0 1 0 8 8" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 12 17.5 8.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 7h8m-8 10h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16 7a4.5 4.5 0 0 1 0 9M8 17a4.5 4.5 0 0 1 0-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

const emptyExpenseForm = {
  expenseId: null,
  title: '',
  amount: '',
  categoryId: '',
  date: todayInput(),
  paymentMethod: 'UPI',
  type: 'EXPENSE',
  notes: '',
  receiptUrl: '',
  isRecurring: false,
  recurringFrequency: 'MONTHLY',
}

const emptyIncomeForm = {
  incomeId: null,
  source: 'Salary',
  amount: '',
  date: todayInput(),
  notes: '',
  isRecurring: false,
  recurringFrequency: 'MONTHLY',
}

const emptyCategoryForm = {
  categoryId: null,
  name: '',
  type: 'EXPENSE',
  icon: '•',
  color: '#1f7a5c',
}

const emptyBudgetForm = {
  budgetId: null,
  monthlyLimit: '',
  currency: 'INR',
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
}

const emptyRecurringForm = {
  id: null,
  title: '',
  amount: '',
  type: 'EXPENSE',
  categoryId: '',
  frequency: 'MONTHLY',
  startDate: todayInput(),
}

const emptyAuthForm = {
  fullName: '',
  email: '',
  password: '',
  otp: '',
}

const emptyProfileForm = {
  currency: 'INR',
  timezone: 'Asia/Kolkata',
  timezoneChoice: 'asia',
  monthlyBudget: '',
}

const emptyBroadcastForm = {
  title: '',
  message: '',
}

const defaultRecurringAccess = {
  active: false,
  validUntil: null,
  message: 'Recurring access requires payment.',
}

function emptySession() {
  return {
    token: '',
    email: '',
    fullName: '',
    userId: '',
    currency: 'INR',
    timezone: defaultTimezone(),
    monthlyBudget: '',
    role: 'user',
  }
}

function normalizeStoredSession(session) {
  const fallback = emptySession()

  if (!session || session.role === 'admin') {
    return fallback
  }

  return {
    ...fallback,
    ...session,
    role: session.role || 'user',
  }
}

function ignoreNonAuthError(fallback) {
  return (error) => {
    if (error.status === 401 || error.status === 403) {
      throw error
    }

    return fallback
  }
}

function todayInput() {
  return new Date().toISOString().slice(0, 10)
}

function safeParse(storageKey, fallback) {
  try {
    const raw = window.localStorage.getItem(storageKey)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function toNumber(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function toLocalDateTime(dateValue) {
  return `${dateValue}T12:00:00`
}

function fromApiDate(dateValue) {
  return formatDateOnly(dateValue)
}

function formatDateOnly(dateValue, timezone = undefined) {
  if (!dateValue) {
    return '—'
  }

  const date = new Date(dateValue)
  return Number.isNaN(date.getTime())
    ? dateValue
    : date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric', timeZone: timezone })
}

function monthKey(dateValue) {
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function monthYearLabel(year, month) {
  return `${monthLabels[month - 1]} ${year}`
}

function formatTimezoneLabel(timezone) {
  if (!timezone) {
    return 'Asia/Kolkata'
  }

  return timezone.replace('Asia/Calcutta', 'Asia/Kolkata')
}

function defaultTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata'
}

function defaultTimezoneChoice() {
  return timezoneOptions[0].id
}

function normaliseTimezone(timezone) {
  return timezoneOptions.find((option) => option.value === timezone)?.value || 'Asia/Kolkata'
}

function getTimezoneChoiceId(timezone) {
  return timezoneOptions.find((option) => option.value === timezone)?.id || defaultTimezoneChoice()
}

function isValidPassword(password) {
  return passwordPolicy.test(password || '')
}

function isValidEmail(email) {
  return emailPolicy.test((email || '').trim())
}

function isGenericHttpErrorMessage(message, status) {
  const genericMessages = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
    500: 'Internal Server Error',
    503: 'Service Unavailable',
  }

  return genericMessages[status] === message
}

function isUserActive(user) {
  if (typeof user?.isActive === 'boolean') {
    return user.isActive
  }

  return String(user?.status || '').toLowerCase() === 'active'
}

function buildMonthWindow(size) {
  const windowItems = []
  const anchor = new Date()
  anchor.setDate(1)

  for (let index = size - 1; index >= 0; index -= 1) {
    const date = new Date(anchor.getFullYear(), anchor.getMonth() - index, 1)
    windowItems.push({
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      shortLabel: monthLabels[date.getMonth()],
      fullLabel: monthYearLabel(date.getFullYear(), date.getMonth() + 1),
    })
  }

  return windowItems
}

function currencyFormat(amount, currency) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency || 'INR',
    maximumFractionDigits: 0,
  }).format(toNumber(amount))
}

function readStoredTheme() {
  try {
    const theme = window.localStorage.getItem(THEME_KEY)
    return theme === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

function formatDateTime(dateValue, timezone = undefined) {
  if (!dateValue) {
    return 'Not active'
  }

  const date = new Date(dateValue)
  return Number.isNaN(date.getTime())
    ? dateValue
    : date.toLocaleString(undefined, { timeZone: timezone })
}

function formatHeaderDateTime(dateValue, timezone = undefined) {
  return new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezone,
  }).format(dateValue)
}

function getLatestActivityMonthKey(records, session) {
  const candidateKeys = [
    ...records.expenses.map((expense) => monthKey(expense.date)),
    ...records.incomes.map((income) => monthKey(income.date)),
    ...records.budgets.map((budget) => `${budget.year}-${String(budget.month).padStart(2, '0')}`),
    session.monthlyBudget ? monthKey(new Date().toISOString()) : '',
  ].filter(Boolean)

  if (!candidateKeys.length) {
    return monthKey(new Date().toISOString())
  }

  return candidateKeys.sort().at(-1)
}

function getLatestBudget(records) {
  const budgets = [...records.budgets]
  if (!budgets.length) {
    return null
  }

  budgets.sort((left, right) => {
    const leftKey = `${left.year}-${String(left.month).padStart(2, '0')}`
    const rightKey = `${right.year}-${String(right.month).padStart(2, '0')}`
    if (leftKey === rightKey) {
      return (right.budgetId || 0) - (left.budgetId || 0)
    }
    return rightKey.localeCompare(leftKey)
  })

  return budgets[0]
}

function resolveRecurringCreationState(checked, recurringAccess) {
  return checked && !recurringAccess.active
}

function loadRazorpayCheckout() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }

    const existingScript = document.getElementById('razorpay-checkout-js')
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true), { once: true })
      existingScript.addEventListener('error', () => resolve(false), { once: true })
      return
    }

    const script = document.createElement('script')
    script.id = 'razorpay-checkout-js'
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

function computePolylinePoints(values, width, height) {
  const cleanValues = values.map((value) => toNumber(value))
  const maxValue = Math.max(...cleanValues, 1)
  const stepX = cleanValues.length > 1 ? width / (cleanValues.length - 1) : width

  return cleanValues
    .map((value, index) => {
      const x = index * stepX
      const y = height - (value / maxValue) * height
      return `${x},${y}`
    })
    .join(' ')
}

async function apiRequest(path, options = {}, token) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorText = await response.text()
    let message = errorText || `Request failed with ${response.status}`

    try {
      const parsedError = JSON.parse(errorText)
      const parsedMessage = parsedError.message || parsedError.reason || parsedError.detail || parsedError.error
      if (parsedMessage && !isGenericHttpErrorMessage(parsedMessage, response.status)) {
        message = parsedMessage
      } else if (isGenericHttpErrorMessage(message, response.status)) {
        message = `Request failed with ${response.status}`
      }
    } catch {
      // Keep the original response text when the backend does not return JSON.
    }

    const error = new Error(message)
    error.status = response.status
    throw error
  }

  if (response.status === 204) {
    return null
  }

  const text = await response.text()
  if (!text) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function App() {
  const knownUsers = safeParse(USERS_KEY, {})
  const rememberedSession = normalizeStoredSession(safeParse(SESSION_KEY, emptySession()))

  const [activeSection, setActiveSection] = useState('dashboard')
  const [authMode, setAuthMode] = useState('login')
  const [authForm, setAuthForm] = useState(emptyAuthForm)
  const [accountLinkUserId, setAccountLinkUserId] = useState('')
  const [session, setSession] = useState(rememberedSession)
  const [statusMessage, setStatusMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isBusy, setIsBusy] = useState(false)
  const [isProfileSaving, setIsProfileSaving] = useState(false)
  const [isCheckoutOpening, setIsCheckoutOpening] = useState(false)
  const [isOtpSending, setIsOtpSending] = useState(false)
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [isOtpVerifying, setIsOtpVerifying] = useState(false)
  const [isOtpVerified, setIsOtpVerified] = useState(false)
  const [theme, setTheme] = useState(readStoredTheme)
  const [currentDateTime, setCurrentDateTime] = useState(new Date())
  const [refreshToken, setRefreshToken] = useState(0)
  const [records, setRecords] = useState({
    expenses: [],
    incomes: [],
    categories: [],
    budgets: [],
    recurring: [],
    summary: null,
  })
  const [expenseForm, setExpenseForm] = useState(emptyExpenseForm)
  const [incomeForm, setIncomeForm] = useState(emptyIncomeForm)
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm)
  const [budgetForm, setBudgetForm] = useState({
    ...emptyBudgetForm,
    currency: rememberedSession.currency || 'INR',
  })
  const [recurringForm, setRecurringForm] = useState(emptyRecurringForm)
  const [profileForm, setProfileForm] = useState({
    ...emptyProfileForm,
    currency: rememberedSession.currency || 'INR',
    timezone: normaliseTimezone(rememberedSession.timezone || defaultTimezone()),
    timezoneChoice: getTimezoneChoiceId(rememberedSession.timezone || defaultTimezone()),
    monthlyBudget: rememberedSession.monthlyBudget || '',
  })
  const [broadcastForm, setBroadcastForm] = useState(emptyBroadcastForm)
  const [recurringAccess, setRecurringAccess] = useState(defaultRecurringAccess)
  const [adminRecords, setAdminRecords] = useState({
    overview: null,
    users: [],
    transactions: [],
    auditLogs: [],
  })
  const sessionRef = useRef(rememberedSession)
  const [expenseFilters, setExpenseFilters] = useState({
    keyword: '',
    categoryId: 'ALL',
    paymentMethod: 'ALL',
    monthKey: '',
  })
  const [incomeFilters, setIncomeFilters] = useState({
    keyword: '',
    source: 'ALL',
    monthKey: '',
  })
  const [dashboardMonthKey, setDashboardMonthKey] = useState(monthKey(new Date().toISOString()))

  const deferredExpenseKeyword = useDeferredValue(expenseFilters.keyword)
  const deferredIncomeKeyword = useDeferredValue(incomeFilters.keyword)
  const currentCurrency = session.currency || 'INR'
  const currentTimezone = formatTimezoneLabel(session.timezone)
  const currentMonthWindow = buildMonthWindow(6)
  const visibleNavItems = session.role === 'admin' ? adminNavItems : userNavItems

  useEffect(() => {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    sessionRef.current = session
  }, [session])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  useEffect(() => {
    const timerId = window.setInterval(() => setCurrentDateTime(new Date()), 30000)
    return () => window.clearInterval(timerId)
  }, [])

  useEffect(() => {
    setProfileForm({
      currency: session.currency || 'INR',
      timezone: normaliseTimezone(session.timezone || defaultTimezone()),
      timezoneChoice: getTimezoneChoiceId(session.timezone || defaultTimezone()),
      monthlyBudget: session.monthlyBudget || '',
    })
  }, [session.currency, session.monthlyBudget, session.timezone])

  async function loadAllData() {
    if (!session.userId) {
      return
    }

    setIsBusy(true)
    setErrorMessage('')

    try {
      const [profile, expenses, incomes, categories, budgets, recurring, summary, recurringAccessStatus] = await Promise.all([
        apiRequest(`/auth/users/${session.userId}`, {}, session.token).catch(() => null),
        apiRequest(`/expenses/user/${session.userId}`, {}, session.token).catch(() => []),
        apiRequest(`/income/user/${session.userId}`, {}, session.token).catch(() => []),
        apiRequest(`/categories/user/${session.userId}`, {}, session.token).catch(() => []),
        apiRequest(`/budgets/user/${session.userId}`, {}, session.token).catch(() => []),
        apiRequest(`/recurring/user/${session.userId}`, {}, session.token).catch(() => []),
        apiRequest(`/analytics/summary/${session.userId}`, {}, session.token).catch(() => null),
        apiRequest(`/payments/recurring-access/user/${session.userId}/status`, {}, session.token).catch(() => defaultRecurringAccess),
      ])

      startTransition(() => {
        setRecords({ expenses, incomes, categories, budgets, recurring, summary })
      })
      setRecurringAccess(recurringAccessStatus || defaultRecurringAccess)

      if (profile) {
        const currentSession = sessionRef.current
        if (currentSession.token !== session.token || currentSession.userId !== session.userId) {
          return
        }

        const syncedSession = {
          ...currentSession,
          fullName: profile.fullName || currentSession.fullName,
          currency: profile.currency || currentSession.currency || 'INR',
          timezone: profile.timezone || currentSession.timezone || defaultTimezone(),
          monthlyBudget: profile.monthlyBudget || '',
        }

        if (
          syncedSession.fullName === currentSession.fullName &&
          syncedSession.currency === currentSession.currency &&
          syncedSession.timezone === currentSession.timezone &&
          syncedSession.monthlyBudget === currentSession.monthlyBudget
        ) {
          return
        }

        const updatedKnownUsers = {
          ...knownUsers,
          [currentSession.email]: {
            userId: profile.userId || currentSession.userId,
            fullName: syncedSession.fullName,
            currency: syncedSession.currency,
            timezone: syncedSession.timezone,
            monthlyBudget: syncedSession.monthlyBudget,
          },
        }

        window.localStorage.setItem(USERS_KEY, JSON.stringify(updatedKnownUsers))
        setSession(syncedSession)
      }
    } catch (error) {
      setErrorMessage(error.message || 'Unable to load data from the backend.')
    } finally {
      setIsBusy(false)
    }
  }

  async function loadAdminData() {
    if (session.role !== 'admin' || !session.token) {
      return
    }

    setIsBusy(true)
    setErrorMessage('')

    try {
      const [overview, users, transactions, auditLogs] = await Promise.all([
        apiRequest('/admin/overview', {}, session.token).catch(ignoreNonAuthError(null)),
        apiRequest('/admin/users', {}, session.token).catch(ignoreNonAuthError([])),
        apiRequest('/admin/transactions', {}, session.token).catch(ignoreNonAuthError([])),
        apiRequest('/admin/audit-logs', {}, session.token).catch(ignoreNonAuthError([])),
      ])

      startTransition(() => {
        setAdminRecords({
          overview,
          users,
          transactions,
          auditLogs,
        })
      })
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        const nextSession = emptySession()
        setSession(nextSession)
        sessionRef.current = nextSession
        setAdminRecords({
          overview: null,
          users: [],
          transactions: [],
          auditLogs: [],
        })
        setAuthMode('admin')
        setActiveSection('dashboard')
        setErrorMessage('Admin session expired. Please sign in again.')
        return
      }

      setErrorMessage(error.message || 'Unable to load admin data right now.')
    } finally {
      setIsBusy(false)
    }
  }

  useEffect(() => {
    if (session.role === 'admin' && session.token) {
      loadAdminData()
    } else if (session.userId) {
      loadAllData()
    }
  }, [session.role, session.userId, session.token, refreshToken])

  useEffect(() => {
    if (session.role === 'admin') {
      return
    }

    const latestKey = getLatestActivityMonthKey(records, session)
    const hasCurrentMonthData =
      records.expenses.some((expense) => monthKey(expense.date) === dashboardMonthKey) ||
      records.incomes.some((income) => monthKey(income.date) === dashboardMonthKey) ||
      records.budgets.some((budget) => `${budget.year}-${String(budget.month).padStart(2, '0')}` === dashboardMonthKey)

    if (!hasCurrentMonthData && latestKey && latestKey !== dashboardMonthKey) {
      setDashboardMonthKey(latestKey)
    }
  }, [dashboardMonthKey, records, session])

  const categoriesById = Object.fromEntries(records.categories.map((category) => [category.categoryId, category]))
  const expenseCategories = records.categories.filter((category) => category.type === 'EXPENSE')
  const incomeCategories = records.categories.filter((category) => category.type === 'INCOME')
  const monthlyExpenses = records.expenses.filter((expense) => monthKey(expense.date) === dashboardMonthKey)
  const monthlyIncomes = records.incomes.filter((income) => monthKey(income.date) === dashboardMonthKey)
  const totalExpense = monthlyExpenses.reduce((sum, expense) => sum + toNumber(expense.amount), 0)
  const totalIncome = monthlyIncomes.reduce((sum, income) => sum + toNumber(income.amount), 0)
  const balance = totalIncome - totalExpense
  const allIncomeTotal = records.incomes.reduce((sum, income) => sum + toNumber(income.amount), 0)
  const allExpenseTotal = records.expenses.reduce((sum, expense) => sum + toNumber(expense.amount), 0)
  const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0
  const activeBudget =
    records.budgets.find((budget) => `${budget.year}-${String(budget.month).padStart(2, '0')}` === dashboardMonthKey) ||
    null
  const latestBudget = getLatestBudget(records)
  const budgetLimit = activeBudget ? toNumber(activeBudget.monthlyLimit) : toNumber(latestBudget?.monthlyLimit ?? session.monthlyBudget)
  const budgetProgress = budgetLimit > 0 ? clamp((totalExpense / budgetLimit) * 100, 0, 100) : 0
  const hasHealthData = totalIncome > 0 || totalExpense > 0
  const budgetAdherenceScore = budgetLimit > 0 ? clamp(100 - Math.max(0, budgetProgress - 100), 0, 100) : 0
  const expenseToIncomeScore =
    totalIncome > 0 ? clamp(100 - Math.max(0, (totalExpense / totalIncome) * 100 - 100), 0, 100) : 0
  const financialHealthScore = hasHealthData
    ? Math.round(
      clamp((clamp(savingsRate, 0, 100) * 0.4) + (budgetAdherenceScore * 0.4) + (expenseToIncomeScore * 0.2), 0, 100),
    )
    : null

  const breakdownMap = {}
  for (const expense of monthlyExpenses) {
    const category = categoriesById[expense.categoryId]
    const name = category?.name || 'Uncategorised'
    if (!breakdownMap[name]) {
      breakdownMap[name] = { name, amount: 0, color: category?.color || '#b08968' }
    }
    breakdownMap[name].amount += toNumber(expense.amount)
  }

  const expenseBreakdown = Object.values(breakdownMap).sort((left, right) => right.amount - left.amount)
  const chartTotal = expenseBreakdown.reduce((sum, item) => sum + item.amount, 0)
  const topCategories = expenseBreakdown.slice(0, 5)
  const recurringDueThisMonth = records.recurring
    .slice()
    .sort((left, right) => new Date(left.nextExecutionDate || left.startDate) - new Date(right.nextExecutionDate || right.startDate))

  const sixMonthSeries = currentMonthWindow.map((item) => {
    const expenseAmount = records.expenses
      .filter((expense) => monthKey(expense.date) === item.key)
      .reduce((sum, expense) => sum + toNumber(expense.amount), 0)
    const incomeAmount = records.incomes
      .filter((income) => monthKey(income.date) === item.key)
      .reduce((sum, income) => sum + toNumber(income.amount), 0)

    return { ...item, expenseAmount, incomeAmount, savingsRate: incomeAmount > 0 ? ((incomeAmount - expenseAmount) / incomeAmount) * 100 : 0 }
  })

  const threeMonthExpenses = sixMonthSeries.slice(-3).map((item) => item.expenseAmount)
  const spendingForecast =
    threeMonthExpenses.length > 0
      ? Math.round((threeMonthExpenses.reduce((sum, value) => sum + value, 0) / threeMonthExpenses.length) + (threeMonthExpenses.at(-1) - threeMonthExpenses[0]) * 0.25)
      : 0

  const dashboardMonthDate = new Date(`${dashboardMonthKey}-01T00:00:00`)
  const daysInDashboardMonth = Number.isNaN(dashboardMonthDate.getTime())
    ? 30
    : new Date(dashboardMonthDate.getFullYear(), dashboardMonthDate.getMonth() + 1, 0).getDate()
  const dailyTotals = Array.from({ length: daysInDashboardMonth }, (_, index) => {
    const day = index + 1
    const dayTotal = monthlyExpenses
      .filter((expense) => {
        const date = new Date(expense.date)
        return !Number.isNaN(date.getTime()) && date.getDate() === day
      })
      .reduce((sum, expense) => sum + toNumber(expense.amount), 0)

    return dayTotal
  })

  const filteredExpenses = records.expenses
    .filter((expense) => {
      const keyword = deferredExpenseKeyword.trim().toLowerCase()
      const categoryMatch = expenseFilters.categoryId === 'ALL' || String(expense.categoryId) === expenseFilters.categoryId
      const paymentMatch = expenseFilters.paymentMethod === 'ALL' || expense.paymentMethod === expenseFilters.paymentMethod
      const monthMatch = !expenseFilters.monthKey || monthKey(expense.date) === expenseFilters.monthKey
      const keywordMatch = !keyword || [expense.title, expense.notes]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(keyword))

      return categoryMatch && paymentMatch && monthMatch && keywordMatch
    })
    .sort((left, right) => new Date(right.date) - new Date(left.date))

  const filteredIncomes = records.incomes
    .filter((income) => {
      const keyword = deferredIncomeKeyword.trim().toLowerCase()
      const sourceMatch = incomeFilters.source === 'ALL' || income.source === incomeFilters.source
      const monthMatch = !incomeFilters.monthKey || monthKey(income.date) === incomeFilters.monthKey
      const keywordMatch = !keyword || [income.source, income.notes]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(keyword))

      return sourceMatch && monthMatch && keywordMatch
    })
    .sort((left, right) => new Date(right.date) - new Date(left.date))

  const budgetCards = records.budgets
    .slice()
    .sort((left, right) => {
      const leftKey = `${left.year}-${String(left.month).padStart(2, '0')}`
      const rightKey = `${right.year}-${String(right.month).padStart(2, '0')}`
      return rightKey.localeCompare(leftKey)
    })
    .map((budget) => {
      const key = `${budget.year}-${String(budget.month).padStart(2, '0')}`
      const spentAmount = records.expenses
        .filter((expense) => monthKey(expense.date) === key)
        .reduce((sum, expense) => sum + toNumber(expense.amount), 0)

      return {
        ...budget,
        spentAmount,
        progress: budget.monthlyLimit > 0 ? clamp((spentAmount / budget.monthlyLimit) * 100, 0, 100) : 0,
      }
    })

  async function handleAuthSubmit(event) {
    event.preventDefault()
    if (!isValidEmail(authForm.email)) {
      const message = 'Enter a valid email address in standard format, for example user@example.com.'
      setErrorMessage(message)
      window.alert(message)
      return
    }

    if (!isValidPassword(authForm.password)) {
      const message = 'Password must contain at least one uppercase letter, one lowercase letter, one digit, one special character, and be at least 8 characters long.'
      setErrorMessage(message)
      window.alert(message)
      return
    }

    if ((authMode === 'register' || authMode === 'forgot') && !isOtpVerified) {
      const message = authMode === 'forgot'
        ? 'Verify OTP before resetting your password.'
        : 'Verify OTP before creating your account.'
      setErrorMessage(message)
      window.alert(message)
      return
    }

    setIsBusy(true)
    setErrorMessage('')
    setStatusMessage('')

    try {
      if (authMode === 'register') {
        const payload = {
          fullName: authForm.fullName,
          email: authForm.email,
          password: authForm.password,
          otp: authForm.otp,
        }

        const user = await apiRequest('/auth/register', {
          method: 'POST',
          body: JSON.stringify(payload),
        })

        const updatedKnownUsers = {
          ...knownUsers,
          [user.email]: {
            userId: user.userId,
            fullName: user.fullName,
            currency: user.currency || 'INR',
            timezone: user.timezone || defaultTimezone(),
            monthlyBudget: user.monthlyBudget || '',
          },
        }

        window.localStorage.setItem(USERS_KEY, JSON.stringify(updatedKnownUsers))

        setAuthMode('login')
        setIsOtpSent(false)
        setIsOtpVerified(false)
        setAuthForm({
          fullName: '',
          email: user.email,
          password: '',
          otp: '',
        })
        setStatusMessage('Account created successfully. Please sign in to continue.')
      } else if (authMode === 'forgot') {
        await apiRequest('/auth/password/reset', {
          method: 'POST',
          body: JSON.stringify({
            email: authForm.email,
            otp: authForm.otp,
            newPassword: authForm.password,
          }),
        })

        setAuthMode('login')
        setIsOtpSent(false)
        setIsOtpVerified(false)
        setAuthForm({
          fullName: '',
          email: authForm.email,
          password: '',
          otp: '',
        })
        setStatusMessage('Password reset successfully. Please sign in with your new password.')
      } else if (authMode === 'admin') {
        const adminSession = await apiRequest('/admin/login', {
          method: 'POST',
          body: JSON.stringify({
            email: authForm.email,
            password: authForm.password,
          }),
        })

        setSession({
          token: adminSession.token,
          email: adminSession.email,
          userId: 'admin',
          fullName: adminSession.fullName || 'SpendSmart Admin',
          currency: 'INR',
          timezone: defaultTimezone(),
          monthlyBudget: '',
          role: 'admin',
        })
        setAccountLinkUserId('')
        setStatusMessage('Admin login successful. Dashboard is syncing now.')
      } else {
        const loginResponse = await apiRequest('/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            email: authForm.email,
            password: authForm.password,
          }),
        })

        const normalizedEmail = authForm.email.trim().toLowerCase()
        const token = typeof loginResponse === 'string' ? loginResponse : loginResponse.token
        const knownUser = knownUsers[normalizedEmail] || knownUsers[authForm.email]
        const userId = loginResponse.userId || knownUser?.userId || ''
        const fullName = loginResponse.fullName || knownUser?.fullName || normalizedEmail.split('@')[0]
        const currency = loginResponse.currency || knownUser?.currency || 'INR'
        const timezone = loginResponse.timezone || knownUser?.timezone || defaultTimezone()
        const monthlyBudget = loginResponse.monthlyBudget ?? knownUser?.monthlyBudget ?? ''

        if (!token) {
          throw new Error('Login response did not include an access token.')
        }

        const updatedKnownUsers = {
          ...knownUsers,
          [normalizedEmail]: {
            userId,
            fullName,
            currency,
            timezone,
            monthlyBudget,
          },
        }

        window.localStorage.setItem(USERS_KEY, JSON.stringify(updatedKnownUsers))

        setSession({
          token,
          email: normalizedEmail,
          userId,
          fullName,
          currency,
          timezone,
          monthlyBudget,
          role: 'user',
        })
        setAccountLinkUserId(userId ? String(userId) : '')
        setBudgetForm((current) => ({ ...current, currency }))
        setStatusMessage(
          userId
            ? 'Welcome back. Your dashboard is syncing now.'
            : 'Login worked. Add your user ID once so the app can fetch your data from the other services.',
        )
      }

      setAuthForm(emptyAuthForm)
    } catch (error) {
      if (authMode === 'login' && error.status === 403) {
        setErrorMessage(error.message || 'Account is suspended. Please contact the admin.')
      } else if (authMode === 'login' && error.status === 401) {
        setErrorMessage('Wrong email or password.')
      } else if (authMode === 'admin' && (error.status === 401 || error.status === 403)) {
        setErrorMessage('Wrong admin email or password.')
      } else if (authMode === 'admin' && error.status >= 500) {
        setErrorMessage('Admin service is unavailable. Restart the API gateway and admin service, then try again.')
      } else {
        setErrorMessage(error.message || 'Authentication failed.')
        if ((authMode === 'register' || authMode === 'forgot') && error.message) {
          window.alert(error.message)
        }
      }
    } finally {
      setIsBusy(false)
    }
  }

  async function handleSendRegistrationOtp() {
    if (!authForm.email) {
      setErrorMessage('Enter your email before sending OTP.')
      window.alert('Enter your email before sending OTP.')
      return
    }

    setIsOtpSending(true)
    setErrorMessage('')
    setStatusMessage('')

    try {
      await apiRequest('/auth/register/send-otp', {
        method: 'POST',
        body: JSON.stringify({ email: authForm.email }),
      })
      setIsOtpSent(true)
      setIsOtpVerified(false)
      setStatusMessage('OTP sent to your email. Please check your inbox.')
      window.alert('OTP sent to your email. Please check your inbox.')
    } catch (error) {
      const message = error.status === 409
        ? 'Email already registered.'
        : error.message || 'Unable to send OTP.'
      setErrorMessage(message)
      window.alert(message)
    } finally {
      setIsOtpSending(false)
    }
  }

  async function handleVerifyRegistrationOtp() {
    if (!authForm.email || !authForm.otp) {
      setErrorMessage('Enter your email and OTP before verifying.')
      window.alert('Enter your email and OTP before verifying.')
      return
    }

    setIsOtpVerifying(true)
    setErrorMessage('')
    setStatusMessage('')

    try {
      await apiRequest('/auth/register/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email: authForm.email, otp: authForm.otp }),
      })
      setIsOtpVerified(true)
      setStatusMessage('OTP verified. You can create your account now.')
      window.alert('OTP verified. You can create your account now.')
    } catch (error) {
      const message = error.message || 'Wrong OTP. Please try again.'
      setIsOtpVerified(false)
      setErrorMessage(message)
      window.alert(message)
    } finally {
      setIsOtpVerifying(false)
    }
  }

  async function handleSendPasswordResetOtp() {
    if (!authForm.email) {
      setErrorMessage('Enter your email before sending OTP.')
      window.alert('Enter your email before sending OTP.')
      return
    }

    setIsOtpSending(true)
    setErrorMessage('')
    setStatusMessage('')

    try {
      await apiRequest('/auth/password/forgot/send-otp', {
        method: 'POST',
        body: JSON.stringify({ email: authForm.email }),
      })
      setIsOtpSent(true)
      setIsOtpVerified(false)
      setStatusMessage('Password reset OTP sent to your email. Please check your inbox.')
      window.alert('Password reset OTP sent to your email. Please check your inbox.')
    } catch (error) {
      const message = error.message || 'Unable to send OTP.'
      setErrorMessage(message)
      window.alert(message)
    } finally {
      setIsOtpSending(false)
    }
  }

  async function handleVerifyPasswordResetOtp() {
    if (!authForm.email || !authForm.otp) {
      setErrorMessage('Enter your email and OTP before verifying.')
      window.alert('Enter your email and OTP before verifying.')
      return
    }

    setIsOtpVerifying(true)
    setErrorMessage('')
    setStatusMessage('')

    try {
      await apiRequest('/auth/password/forgot/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email: authForm.email, otp: authForm.otp }),
      })
      setIsOtpVerified(true)
      setStatusMessage('OTP verified. You can set a new password now.')
      window.alert('OTP verified. You can set a new password now.')
    } catch (error) {
      const message = error.message || 'Wrong OTP. Please try again.'
      setIsOtpVerified(false)
      setErrorMessage(message)
      window.alert(message)
    } finally {
      setIsOtpVerifying(false)
    }
  }

  function handleOtpAction() {
    if (authMode === 'forgot') {
      if (isOtpSent) {
        handleVerifyPasswordResetOtp()
        return
      }

      handleSendPasswordResetOtp()
      return
    }

    if (isOtpSent) {
      handleVerifyRegistrationOtp()
      return
    }

    handleSendRegistrationOtp()
  }

  function handleAuthModeChange(nextMode) {
    setAuthMode(nextMode)
    setErrorMessage('')
    setStatusMessage('')
    setIsOtpSent(false)
    setIsOtpVerified(false)
    setAuthForm(emptyAuthForm)
  }

  function updateAuthForm(updates, options = {}) {
    setAuthForm((current) => ({ ...current, ...updates }))

    if (options.resetOtpSent) {
      setIsOtpSent(false)
      setIsOtpVerified(false)
    } else if (options.resetOtpVerified) {
      setIsOtpVerified(false)
    }
  }

  function toggleTheme() {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }

  function connectExistingAccount(event) {
    event.preventDefault()

    if (!accountLinkUserId) {
      setErrorMessage('User ID is required because the current backend does not expose a profile lookup endpoint.')
      return
    }

    const updatedSession = { ...session, userId: Number(accountLinkUserId) }
    const updatedKnownUsers = {
      ...knownUsers,
      [session.email]: {
        userId: Number(accountLinkUserId),
        fullName: session.fullName,
        currency: session.currency,
        timezone: session.timezone,
        monthlyBudget: session.monthlyBudget,
      },
    }

    window.localStorage.setItem(USERS_KEY, JSON.stringify(updatedKnownUsers))
    setSession(updatedSession)
    setStatusMessage('Account connected. Loading your finance data now.')
    setErrorMessage('')
  }

  async function handleExpenseSubmit(event) {
    event.preventDefault()
    setIsBusy(true)
    setErrorMessage('')

    try {
      const payload = {
        userId: Number(session.userId),
        categoryId: expenseForm.categoryId ? Number(expenseForm.categoryId) : null,
        title: expenseForm.title,
        amount: toNumber(expenseForm.amount),
        currency: session.currency || 'INR',
        type: expenseForm.type,
        paymentMethod: expenseForm.paymentMethod,
        date: toLocalDateTime(expenseForm.date),
        notes: expenseForm.notes,
        receiptUrl: expenseForm.receiptUrl,
        isRecurring: Boolean(expenseForm.isRecurring),
      }

      if (expenseForm.expenseId) {
        await apiRequest(`/expenses/${expenseForm.expenseId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        }, session.token)
        setStatusMessage('Expense updated successfully.')
      } else {
        await apiRequest('/expenses', {
          method: 'POST',
          body: JSON.stringify(payload),
        }, session.token)

        if (expenseForm.isRecurring) {
          if (recurringAccess.active) {
            await apiRequest('/recurring', {
              method: 'POST',
              body: JSON.stringify({
                userId: Number(session.userId),
                title: expenseForm.title,
                amount: toNumber(expenseForm.amount),
                type: 'EXPENSE',
                categoryId: expenseForm.categoryId ? Number(expenseForm.categoryId) : null,
                frequency: expenseForm.recurringFrequency,
                startDate: expenseForm.date,
              }),
            }, session.token)
            setStatusMessage('Expense saved and recurring rule created successfully.')
          } else {
            setActiveSection('recurring')
            setStatusMessage('Expense saved. Unlock recurring access in the Recurring section to create this recurring rule.')
          }
        } else {
          setStatusMessage('Expense saved successfully.')
        }
      }

      setExpenseForm(emptyExpenseForm)
      setRefreshToken((value) => value + 1)
    } catch (error) {
      setErrorMessage(error.message || 'Expense could not be saved.')
    } finally {
      setIsBusy(false)
    }
  }

  async function handleIncomeSubmit(event) {
    event.preventDefault()
    setIsBusy(true)
    setErrorMessage('')

    try {
      const payload = {
        userId: Number(session.userId),
        source: incomeForm.source,
        amount: toNumber(incomeForm.amount),
        currency: session.currency || 'INR',
        date: toLocalDateTime(incomeForm.date),
        notes: incomeForm.notes,
        isRecurring: Boolean(incomeForm.isRecurring),
      }

      if (incomeForm.incomeId) {
        await apiRequest(`/income/${incomeForm.incomeId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        }, session.token)
        setStatusMessage('Income entry updated successfully.')
      } else {
        await apiRequest('/income', {
          method: 'POST',
          body: JSON.stringify(payload),
        }, session.token)

        if (incomeForm.isRecurring) {
          if (recurringAccess.active) {
            await apiRequest('/recurring', {
              method: 'POST',
              body: JSON.stringify({
                userId: Number(session.userId),
                title: incomeForm.source,
                amount: toNumber(incomeForm.amount),
                type: 'INCOME',
                categoryId: null,
                frequency: incomeForm.recurringFrequency,
                startDate: incomeForm.date,
              }),
            }, session.token)
            setStatusMessage('Income saved and recurring rule created successfully.')
          } else {
            setActiveSection('recurring')
            setStatusMessage('Income saved. Unlock recurring access in the Recurring section to create this recurring rule.')
          }
        } else {
          setStatusMessage('Income entry saved successfully.')
        }
      }

      setIncomeForm(emptyIncomeForm)
      setRefreshToken((value) => value + 1)
    } catch (error) {
      setErrorMessage(error.message || 'Income could not be saved.')
    } finally {
      setIsBusy(false)
    }
  }

  async function handleCategorySubmit(event) {
    event.preventDefault()
    setIsBusy(true)
    setErrorMessage('')

    try {
      const payload = {
        userId: Number(session.userId),
        name: categoryForm.name,
        type: categoryForm.type,
        icon: categoryForm.icon,
        color: categoryForm.color,
        isDefault: false,
      }

      if (categoryForm.categoryId) {
        await apiRequest(`/categories/${categoryForm.categoryId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        }, session.token)
        setStatusMessage('Category updated successfully.')
      } else {
        await apiRequest('/categories', {
          method: 'POST',
          body: JSON.stringify(payload),
        }, session.token)
        setStatusMessage('Category created successfully.')
      }

      setCategoryForm(emptyCategoryForm)
      setRefreshToken((value) => value + 1)
    } catch (error) {
      setErrorMessage(error.message || 'Category could not be saved.')
    } finally {
      setIsBusy(false)
    }
  }

  async function handleBudgetSubmit(event) {
    event.preventDefault()
    setIsBusy(true)
    setErrorMessage('')

    try {
      const budgetMonthKey = `${budgetForm.year}-${String(budgetForm.month).padStart(2, '0')}`
      const spentAmount = records.expenses
        .filter((expense) => monthKey(expense.date) === budgetMonthKey)
        .reduce((sum, expense) => sum + toNumber(expense.amount), 0)

      const payload = {
        userId: Number(session.userId),
        monthlyLimit: toNumber(budgetForm.monthlyLimit),
        spentAmount,
        currency: budgetForm.currency,
        month: Number(budgetForm.month),
        year: Number(budgetForm.year),
        isActive: true,
      }

      if (budgetForm.budgetId) {
        await apiRequest(`/budgets/${budgetForm.budgetId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        }, session.token)
        setStatusMessage('Budget updated successfully.')
      } else {
        await apiRequest('/budgets', {
          method: 'POST',
          body: JSON.stringify(payload),
        }, session.token)
        setStatusMessage('Budget created successfully.')
      }

      const updatedUser = await apiRequest(`/auth/users/${session.userId}/preferences`, {
        method: 'PUT',
        body: JSON.stringify({
          monthlyBudget: payload.monthlyLimit,
          currency: budgetForm.currency,
        }),
      }, session.token)

      const nextMonthlyBudget = updatedUser.monthlyBudget ?? payload.monthlyLimit
      const nextCurrency = updatedUser.currency || budgetForm.currency || session.currency || 'INR'

      setSession((current) => {
        const nextSession = {
          ...current,
          currency: nextCurrency,
          monthlyBudget: nextMonthlyBudget,
        }

        const updatedKnownUsers = {
          ...knownUsers,
          [nextSession.email]: {
            userId: nextSession.userId,
            fullName: nextSession.fullName,
            currency: nextSession.currency,
            timezone: nextSession.timezone,
            monthlyBudget: nextSession.monthlyBudget,
          },
        }

        window.localStorage.setItem(USERS_KEY, JSON.stringify(updatedKnownUsers))
        return nextSession
      })

      setBudgetForm((current) => ({
        ...emptyBudgetForm,
        currency: current.currency,
      }))
      setRefreshToken((value) => value + 1)
    } catch (error) {
      setErrorMessage(error.message || 'Budget could not be saved.')
    } finally {
      setIsBusy(false)
    }
  }

  async function handleRecurringSubmit(event) {
    event.preventDefault()
    setIsBusy(true)
    setErrorMessage('')

    try {
      await apiRequest('/recurring', {
        method: 'POST',
        body: JSON.stringify({
          userId: Number(session.userId),
          title: recurringForm.title,
          amount: toNumber(recurringForm.amount),
          type: recurringForm.type,
          categoryId: recurringForm.categoryId ? Number(recurringForm.categoryId) : null,
          frequency: recurringForm.frequency,
          startDate: recurringForm.startDate,
        }),
      }, session.token)

      setRecurringForm(emptyRecurringForm)
      setStatusMessage('Recurring rule created successfully.')
      setRefreshToken((value) => value + 1)
    } catch (error) {
      setErrorMessage(error.message || 'Recurring rule could not be saved.')
    } finally {
      setIsBusy(false)
    }
  }

  async function deleteResource(path, successMessage) {
    setIsBusy(true)
    setErrorMessage('')

    try {
      await apiRequest(path, { method: 'DELETE' }, session.token)
      setStatusMessage(successMessage)
      setRefreshToken((value) => value + 1)
    } catch (error) {
      setErrorMessage(error.message || 'Delete failed.')
    } finally {
      setIsBusy(false)
    }
  }

  async function handleAdminUserStatus(userId, active) {
    setIsBusy(true)
    setErrorMessage('')

    try {
      await apiRequest(`/admin/users/${userId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ active }),
      }, session.token)
      setStatusMessage(active ? 'User reactivated successfully.' : 'User suspended successfully.')
      setRefreshToken((value) => value + 1)
    } catch (error) {
      setErrorMessage(error.message || 'Unable to update user status.')
    } finally {
      setIsBusy(false)
    }
  }

  async function handleAdminDeleteUser(userId) {
    setIsBusy(true)
    setErrorMessage('')

    try {
      await apiRequest(`/admin/users/${userId}`, { method: 'DELETE' }, session.token)
      setStatusMessage('User deleted successfully.')
      setRefreshToken((value) => value + 1)
    } catch (error) {
      setErrorMessage(error.message || 'Unable to delete the user.')
    } finally {
      setIsBusy(false)
    }
  }

  async function handleAdminBroadcast(event) {
    event.preventDefault()
    setIsBusy(true)
    setErrorMessage('')
    setStatusMessage('')

    try {
      const response = await apiRequest('/admin/broadcast', {
        method: 'POST',
        body: JSON.stringify(broadcastForm),
      }, session.token)
      setBroadcastForm(emptyBroadcastForm)
      setStatusMessage(`Broadcast queued for ${response.sentCount || 0} users.`)
      setRefreshToken((value) => value + 1)
    } catch (error) {
      setErrorMessage(error.message || 'Unable to send the broadcast.')
    } finally {
      setIsBusy(false)
    }
  }

  async function handleRecurringAccessPayment() {
    setIsCheckoutOpening(true)
    setIsBusy(true)
    setErrorMessage('')
    setStatusMessage('')

    try {
      const scriptLoaded = await loadRazorpayCheckout()
      if (!scriptLoaded) {
        throw new Error('Unable to load Razorpay checkout.')
      }

      const order = await apiRequest('/payments/recurring-access/order', {
        method: 'POST',
        body: JSON.stringify({
          userId: Number(session.userId),
          email: session.email,
        }),
      }, session.token)

      await new Promise((resolve, reject) => {
        const razorpay = new window.Razorpay({
          key: order.keyId,
          amount: order.amountInSubunits,
          currency: order.currency,
          name: 'Spend Smart',
          description: `${order.planName} (${order.validityDays} days)`,
          order_id: order.orderId,
          prefill: {
            name: session.fullName,
            email: session.email,
          },
          theme: {
            color: '#14532d',
          },
          handler: async (response) => {
            try {
              await apiRequest('/payments/recurring-access/verify', {
                method: 'POST',
                body: JSON.stringify({
                  userId: Number(session.userId),
                  email: session.email,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                }),
              }, session.token)
              setStatusMessage('Recurring access payment completed successfully.')
              setRefreshToken((value) => value + 1)
              resolve()
            } catch (error) {
              reject(error)
            }
          },
          modal: {
            ondismiss: () => reject(new Error('Payment cancelled.')),
          },
        })

        razorpay.open()
      })
    } catch (error) {
      setErrorMessage(error.message || 'Recurring access payment failed.')
    } finally {
      setIsCheckoutOpening(false)
      setIsBusy(false)
    }
  }

  async function handleProfileSubmit(event) {
    event.preventDefault()
    setIsProfileSaving(true)
    setErrorMessage('')
    setStatusMessage('')

    try {
      if (!session.userId) {
        throw new Error('Connect your user ID before saving profile preferences.')
      }

      const payload = {
        currency: profileForm.currency,
        timezone: normaliseTimezone(profileForm.timezone),
      }

      const updatedUser = await apiRequest(`/auth/users/${session.userId}/preferences`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }, session.token)

      const updatedSession = {
        ...session,
        fullName: updatedUser.fullName || session.fullName,
        currency: updatedUser.currency || session.currency || 'INR',
        timezone: updatedUser.timezone || session.timezone,
        monthlyBudget: updatedUser.monthlyBudget || '',
      }

      const updatedKnownUsers = {
        ...knownUsers,
        [session.email]: {
          userId: updatedUser.userId || session.userId,
          fullName: updatedSession.fullName,
          currency: updatedSession.currency,
          timezone: updatedSession.timezone,
          monthlyBudget: updatedSession.monthlyBudget,
        },
      }

      window.localStorage.setItem(USERS_KEY, JSON.stringify(updatedKnownUsers))
      setSession(updatedSession)
      setRefreshToken((value) => value + 1)
      setStatusMessage('Profile preferences saved successfully.')
    } catch (error) {
      setErrorMessage(error.message || 'Profile preferences could not be saved.')
    } finally {
      setIsProfileSaving(false)
    }
  }

  function logout() {
    setSession({
      token: '',
      email: '',
      fullName: '',
      userId: '',
      currency: 'INR',
      timezone: defaultTimezone(),
      monthlyBudget: '',
      role: 'user',
    })
    window.localStorage.removeItem(SESSION_KEY)
    setRecords({
      expenses: [],
      incomes: [],
      categories: [],
      budgets: [],
      recurring: [],
      summary: null,
    })
    setAdminRecords({
      overview: null,
      users: [],
      transactions: [],
      auditLogs: [],
    })
    setStatusMessage('You have been signed out.')
    setErrorMessage('')
    setActiveSection('dashboard')
  }

  function applyExpenseToForm(expense) {
    setExpenseForm({
      expenseId: expense.expenseId,
      title: expense.title || '',
      amount: String(expense.amount || ''),
      categoryId: expense.categoryId ? String(expense.categoryId) : '',
      date: expense.date ? expense.date.slice(0, 10) : todayInput(),
      paymentMethod: expense.paymentMethod || 'UPI',
      type: expense.type || 'EXPENSE',
      notes: expense.notes || '',
      receiptUrl: expense.receiptUrl || '',
      isRecurring: Boolean(expense.isRecurring),
      recurringFrequency: 'MONTHLY',
    })
    setActiveSection('expenses')
  }

  function applyIncomeToForm(income) {
    setIncomeForm({
      incomeId: income.incomeId,
      source: income.source || 'Salary',
      amount: String(income.amount || ''),
      date: income.date ? income.date.slice(0, 10) : todayInput(),
      notes: income.notes || '',
      isRecurring: Boolean(income.isRecurring),
      recurringFrequency: 'MONTHLY',
    })
    setActiveSection('income')
  }

  function applyCategoryToForm(category) {
    setCategoryForm({
      categoryId: category.categoryId,
      name: category.name || '',
      type: category.type || 'EXPENSE',
      icon: category.icon || '•',
      color: category.color || '#1f7a5c',
    })
    setStatusMessage(`Editing category: ${category.name}`)
    setActiveSection('categories')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function applyBudgetToForm(budget) {
    setBudgetForm({
      budgetId: budget.budgetId,
      monthlyLimit: String(budget.monthlyLimit || ''),
      currency: budget.currency || currentCurrency,
      month: budget.month || new Date().getMonth() + 1,
      year: budget.year || new Date().getFullYear(),
    })
    setActiveSection('budgets')
  }

  function renderDonutChart() {
    if (!chartTotal) {
      return (
        <div className="empty-chart">
          <strong>No expense data</strong>
          <span>Add a few expenses in the selected month to unlock the category split.</span>
        </div>
      )
    }

    let cumulative = 0
    const gradients = expenseBreakdown.map((item) => {
      const percentage = (item.amount / chartTotal) * 100
      const start = cumulative
      cumulative += percentage
      return `${item.color} ${start}% ${cumulative}%`
    })

    return (
      <div className="donut-card">
        <div
          className="donut-visual"
          style={{ background: `conic-gradient(${gradients.join(', ')})` }}
        >
          <div className="donut-hole">
            <span>Spent</span>
            <strong>{currencyFormat(chartTotal, currentCurrency)}</strong>
          </div>
        </div>
        <div className="donut-legend">
          {expenseBreakdown.map((item) => (
            <div key={item.name} className="legend-row">
              <div className="legend-label">
                <span className="legend-dot" style={{ backgroundColor: item.color }} />
                <span>{item.name}</span>
              </div>
              <strong>{currencyFormat(item.amount, currentCurrency)}</strong>
            </div>
          ))}
        </div>
      </div>
    )
  }

  function renderAdminSection() {
    const overview = adminRecords.overview || {}

    if (activeSection === 'users') {
      return (
        <div className="section-stack">
          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Admin Users</p>
                <h2>Manage platform accounts</h2>
              </div>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Status</th>
                    <th>Expense total</th>
                    <th>Income total</th>
                    <th>Transactions</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adminRecords.users.length ? adminRecords.users.map((user) => (
                    <tr key={user.userId}>
                      <td>
                        <strong>{user.fullName || user.email}</strong>
                        <div className="cell-note">{user.email}</div>
                      </td>
                      <td>{isUserActive(user) ? 'Active' : 'Deactive'}</td>
                      <td>{currencyFormat(user.expenseTotal, currentCurrency)}</td>
                      <td>{currencyFormat(user.incomeTotal, currentCurrency)}</td>
                      <td>{(user.expenseCount || 0) + (user.incomeCount || 0)}</td>
                      <td className="actions-cell">
                        <button
                          type="button"
                          className="table-button"
                          onClick={() => handleAdminUserStatus(user.userId, !isUserActive(user))}
                        >
                          {isUserActive(user) ? 'Suspend' : 'Reactivate'}
                        </button>
                        <button
                          type="button"
                          className="table-button danger"
                          onClick={() => handleAdminDeleteUser(user.userId)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" className="empty-state">No users available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )
    }

    if (activeSection === 'transactions') {
      return (
        <div className="section-stack">
          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Platform Activity</p>
                <h2>Expenses and incomes across the platform</h2>
              </div>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Type</th>
                    <th>Title</th>
                    <th>Amount</th>
                    <th>Date & time</th>
                  </tr>
                </thead>
                <tbody>
                  {adminRecords.transactions.length ? adminRecords.transactions.map((item) => (
                    <tr key={`${item.kind}-${item.id}`}>
                      <td>
                        <strong>{item.userName}</strong>
                        <div className="cell-note">{item.email}</div>
                      </td>
                      <td>{item.kind}</td>
                      <td>{item.title}</td>
                      <td>{currencyFormat(item.amount, item.currency || currentCurrency)}</td>
                      <td>{formatDateTime(item.date, session.timezone)}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className="empty-state">No transactions available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )
    }

    if (activeSection === 'broadcast') {
      return (
        <div className="section-stack">
          <section className="panel form-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Broadcast</p>
                <h2>Send a platform-wide message</h2>
              </div>
            </div>
            <form className="form-grid single-column" onSubmit={handleAdminBroadcast}>
              <label className="field">
                <span>Title</span>
                <input
                  value={broadcastForm.title}
                  onChange={(event) => setBroadcastForm((current) => ({ ...current, title: event.target.value }))}
                  required
                />
              </label>
              <label className="field">
                <span>Message</span>
                <textarea
                  rows="5"
                  value={broadcastForm.message}
                  onChange={(event) => setBroadcastForm((current) => ({ ...current, message: event.target.value }))}
                  required
                />
              </label>
              <button type="submit" className="primary-button" disabled={isBusy}>
                {isBusy ? 'Sending...' : 'Send broadcast'}
              </button>
            </form>
          </section>
        </div>
      )
    }

    if (activeSection === 'audit') {
      return (
        <div className="section-stack">
          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Audit Trail</p>
                <h2>Admin activity log</h2>
              </div>
            </div>
              <div className="list-stack">
                {adminRecords.auditLogs.length ? adminRecords.auditLogs.map((entry, index) => (
                <article key={`${entry.timestamp}-${index}`} className="audit-log-card">
                  <div className="audit-log-head">
                    <span className="audit-log-badge">{entry.action}</span>
                    <span className="audit-log-time">{formatDateTime(entry.timestamp, session.timezone)}</span>
                  </div>
                  <div className="audit-log-grid">
                    <div className="audit-log-item">
                      <span>Target</span>
                      <strong>{entry.targetType}</strong>
                    </div>
                    <div className="audit-log-item">
                      <span>Actor</span>
                      <strong>{entry.actorEmail}</strong>
                    </div>
                    <div className="audit-log-item">
                      <span>Reference</span>
                      <strong>{entry.targetId || 'N/A'}</strong>
                    </div>
                  </div>
                  <div className="audit-log-details">
                    <span>Details</span>
                    <p>{entry.details}</p>
                  </div>
                </article>
              )) : (
                <div className="empty-state">No admin actions recorded yet.</div>
              )}
            </div>
          </section>
        </div>
      )
    }

    return (
      <div className="section-stack admin-overview-stack">
        <section className="admin-overview-hero">
          <div>
            <p className="eyebrow">Admin Overview</p>
            <h2>Platform health at a glance</h2>
          </div>
          <p className="hero-copy">
            Review user activity, spending volume, and category trends from one clean control surface.
          </p>
        </section>

        <section className="stats-grid admin-stats-grid">
          <article className="metric-card admin-metric-card">
            <span>Total users</span>
            <strong>{overview.totalUsers || 0}</strong>
            <small>{overview.activeUsers || 0} active</small>
          </article>
          <article className="metric-card admin-metric-card">
            <span>Total transactions</span>
            <strong>{overview.totalTransactions || 0}</strong>
            <small>{overview.suspendedUsers || 0} suspended users</small>
          </article>
          <article className="metric-card admin-metric-card">
            <span>Total expense</span>
            <strong>{currencyFormat(overview.totalExpense || 0, currentCurrency)}</strong>
            <small>Platform-wide spend</small>
          </article>
          <article className="metric-card admin-metric-card">
            <span>Total income</span>
            <strong>{currencyFormat(overview.totalIncome || 0, currentCurrency)}</strong>
            <small>Platform-wide income</small>
          </article>
          <article className="metric-card admin-metric-card">
            <span>Average monthly spend</span>
            <strong>{currencyFormat(overview.averageMonthlySpendPerUser || 0, currentCurrency)}</strong>
            <small>Per user estimate</small>
          </article>
        </section>

        <section className="content-grid admin-overview-grid">
          <article className="panel admin-overview-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Top Spending Users</p>
                <h2>Highest platform spenders</h2>
              </div>
            </div>
            <div className="admin-ranking-list">
              {(overview.topSpendingUsers || []).length ? overview.topSpendingUsers.map((user) => (
                <article key={user.userId} className="admin-ranking-card">
                  <div className="admin-ranking-index">
                    <span>#{(overview.topSpendingUsers || []).findIndex((item) => item.userId === user.userId) + 1}</span>
                  </div>
                  <div className="admin-ranking-copy">
                    <strong>{user.fullName || user.email}</strong>
                    <span>{user.email}</span>
                  </div>
                  <div className="admin-ranking-amount">
                    <span>Total spend</span>
                    <strong>{currencyFormat(user.expenseTotal || 0, currentCurrency)}</strong>
                  </div>
                </article>
              )) : <div className="empty-state">No spending records yet.</div>}
            </div>
          </article>

          <article className="panel admin-overview-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Popular Categories</p>
                <h2>Most used categories</h2>
              </div>
            </div>
            <div className="admin-category-list">
              {(overview.mostUsedCategories || []).length ? overview.mostUsedCategories.map((category) => (
                <article key={category.name} className="admin-category-card">
                  <div>
                    <strong>{category.name}</strong>
                    <span>Category usage</span>
                  </div>
                  <strong>{category.count}</strong>
                </article>
              )) : <div className="empty-state">No category activity yet.</div>}
            </div>
          </article>
        </section>
      </div>
    )
  }

  function renderSection() {
    if (session.role === 'admin') {
      return renderAdminSection()
    }

    if (activeSection === 'dashboard') {
      return (
        <div className="section-stack">
          <section className="hero-panel">
            <div>
              <p className="eyebrow">SpendSmart</p>
              <h1>Expense tracking, budgeting, and insights in one finance cockpit.</h1>
              <p className="hero-copy">
                Stay on top of your money with smart charts, monthly progress, budget tracking, and clear financial
                insights built from your everyday transactions.
              </p>
            </div>
            <div className="hero-actions">
              <label className="field compact">
                <span>Dashboard month</span>
                <input
                  type="month"
                  value={dashboardMonthKey}
                  onChange={(event) => setDashboardMonthKey(event.target.value)}
                />
              </label>
              <button type="button" className="ghost-button" onClick={() => setRefreshToken((value) => value + 1)}>
                Refresh data
              </button>
            </div>
          </section>

          <section className="stats-grid">
            <article className="metric-card">
              <span>Total income</span>
              <strong>{currencyFormat(totalIncome, currentCurrency)}</strong>
              <small>{monthYearLabel(Number(dashboardMonthKey.slice(0, 4)), Number(dashboardMonthKey.slice(5, 7)))}</small>
            </article>
            <article className="metric-card">
              <span>Total expenses</span>
              <strong>{currencyFormat(totalExpense, currentCurrency)}</strong>
              <small>{expenseBreakdown.length} active categories</small>
            </article>
            <article className="metric-card">
              <span>Net savings</span>
              <strong>{currencyFormat(balance, currentCurrency)}</strong>
              <small>{savingsRate.toFixed(1)}% savings rate</small>
            </article>
            <article className="metric-card">
              <span>Health score</span>
              <strong>{financialHealthScore === null ? '--' : `${financialHealthScore}/100`}</strong>
              <small>
                {financialHealthScore === null
                  ? 'Start adding income, expense, or a budget to generate your score'
                  : 'Built from savings, budget adherence, and spend ratio'}
              </small>
            </article>
          </section>

          <section className="content-grid">
            <article className="panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Visualization</p>
                  <h2>Category breakdown</h2>
                </div>
              </div>
              {renderDonutChart()}
            </article>

            <article className="panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Budget</p>
                  <h2>Monthly utilisation</h2>
                </div>
                <strong>{budgetLimit ? currencyFormat(budgetLimit, currentCurrency) : 'No budget set'}</strong>
              </div>
              <div className="budget-meter">
                <div className="budget-meter-fill" style={{ width: `${Math.min(budgetProgress, 100)}%` }} />
              </div>
              <div className="budget-meta">
                <span>Spent {currencyFormat(totalExpense, currentCurrency)}</span>
                <span>{budgetProgress.toFixed(0)}% used</span>
              </div>
              <div className="insight-strip">
                <div>
                  <span>Forecast</span>
                  <strong>{currencyFormat(spendingForecast, currentCurrency)}</strong>
                </div>
                <div>
                  <span>Backend summary</span>
                  <strong>{records.summary ? currencyFormat(records.summary.balance, currentCurrency) : 'Loading'}</strong>
                </div>
              </div>
            </article>
          </section>

          <section className="content-grid">
            <article className="panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Trend</p>
                  <h2>Cash flow over the last 6 months</h2>
                </div>
              </div>
              <div className="bars-chart">
                {sixMonthSeries.map((item) => {
                  const peak = Math.max(...sixMonthSeries.map((month) => Math.max(month.expenseAmount, month.incomeAmount)), 1)
                  return (
                    <div key={item.key} className="bar-group">
                      <div className="bar-stack">
                        <div className="bar income" style={{ height: `${(item.incomeAmount / peak) * 160}px` }} />
                        <div className="bar expense" style={{ height: `${(item.expenseAmount / peak) * 160}px` }} />
                      </div>
                      <strong>{item.shortLabel}</strong>
                      <span>{currencyFormat(item.incomeAmount - item.expenseAmount, currentCurrency)}</span>
                    </div>
                  )
                })}
              </div>
            </article>

            <article className="panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Daily line</p>
                  <h2>Expense trend for the selected month</h2>
                </div>
              </div>
              <svg className="line-chart" viewBox="0 0 420 180" role="img" aria-label="Daily expense trend">
                <polyline points={computePolylinePoints(dailyTotals, 420, 160)} />
              </svg>
              <div className="chart-caption">
                <span>Low</span>
                <strong>{currencyFormat(Math.max(...dailyTotals), currentCurrency)}</strong>
                <span>Peak day</span>
              </div>
            </article>
          </section>

          <section className="content-grid">
            <article className="panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Savings</p>
                  <h2>Rate trend</h2>
                </div>
              </div>
              <svg className="line-chart amber" viewBox="0 0 420 180" role="img" aria-label="Savings rate trend">
                <polyline points={computePolylinePoints(sixMonthSeries.map((item) => clamp(item.savingsRate + 100, 0, 200)), 420, 160)} />
              </svg>
              <div className="mini-list">
                {sixMonthSeries.map((item) => (
                  <div key={item.key}>
                    <span>{item.shortLabel}</span>
                    <strong>{item.savingsRate.toFixed(1)}%</strong>
                  </div>
                ))}
              </div>
            </article>

            <article className="panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Upcoming</p>
                  <h2>Recurring payments</h2>
                </div>
              </div>
              <div className="list-stack">
                {recurringDueThisMonth.length ? recurringDueThisMonth.map((item) => (
                  <div key={item.id} className="recurring-card">
                    <div className="recurring-main">
                      <strong>{item.title}</strong>
                      <span>{item.frequency} · {item.type}</span>
                    </div>
                    <div className="recurring-amount">
                      <strong>{currencyFormat(item.amount, currentCurrency)}</strong>
                      <span>{formatDateOnly(item.nextExecutionDate || item.startDate, session.timezone)}</span>
                    </div>
                  </div>
                )) : (
                  <div className="empty-state">No recurring payments are scheduled yet.</div>
                )}
              </div>
            </article>
          </section>

          <section className="content-grid">
            <article className="panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Top categories</p>
                  <h2>Most active spending buckets</h2>
                </div>
              </div>
              <div className="list-stack">
                {topCategories.length ? topCategories.map((item, index) => (
                  <div key={item.name} className="list-row">
                    <div>
                      <strong>#{index + 1} {item.name}</strong>
                      <span>{((item.amount / chartTotal) * 100).toFixed(1)}% of this month</span>
                    </div>
                    <strong>{currencyFormat(item.amount, currentCurrency)}</strong>
                  </div>
                )) : <div className="empty-state">Top categories will appear once you log some expenses.</div>}
              </div>
            </article>

            <article className="panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Quick guide</p>
                  <h2>Get more from your dashboard</h2>
                </div>
              </div>
              <ul className="note-list">
                <li>Log both expenses and income regularly to keep your monthly numbers meaningful.</li>
                <li>Use budgets and categories together to spot overspending before the month gets away from you.</li>
                <li>Check your charts often to understand where your money is going and what is improving.</li>
              </ul>
            </article>
          </section>
        </div>
      )
    }

    if (activeSection === 'expenses') {
      return (
        <div className="section-stack">
          <section className="panel form-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Expense management</p>
                <h2>{expenseForm.expenseId ? 'Edit expense' : 'Add expense'}</h2>
              </div>
              {expenseForm.expenseId ? (
                <button type="button" className="ghost-button" onClick={() => setExpenseForm(emptyExpenseForm)}>
                  Clear
                </button>
              ) : null}
            </div>
            <form className="form-grid" onSubmit={handleExpenseSubmit}>
              <label className="field">
                <span>Title</span>
                <input value={expenseForm.title} onChange={(event) => setExpenseForm({ ...expenseForm, title: event.target.value })} required />
              </label>
              <label className="field">
                <span>Amount</span>
                <input type="number" min="0" step="0.01" value={expenseForm.amount} onChange={(event) => setExpenseForm({ ...expenseForm, amount: event.target.value })} required />
              </label>
              <label className="field">
                <span>Category</span>
                <select value={expenseForm.categoryId} onChange={(event) => setExpenseForm({ ...expenseForm, categoryId: event.target.value })}>
                  <option value="">Uncategorised</option>
                  {expenseCategories.map((category) => (
                    <option key={category.categoryId} value={category.categoryId}>{category.name}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Date</span>
                <input type="date" value={expenseForm.date} onChange={(event) => setExpenseForm({ ...expenseForm, date: event.target.value })} required />
              </label>
              <label className="field">
                <span>Payment method</span>
                <select value={expenseForm.paymentMethod} onChange={(event) => setExpenseForm({ ...expenseForm, paymentMethod: event.target.value })}>
                  {paymentMethods.map((method) => <option key={method} value={method}>{method}</option>)}
                </select>
              </label>
              <label className="field">
                <span>Type</span>
                <select value={expenseForm.type} onChange={(event) => setExpenseForm({ ...expenseForm, type: event.target.value })}>
                  {expenseTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </label>
              <label className="field wide">
                <span>Notes</span>
                <textarea rows="3" value={expenseForm.notes} onChange={(event) => setExpenseForm({ ...expenseForm, notes: event.target.value })} />
              </label>
              <label className="field wide">
                <span>Receipt URL</span>
                <input value={expenseForm.receiptUrl} onChange={(event) => setExpenseForm({ ...expenseForm, receiptUrl: event.target.value })} placeholder="https://..." />
              </label>
              <label className="checkbox-row">
                <input type="checkbox" checked={expenseForm.isRecurring} onChange={(event) => setExpenseForm({ ...expenseForm, isRecurring: event.target.checked })} />
                <span>Create a recurring rule from this expense</span>
              </label>
              {expenseForm.isRecurring ? (
                <label className="field">
                  <span>Recurring frequency</span>
                  <select value={expenseForm.recurringFrequency} onChange={(event) => setExpenseForm({ ...expenseForm, recurringFrequency: event.target.value })}>
                    {recurringFrequencies.map((frequency) => <option key={frequency} value={frequency}>{frequency}</option>)}
                  </select>
                </label>
              ) : null}
              <button type="submit" className="primary-button">{expenseForm.expenseId ? 'Update expense' : 'Save expense'}</button>
            </form>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Expense list</p>
                <h2>Search and review</h2>
              </div>
              <strong>{currencyFormat(filteredExpenses.reduce((sum, expense) => sum + toNumber(expense.amount), 0), currentCurrency)}</strong>
            </div>
            <div className="filter-grid">
              <label className="field">
                <span>Keyword</span>
                <input value={expenseFilters.keyword} onChange={(event) => setExpenseFilters({ ...expenseFilters, keyword: event.target.value })} placeholder="Bills, groceries..." />
              </label>
              <label className="field">
                <span>Category</span>
                <select value={expenseFilters.categoryId} onChange={(event) => setExpenseFilters({ ...expenseFilters, categoryId: event.target.value })}>
                  <option value="ALL">All</option>
                  {expenseCategories.map((category) => <option key={category.categoryId} value={category.categoryId}>{category.name}</option>)}
                </select>
              </label>
              <label className="field">
                <span>Payment method</span>
                <select value={expenseFilters.paymentMethod} onChange={(event) => setExpenseFilters({ ...expenseFilters, paymentMethod: event.target.value })}>
                  <option value="ALL">All</option>
                  {paymentMethods.map((method) => <option key={method} value={method}>{method}</option>)}
                </select>
              </label>
              <label className="field">
                <span>Month</span>
                <input type="month" value={expenseFilters.monthKey} onChange={(event) => setExpenseFilters({ ...expenseFilters, monthKey: event.target.value })} />
              </label>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Payment</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.length ? filteredExpenses.map((expense) => (
                    <tr key={expense.expenseId}>
                      <td>
                        <strong>{expense.title}</strong>
                        <div className="cell-note">{expense.notes || 'No notes'}</div>
                      </td>
                      <td>{categoriesById[expense.categoryId]?.name || 'Uncategorised'}</td>
                      <td>{currencyFormat(expense.amount, expense.currency || currentCurrency)}</td>
                      <td>{fromApiDate(expense.date)}</td>
                      <td>{expense.paymentMethod}</td>
                      <td className="actions-cell">
                        <button type="button" className="table-button" onClick={() => applyExpenseToForm(expense)}>Edit</button>
                        <button type="button" className="table-button danger" onClick={() => deleteResource(`/expenses/${expense.expenseId}`, 'Expense deleted successfully.')}>Delete</button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" className="empty-state">No expenses match the current filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )
    }

    if (activeSection === 'income') {
      return (
        <div className="section-stack">
          <section className="panel form-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Income management</p>
                <h2>{incomeForm.incomeId ? 'Edit income' : 'Add income'}</h2>
              </div>
              {incomeForm.incomeId ? (
                <button type="button" className="ghost-button" onClick={() => setIncomeForm(emptyIncomeForm)}>
                  Clear
                </button>
              ) : null}
            </div>
            <form className="form-grid" onSubmit={handleIncomeSubmit}>
              <label className="field">
                <span>Source</span>
                <select value={incomeForm.source} onChange={(event) => setIncomeForm({ ...incomeForm, source: event.target.value })}>
                  {incomeSources.map((source) => <option key={source} value={source}>{source}</option>)}
                </select>
              </label>
              <label className="field">
                <span>Amount</span>
                <input type="number" min="0" step="0.01" value={incomeForm.amount} onChange={(event) => setIncomeForm({ ...incomeForm, amount: event.target.value })} required />
              </label>
              <label className="field">
                <span>Date</span>
                <input type="date" value={incomeForm.date} onChange={(event) => setIncomeForm({ ...incomeForm, date: event.target.value })} required />
              </label>
              <label className="checkbox-row">
                <input type="checkbox" checked={incomeForm.isRecurring} onChange={(event) => setIncomeForm({ ...incomeForm, isRecurring: event.target.checked })} />
                <span>Create a recurring rule from this income</span>
              </label>
              {incomeForm.isRecurring ? (
                <label className="field">
                  <span>Recurring frequency</span>
                  <select value={incomeForm.recurringFrequency} onChange={(event) => setIncomeForm({ ...incomeForm, recurringFrequency: event.target.value })}>
                    {recurringFrequencies.map((frequency) => <option key={frequency} value={frequency}>{frequency}</option>)}
                  </select>
                </label>
              ) : null}
              <label className="field wide">
                <span>Notes</span>
                <textarea rows="3" value={incomeForm.notes} onChange={(event) => setIncomeForm({ ...incomeForm, notes: event.target.value })} />
              </label>
              <button type="submit" className="primary-button">{incomeForm.incomeId ? 'Update income' : 'Save income'}</button>
            </form>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Income list</p>
                <h2>Track every inflow</h2>
              </div>
              <strong>{currencyFormat(filteredIncomes.reduce((sum, income) => sum + toNumber(income.amount), 0), currentCurrency)}</strong>
            </div>
            <div className="filter-grid">
              <label className="field">
                <span>Keyword</span>
                <input value={incomeFilters.keyword} onChange={(event) => setIncomeFilters({ ...incomeFilters, keyword: event.target.value })} placeholder="Salary, freelance..." />
              </label>
              <label className="field">
                <span>Source</span>
                <select value={incomeFilters.source} onChange={(event) => setIncomeFilters({ ...incomeFilters, source: event.target.value })}>
                  <option value="ALL">All</option>
                  {incomeSources.map((source) => <option key={source} value={source}>{source}</option>)}
                </select>
              </label>
              <label className="field">
                <span>Month</span>
                <input type="month" value={incomeFilters.monthKey} onChange={(event) => setIncomeFilters({ ...incomeFilters, monthKey: event.target.value })} />
              </label>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Source</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Recurring</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIncomes.length ? filteredIncomes.map((income) => (
                    <tr key={income.incomeId}>
                      <td>
                        <strong>{income.source}</strong>
                        <div className="cell-note">{income.notes || 'No notes'}</div>
                      </td>
                      <td>{currencyFormat(income.amount, income.currency || currentCurrency)}</td>
                      <td>{fromApiDate(income.date)}</td>
                      <td>{income.isRecurring ? 'Yes' : 'No'}</td>
                      <td className="actions-cell">
                        <button type="button" className="table-button" onClick={() => applyIncomeToForm(income)}>Edit</button>
                        <button type="button" className="table-button danger" onClick={() => deleteResource(`/income/${income.incomeId}`, 'Income deleted successfully.')}>Delete</button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className="empty-state">No income entries match the current filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )
    }

    if (activeSection === 'categories') {
      return (
        <div className="section-stack">
          <section className="panel form-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Category management</p>
                <h2>{categoryForm.categoryId ? 'Edit category' : 'Create category'}</h2>
              </div>
              {categoryForm.categoryId ? (
                <button type="button" className="ghost-button" onClick={() => setCategoryForm(emptyCategoryForm)}>
                  Clear
                </button>
              ) : null}
            </div>
            <form className="form-grid" onSubmit={handleCategorySubmit}>
              <label className="field">
                <span>Name</span>
                <input value={categoryForm.name} onChange={(event) => setCategoryForm({ ...categoryForm, name: event.target.value })} required />
              </label>
              <label className="field">
                <span>Type</span>
                <select value={categoryForm.type} onChange={(event) => setCategoryForm({ ...categoryForm, type: event.target.value })}>
                  {categoryTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </label>
              <label className="field">
                <span>Icon</span>
                <input value={categoryForm.icon} onChange={(event) => setCategoryForm({ ...categoryForm, icon: event.target.value })} maxLength="4" />
              </label>
              <label className="field">
                <span>Color</span>
                <input type="color" value={categoryForm.color} onChange={(event) => setCategoryForm({ ...categoryForm, color: event.target.value })} />
              </label>
              <button type="submit" className="primary-button">{categoryForm.categoryId ? 'Update category' : 'Save category'}</button>
            </form>
          </section>

          <section className="content-grid">
            {[{ title: 'Expense categories', items: expenseCategories }, { title: 'Income categories', items: incomeCategories }].map((bucket) => (
              <article className="panel" key={bucket.title}>
                <div className="panel-header">
                  <div>
                    <p className="eyebrow">Categories</p>
                    <h2>{bucket.title}</h2>
                  </div>
                  <strong>{bucket.items.length}</strong>
                </div>
                <div className="list-stack">
                  {bucket.items.length ? bucket.items.map((category) => {
                    return (
                      <div key={category.categoryId} className="category-card">
                        <div className="category-chip" style={{ backgroundColor: `${category.color}22`, color: category.color }}>
                          <span>{category.icon || '•'}</span>
                          <strong>{category.name}</strong>
                        </div>
                        <div className="category-meta">
                          <strong>{category.type === 'EXPENSE' ? 'EXPENSE' : 'INCOME'}</strong>
                          <span>{category.type === 'EXPENSE' ? 'Expense' : 'Income'}</span>
                        </div>
                        <div className="actions-inline">
                          <button type="button" className="table-button" onClick={() => applyCategoryToForm(category)}>Edit</button>
                          <button type="button" className="table-button danger" onClick={() => deleteResource(`/categories/${category.categoryId}`, 'Category deleted successfully.')}>Delete</button>
                        </div>
                      </div>
                    )
                  }) : <div className="empty-state">No categories yet.</div>}
                </div>
              </article>
            ))}
          </section>
        </div>
      )
    }

    if (activeSection === 'budgets') {
      return (
        <div className="section-stack">
          <section className="panel form-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Budget management</p>
                <h2>{budgetForm.budgetId ? 'Edit monthly budget' : 'Create monthly budget'}</h2>
              </div>
            </div>
            <form className="form-grid" onSubmit={handleBudgetSubmit}>
              <label className="field">
                <span>Monthly limit</span>
                <input type="number" min="0" step="0.01" value={budgetForm.monthlyLimit} onChange={(event) => setBudgetForm({ ...budgetForm, monthlyLimit: event.target.value })} required />
              </label>
              <label className="field">
                <span>Currency</span>
                <select value={budgetForm.currency} onChange={(event) => setBudgetForm({ ...budgetForm, currency: event.target.value })}>
                  {supportedCurrencies.map((currency) => <option key={currency} value={currency}>{currency}</option>)}
                </select>
              </label>
              <label className="field">
                <span>Month</span>
                <select value={budgetForm.month} onChange={(event) => setBudgetForm({ ...budgetForm, month: Number(event.target.value) })}>
                  {monthLabels.map((label, index) => <option key={label} value={index + 1}>{label}</option>)}
                </select>
              </label>
              <label className="field">
                <span>Year</span>
                <input type="number" min="2024" max="2100" value={budgetForm.year} onChange={(event) => setBudgetForm({ ...budgetForm, year: Number(event.target.value) })} />
              </label>
              <button type="submit" className="primary-button">{budgetForm.budgetId ? 'Update budget' : 'Save budget'}</button>
            </form>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Active budgets</p>
                <h2>Progress snapshot</h2>
              </div>
            </div>
            <div className="cards-grid">
                {budgetCards.length ? budgetCards.map((budget) => (
                  <article key={budget.budgetId} className="budget-card">
                    <div className="budget-card-top">
                      <div className="budget-card-copy">
                        <strong>{monthYearLabel(budget.year, budget.month)}</strong>
                        <span>Budget cap {currencyFormat(budget.monthlyLimit, budget.currency || currentCurrency)}</span>
                      </div>
                      <div className="budget-card-actions">
                        <button type="button" className="table-button" onClick={() => applyBudgetToForm(budget)}>Edit</button>
                        <button type="button" className="table-button danger" onClick={() => deleteResource(`/budgets/${budget.budgetId}`, 'Budget deleted successfully.')}>Delete</button>
                      </div>
                    </div>
                    <div className="budget-meter">
                      <div className="budget-meter-fill" style={{ width: `${Math.min(budget.progress, 100)}%` }} />
                    </div>
                    <div className="budget-card-bottom">
                      <div className="budget-meta">
                        <span>Spent {currencyFormat(budget.spentAmount, budget.currency || currentCurrency)}</span>
                        <span>{budget.progress.toFixed(0)}%</span>
                      </div>
                      <div className="budget-card-status">
                        {budget.progress > 100
                          ? 'Budget limit exceeded'
                          : budget.progress === 100
                            ? 'Budget fully used'
                            : 'Within budget'}
                      </div>
                    </div>
                  </article>
                )) : <div className="empty-state">Create your first budget to monitor spending in real time.</div>}
            </div>
          </section>
        </div>
      )
    }

    if (activeSection === 'recurring') {
      if (!recurringAccess.active) {
        return (
          <div className="section-stack">
            <section className="panel form-panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Recurring Access</p>
                  <h2>Unlock recurring transactions</h2>
                </div>
              </div>
              <div className="list-stack">
                <div className="list-row recurring-access-row">
                  <div className="row-copy">
                    <strong>Recurring service is locked</strong>
                    <span>{recurringAccess.message}</span>
                  </div>
                  <div className="recurring-price">
                    <strong>Rs 199</strong>
                    <span>30 days access</span>
                  </div>
                </div>
                <div className="list-row recurring-access-row">
                  <div className="row-copy">
                    <strong>What you get</strong>
                    <span>Create automated expense and income schedules after payment.</span>
                  </div>
                  <div className="align-right">
                    <button type="button" className="primary-button" onClick={handleRecurringAccessPayment} disabled={isCheckoutOpening || isBusy}>
                      {isCheckoutOpening ? 'Opening checkout...' : 'Pay & unlock'}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )
      }

      return (
        <div className="section-stack">
          <section className="panel form-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Recurring rules</p>
                <h2>Add an automated transaction schedule</h2>
              </div>
              <div className="align-right">
                <strong>Access active</strong>
                <span className="recurring-validity">Valid until {formatDateTime(recurringAccess.validUntil, session.timezone)}</span>
              </div>
            </div>
            <form className="form-grid" onSubmit={handleRecurringSubmit}>
              <label className="field">
                <span>Title</span>
                <input value={recurringForm.title} onChange={(event) => setRecurringForm({ ...recurringForm, title: event.target.value })} required />
              </label>
              <label className="field">
                <span>Amount</span>
                <input type="number" min="0" step="0.01" value={recurringForm.amount} onChange={(event) => setRecurringForm({ ...recurringForm, amount: event.target.value })} required />
              </label>
              <label className="field">
                <span>Type</span>
                <select value={recurringForm.type} onChange={(event) => setRecurringForm({ ...recurringForm, type: event.target.value })}>
                  {recurringTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </label>
              <label className="field">
                <span>Category</span>
                <select value={recurringForm.categoryId} onChange={(event) => setRecurringForm({ ...recurringForm, categoryId: event.target.value })}>
                  <option value="">None</option>
                  {expenseCategories.map((category) => <option key={category.categoryId} value={category.categoryId}>{category.name}</option>)}
                </select>
              </label>
              <label className="field">
                <span>Frequency</span>
                <select value={recurringForm.frequency} onChange={(event) => setRecurringForm({ ...recurringForm, frequency: event.target.value })}>
                  {recurringFrequencies.map((frequency) => <option key={frequency} value={frequency}>{frequency}</option>)}
                </select>
              </label>
              <label className="field">
                <span>Start date</span>
                <input type="date" value={recurringForm.startDate} onChange={(event) => setRecurringForm({ ...recurringForm, startDate: event.target.value })} required />
              </label>
              <button type="submit" className="primary-button">Save recurring rule</button>
            </form>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Recurring list</p>
                <h2>All scheduled transactions</h2>
              </div>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Frequency</th>
                    <th>Next execution</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.recurring.length ? records.recurring.map((item) => (
                    <tr key={item.id}>
                      <td>{item.title}</td>
                      <td>{item.type}</td>
                      <td>{item.frequency}</td>
                      <td>{formatDateOnly(item.nextExecutionDate || item.startDate, session.timezone)}</td>
                      <td>{currencyFormat(item.amount, currentCurrency)}</td>
                      <td className="actions-cell">
                        <button type="button" className="table-button danger" onClick={() => deleteResource(`/recurring/${item.id}`, 'Recurring rule deleted successfully.')}>Delete</button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" className="empty-state">No recurring rules yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )
    }

    return (
      <div className="section-stack">
        <section className="panel form-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Preferences</p>
              <h2>Manage your account settings</h2>
            </div>
          </div>
          <form className="form-grid" onSubmit={handleProfileSubmit}>
            <label className="field">
              <span>Preferred currency</span>
              <select value={profileForm.currency} onChange={(event) => setProfileForm({ ...profileForm, currency: event.target.value })}>
                {supportedCurrencies.map((currency) => <option key={currency} value={currency}>{currency}</option>)}
              </select>
            </label>
            <label className="field">
              <span>Timezone</span>
              <select
                value={profileForm.timezoneChoice}
                onChange={(event) => {
                  const selectedOption = timezoneOptions.find((option) => option.id === event.target.value) || timezoneOptions[0]
                  setProfileForm({
                    ...profileForm,
                    timezoneChoice: selectedOption.id,
                    timezone: selectedOption.value,
                  })
                }}
              >
                {timezoneOptions.map((timezone) => (
                  <option key={timezone.id} value={timezone.id}>{timezone.label}</option>
                ))}
              </select>
            </label>
            <button type="submit" className="primary-button" disabled={isProfileSaving || isBusy}>
              {isProfileSaving ? 'Saving...' : 'Save preferences'}
            </button>
          </form>
        </section>

        <section className="panel form-panel">
          <div className="panel-header">
              <div>
                <p className="eyebrow">Profile</p>
              <h2>Income and expense summary</h2>
            </div>
          </div>
          <div className="profile-grid">
            <div className="profile-card">
              <span>Name</span>
              <strong>{session.fullName || 'Not set'}</strong>
            </div>
            <div className="profile-card">
              <span>Email</span>
              <strong>{session.email}</strong>
            </div>
            <div className="profile-card">
              <span>User ID</span>
              <strong>{session.userId || 'Connect account'}</strong>
            </div>
            <div className="profile-card">
              <span>Currency</span>
              <strong>{session.currency || 'INR'}</strong>
            </div>
            <div className="profile-card">
              <span>Timezone</span>
              <strong>{currentTimezone}</strong>
            </div>
            <div className="profile-card">
              <span>Total income</span>
              <strong>{currencyFormat(allIncomeTotal, currentCurrency)}</strong>
            </div>
            <div className="profile-card">
              <span>Monthly budget goal</span>
              <strong>{currencyFormat(latestBudget?.monthlyLimit ?? session.monthlyBudget ?? 0, currentCurrency)}</strong>
            </div>
            <div className="profile-card">
              <span>Total expense</span>
              <strong>{currencyFormat(allExpenseTotal, currentCurrency)}</strong>
            </div>
          </div>
        </section>
        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Account tips</p>
              <h2>Use the app smoothly</h2>
            </div>
          </div>
          <ul className="note-list">
            <li>Add your monthly budget here before tracking daily expenses.</li>
            <li>Use the Budgets page to check how much of the month&apos;s limit is already used.</li>
            <li>Watch notifications when spending crosses your budget range.</li>
          </ul>
        </section>
      </div>
    )
  }

  if (!session.token) {
    return (
      <main className="auth-shell">
        <section className="auth-intro">
          <div className="auth-logo">
            <div className="auth-logo-mark">
              <span>₹</span>
            </div>
            <div>
              <strong>SpendSmart</strong>
              <small>Money clarity, daily</small>
            </div>
          </div>
          <p className="eyebrow">Welcome aboard</p>
          <h1>SPEND SMART</h1>
          <p>
            Track every rupee with clarity, build smarter money habits, and watch your spending story unfold
            through clean dashboards, quick insights, and daily progress that actually feels motivating.
          </p>
          <div className="auth-visual auth-feature-grid">
            {authFeatureHighlights.map((item) => (
              <article key={item.key} className={`auth-feature-card ${item.key}`}>
                <div className="feature-icon-wrap">{renderAuthFeatureIcon(item.key)}</div>
                <div className="feature-copy">
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="intro-badges">
            <span>Simple daily tracking</span>
            <span>Smart spending insights</span>
            <span>Budgets that keep you focused</span>
          </div>
        </section>

        <section className="auth-card">
          <div className="auth-card-top">
            <button type="button" className="theme-toggle" onClick={toggleTheme}>
              {theme === 'dark' ? 'Light theme' : 'Dark theme'}
            </button>
          </div>
          <div className="auth-switch">
            <button type="button" className={authMode === 'login' ? 'active' : ''} onClick={() => handleAuthModeChange('login')}>
              Login
            </button>
            <button type="button" className={authMode === 'register' ? 'active' : ''} onClick={() => handleAuthModeChange('register')}>
              Register
            </button>
            <button type="button" className={authMode === 'admin' ? 'active' : ''} onClick={() => handleAuthModeChange('admin')}>
              Admin
            </button>
          </div>
          <form className="form-grid single-column" onSubmit={handleAuthSubmit}>
            {authMode === 'register' ? (
              <label className="field">
                <span>Full name</span>
                <input value={authForm.fullName} onChange={(event) => updateAuthForm({ fullName: event.target.value })} required />
              </label>
            ) : null}
            <label className="field">
              <span>Email</span>
              <input type="email" value={authForm.email} onChange={(event) => updateAuthForm({ email: event.target.value }, { resetOtpSent: true })} required />
            </label>
            {authMode === 'register' || authMode === 'forgot' ? (
              <>
                <label className={isOtpSent ? 'field otp-field' : 'field otp-field hidden'}>
                  <span>OTP</span>
                  <input
                    inputMode="numeric"
                    maxLength="6"
                    value={authForm.otp}
                    onChange={(event) => updateAuthForm({ otp: event.target.value.replace(/\D/g, '').slice(0, 6) }, { resetOtpVerified: true })}
                    placeholder="Enter 6 digit OTP"
                    required
                  />
                </label>
                <button
                  type="button"
                  className={isOtpVerified ? 'ghost-button otp-button verified' : 'ghost-button otp-button'}
                  onClick={handleOtpAction}
                  disabled={isOtpSending || isOtpVerifying || isOtpVerified || isBusy}
                >
                  {isOtpSending
                    ? 'Sending...'
                    : isOtpVerifying
                      ? 'Verifying...'
                      : isOtpVerified
                        ? 'Verified'
                        : isOtpSent
                          ? 'Verify OTP'
                          : 'Send OTP'}
                </button>
              </>
            ) : null}
            <label className="field">
              <span>{authMode === 'forgot' ? 'New password' : 'Password'}</span>
              <input
                type="password"
                value={authForm.password}
                onChange={(event) => updateAuthForm({ password: event.target.value })}
                pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$"
                title="Password must contain at least one uppercase letter, one lowercase letter, one digit, one special character, and be at least 8 characters long."
                required
              />
            </label>
            <button type="submit" className="primary-button" disabled={isBusy || ((authMode === 'register' || authMode === 'forgot') && !isOtpVerified)}>
              {isBusy
                ? 'Please wait...'
                : authMode === 'login'
                  ? 'Sign in'
                  : authMode === 'admin'
                    ? 'Login'
                    : authMode === 'forgot'
                      ? 'Reset password'
                      : 'Create account'}
            </button>
            {authMode === 'login' ? (
              <button type="button" className="auth-link-button" onClick={() => handleAuthModeChange('forgot')}>
                Forgot password?
              </button>
            ) : null}
            {authMode === 'forgot' ? (
              <button type="button" className="auth-link-button" onClick={() => handleAuthModeChange('login')}>
                Back to login
              </button>
            ) : null}
          </form>
          {statusMessage ? <div className="banner success">{statusMessage}</div> : null}
          {errorMessage ? <div className="banner error">{errorMessage}</div> : null}
        </section>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <p className="eyebrow">SpendSmart</p>
          <strong>{session.fullName || session.email}</strong>
          <span>{session.role === 'admin' ? 'Role: Administrator' : `User ID: ${session.userId || 'Connect account'}`}</span>
        </div>
        <nav className="nav-stack">
          {visibleNavItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={activeSection === item.id ? 'nav-item active' : 'nav-item'}
              onClick={() => setActiveSection(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <button type="button" className="ghost-button" onClick={logout}>Logout</button>
      </aside>

      <section className="workspace">
        <header className="workspace-header">
          <div>
            <p className="eyebrow">Expense Tracker App</p>
            <h1>{visibleNavItems.find((item) => item.id === activeSection)?.label || 'Dashboard'}</h1>
          </div>
          <div className="header-actions">
            <span>{currentCurrency} | {currentTimezone}</span>
            <button type="button" className="theme-toggle compact" onClick={toggleTheme}>
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
            <span>{formatHeaderDateTime(currentDateTime, session.timezone)}</span>
            <span className="status-pill ready">Workspace active</span>
          </div>
        </header>

        {!session.userId ? (
          <section className="panel form-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">One-time setup</p>
                <h2>Connect your user ID</h2>
              </div>
            </div>
            <p className="helper-copy">
              Login returns only a JWT in the current backend. To fetch your expenses, income, budgets, and categories,
              the frontend also needs your numeric `userId`.
            </p>
            <form className="form-grid single-column" onSubmit={connectExistingAccount}>
              <label className="field">
                <span>User ID</span>
                <input value={accountLinkUserId} onChange={(event) => setAccountLinkUserId(event.target.value)} placeholder="Example: 1" />
              </label>
              <button type="submit" className="primary-button">Connect account</button>
            </form>
          </section>
        ) : (
          renderSection()
        )}

        {statusMessage ? <div className="banner success sticky">{statusMessage}</div> : null}
        {errorMessage ? <div className="banner error sticky">{errorMessage}</div> : null}
      </section>
    </main>
  )
}

export default App
