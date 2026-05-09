import { LazyMotion, domAnimation, m } from 'framer-motion'
import { memo, useEffect, useMemo, useState } from 'react'

const featureCards = [
  { key: 'income', title: 'Income Tracking', desc: 'Track salary and side income in one place.', accent: 'from-emerald-400/30 to-emerald-500/10' },
  { key: 'expense', title: 'Expense Tracking', desc: 'Log and categorize expenses effortlessly.', accent: 'from-orange-400/30 to-rose-500/10' },
  { key: 'budgets', title: 'Smart Budgets', desc: 'Set focused limits and stay in control.', accent: 'from-blue-400/30 to-violet-500/10' },
  { key: 'recurring', title: 'Recurring Flows', desc: 'Automate recurring income and expenses.', accent: 'from-teal-400/30 to-cyan-500/10' },
]

const transactions = [
  { id: 1, label: 'Salary credit', amount: '+ INR 65,000', tone: 'text-emerald-300' },
  { id: 2, label: 'Groceries', amount: '- INR 2,480', tone: 'text-rose-300' },
  { id: 3, label: 'Electricity bill', amount: '- INR 1,960', tone: 'text-orange-300' },
]

function iconFor(key) {
  switch (key) {
    case 'income':
      return '?'
    case 'expense':
      return '?'
    case 'budgets':
      return '?'
    default:
      return '?'
  }
}

function SpendSmartHeroPreview() {
  const [spot, setSpot] = useState({ x: 260, y: 180 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 850)
    return () => clearTimeout(t)
  }, [])

  const bars = useMemo(() => [68, 84, 58, 92, 72, 88], [])

  return (
    <LazyMotion features={domAnimation}>
      <m.section
        onMouseMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect()
          setSpot({ x: event.clientX - rect.left, y: event.clientY - rect.top })
        }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-[30px] border border-emerald-200/15 bg-slate-950/80 p-10 text-slate-100 shadow-[0_30px_90px_rgba(3,8,20,0.42)]"
      >
        <m.div
          aria-hidden
          animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(120deg,#04151a,#071a2e,#07231f,#04151a)] bg-[length:240%_240%]"
        />

        <m.div
          aria-hidden
          animate={{ x: spot.x - 220, y: spot.y - 220 }}
          transition={{ type: 'spring', stiffness: 120, damping: 22, mass: 0.3 }}
          className="pointer-events-none absolute -z-10 h-[440px] w-[440px] rounded-full bg-emerald-300/10 blur-3xl"
        />

        <div className="relative z-10">
          <m.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="mb-3 text-xs font-semibold tracking-[0.22em] text-amber-300/95">
            WELCOME ABOARD
          </m.p>
          <m.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="font-serif text-6xl leading-[0.95] text-emerald-50">
            SPEND SMART
          </m.h1>
          <m.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="mt-6 max-w-3xl text-xl leading-relaxed text-slate-300/95">
            A cleaner, faster way to monitor income, control expenses, and keep budgets healthy.
          </m.p>

          <m.div
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.16 } } }}
            className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            {featureCards.map((card) => (
              <m.article
                key={card.key}
                variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
                whileHover={{ y: -3, scale: 1.012 }}
                transition={{ duration: 0.24, ease: 'easeOut' }}
                className="group relative overflow-hidden rounded-2xl border border-white/15 bg-slate-900/55 p-4 shadow-[0_12px_34px_rgba(3,8,20,0.35)] backdrop-blur-xl"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${card.accent} opacity-70 transition-opacity duration-300 group-hover:opacity-95`} />
                <div className="relative flex items-start gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-xl border border-white/20 bg-slate-900/60 text-lg text-slate-100">
                    {iconFor(card.key)}
                  </div>
                  <div>
                    <h3 className="text-[1.04rem] font-semibold tracking-wide text-white">{card.title}</h3>
                    <p className="mt-1 text-sm text-slate-200/90">{card.desc}</p>
                  </div>
                </div>
              </m.article>
            ))}
          </m.div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
            <m.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 }}
              className="rounded-2xl border border-white/10 bg-slate-900/50 p-4 backdrop-blur-lg"
            >
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-200/90">Expense Trend</h4>
                <span className="text-xs text-slate-300/80">Last 6 weeks</span>
              </div>
              <div className="flex h-28 items-end gap-2">
                {bars.map((value, idx) => (
                  <m.div
                    key={idx}
                    initial={{ height: 0, opacity: 0.5 }}
                    animate={{ height: `${value}%`, opacity: 1 }}
                    transition={{ delay: 0.35 + idx * 0.05, duration: 0.35, ease: 'easeOut' }}
                    className="w-full rounded-t-md bg-gradient-to-t from-emerald-500/70 to-teal-300/90"
                  />
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-slate-300">Income</p>
                  <strong className="text-emerald-200">INR 74,200</strong>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-slate-300">Expenses</p>
                  <strong className="text-rose-200">INR 39,940</strong>
                </div>
              </div>
            </m.section>

            <m.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.33 }}
              className="rounded-2xl border border-white/10 bg-slate-900/50 p-4 backdrop-blur-lg"
            >
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-200/90">Recent Activity</h4>
                <button className="rounded-lg border border-emerald-300/40 bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-200 transition hover:scale-[1.03] hover:bg-emerald-400/20">
                  + Quick add
                </button>
              </div>

              {loading ? (
                <div className="space-y-2.5">
                  {[1, 2, 3].map((s) => (
                    <div key={s} className="h-10 animate-pulse rounded-lg bg-white/10" />
                  ))}
                </div>
              ) : (
                <ul className="space-y-2.5">
                  {transactions.map((t) => (
                    <li key={t.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2.5">
                      <span className="text-sm text-slate-200">{t.label}</span>
                      <span className={`text-sm font-semibold ${t.tone}`}>{t.amount}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-4 space-y-2">
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-300">
                    <span>Budget used</span>
                    <span>64%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <m.div initial={{ width: 0 }} animate={{ width: '64%' }} transition={{ delay: 0.45, duration: 0.5 }} className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-300" />
                  </div>
                </div>
              </div>
            </m.section>
          </div>
        </div>
      </m.section>
    </LazyMotion>
  )
}

export default memo(SpendSmartHeroPreview)
