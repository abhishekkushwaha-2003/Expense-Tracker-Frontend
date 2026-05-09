const RAZORPAY_UNSAFE_HEADERS = new Set([
  'request-id',
  'x-rtb-fingerprint-id',
])

const RAZORPAY_CONSOLE_NOISE = [
  'Permissions policy violation: accelerometer is not allowed',
  'The devicemotion events are blocked by permissions policy',
  'The deviceorientation events are blocked by permissions policy',
  'was preloaded using link preload but not used',
  'requested an insecure element',
  'This request was not upgraded to HTTPS because it is a local network request',
]

function installRazorpayHeaderGuard() {
  if (typeof window === 'undefined' || !window.XMLHttpRequest) {
    return
  }

  const prototype = window.XMLHttpRequest.prototype
  if (prototype.__spendSmartHeaderGuardInstalled) {
    return
  }

  const getResponseHeader = prototype.getResponseHeader
  prototype.getResponseHeader = function guardedGetResponseHeader(headerName) {
    if (RAZORPAY_UNSAFE_HEADERS.has(String(headerName).toLowerCase())) {
      return null
    }

    return getResponseHeader.call(this, headerName)
  }

  Object.defineProperty(prototype, '__spendSmartHeaderGuardInstalled', {
    value: true,
  })
}

function installRazorpayConsoleGuard() {
  if (typeof window === 'undefined' || window.__spendSmartConsoleGuardInstalled) {
    return
  }

  const shouldIgnore = (args) => {
    return args.some((arg) => {
      const message = typeof arg === 'string' ? arg : arg?.message
      return typeof message === 'string' && RAZORPAY_CONSOLE_NOISE.some((noise) => message.includes(noise))
    })
  }

  const originalWarn = console.warn.bind(console)
  const originalError = console.error.bind(console)

  console.warn = (...args) => {
    if (!shouldIgnore(args)) {
      originalWarn(...args)
    }
  }

  console.error = (...args) => {
    if (!shouldIgnore(args)) {
      originalError(...args)
    }
  }

  Object.defineProperty(window, '__spendSmartConsoleGuardInstalled', {
    value: true,
  })
}

installRazorpayHeaderGuard()
installRazorpayConsoleGuard()
