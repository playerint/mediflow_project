import Link from 'next/link'

interface PageHeaderProps {
  backHref?: string
  backLabel?: string
  title: string
  children?: React.ReactNode
}

export default function PageHeader({ backHref, backLabel, title, children }: PageHeaderProps) {
  return (
    <div className="topbar">
      <div className="topbar-left">
        {backHref && backLabel && (
          <>
            <Link href={backHref} className="topbar-back">← {backLabel}</Link>
            <span className="topbar-sep">/</span>
          </>
        )}
        <span className="topbar-title">{title}</span>
      </div>
      {children && <div className="topbar-right">{children}</div>}
    </div>
  )
}
