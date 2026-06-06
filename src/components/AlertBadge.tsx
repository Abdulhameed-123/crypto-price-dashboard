import { memo } from 'react'
import type { Alert } from '../types'

interface AlertBadgeProps {
  alerts: Alert[]
}

function AlertBadgeInner({ alerts }: AlertBadgeProps) {
  const activeAlerts = alerts.filter((a) => !a.triggered)

  if (activeAlerts.length === 0) return null

  return (
    <div className="bg-crypto-surface border border-crypto-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-4 h-4 text-crypto-gold" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L1 21h22L12 2zm0 4l7.53 13H4.47L12 6zm-1 8h2v2h-2zm0-6h2v4h-2z" />
        </svg>
        <h2 className="text-sm font-semibold text-white">Active Alerts</h2>
        <span className="text-xs text-crypto-text-muted ml-auto">{activeAlerts.length}</span>
      </div>
      <div className="space-y-1.5">
        {activeAlerts.map((alert, i) => (
          <div key={i} className="flex items-center justify-between text-xs text-crypto-text-muted py-1">
            <span className="font-medium text-white capitalize truncate">{alert.coinId.replace('-', ' ')}</span>
            <span className="shrink-0 ml-2">
              {alert.direction === 'above' ? '↑ Above' : '↓ Below'} $
              {alert.targetPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export const AlertBadge = memo(AlertBadgeInner)
