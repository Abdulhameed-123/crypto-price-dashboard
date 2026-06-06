import { useState, useCallback, useEffect, useRef } from 'react'
import type { Alert } from '../types'

const STORAGE_KEY = 'crypto-alerts'

function loadAlerts(): Alert[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveAlerts(alerts: Alert[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts))
}

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>(loadAlerts)
  const permissionAsked = useRef(false)

  useEffect(() => {
    if (!permissionAsked.current && 'Notification' in window && Notification.permission === 'default') {
      permissionAsked.current = true
      Notification.requestPermission()
    }
  }, [])

  const addAlert = useCallback((alert: Omit<Alert, 'triggered'>) => {
    setAlerts((prev) => {
      const next = [...prev, { ...alert, triggered: false }]
      saveAlerts(next)
      return next
    })
  }, [])

  const removeAlert = useCallback((index: number) => {
    setAlerts((prev) => {
      const next = prev.filter((_, i) => i !== index)
      saveAlerts(next)
      return next
    })
  }, [])

  const getAlertsForCoin = useCallback(
    (coinId: string) => alerts.filter((a) => a.coinId === coinId && !a.triggered),
    [alerts]
  )

  const checkAlerts = useCallback(
    (coinId: string, currentPrice: number) => {
      setAlerts((prev) => {
        let changed = false
        const next = prev.map((alert) => {
          if (alert.coinId !== coinId || alert.triggered) return alert
          const triggered =
            alert.direction === 'above'
              ? currentPrice >= alert.targetPrice
              : currentPrice <= alert.targetPrice
          if (triggered) {
            changed = true
            if ('Notification' in window && Notification.permission === 'granted') {
              const coinName = coinId.charAt(0).toUpperCase() + coinId.slice(1)
              new Notification(`Price Alert: ${coinName}`, {
                body: `${coinName} is ${alert.direction === 'above' ? 'above' : 'below'} $${alert.targetPrice.toLocaleString()} (current: $${currentPrice.toLocaleString()})`,
                icon: '/favicon.svg',
              })
            }
          }
          return triggered ? { ...alert, triggered: true } : alert
        })
        if (changed) saveAlerts(next)
        return next as Alert[]
      })
    },
    []
  )

  return { alerts, addAlert, removeAlert, getAlertsForCoin, checkAlerts }
}
