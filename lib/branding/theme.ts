import type { TenantBranding } from '@/types'

export function generateTenantTheme(branding?: TenantBranding): Record<string, string> {
  return {
    '--brand-primary': branding?.primaryColor ?? '#0e7490',
    '--brand-secondary': branding?.secondaryColor ?? '#7c3aed',
    '--brand-accent': branding?.accentColor ?? '#06b6d4',
    '--brand-background': branding?.bgColor ?? '#ffffff',
    '--brand-surface': branding?.surfaceColor ?? '#f0f9ff',
    '--brand-text': branding?.textColor ?? '#0f172a',
    '--brand-logo-url': branding?.logoUrl ?? '',
    '--brand-company': branding?.companyName ?? '',
  }
}

export function getThemeVars(branding?: TenantBranding): React.CSSProperties {
  const theme = generateTenantTheme(branding)
  return theme as unknown as React.CSSProperties
}
