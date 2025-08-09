declare module '@vercel/analytics' {
  import { ComponentType } from 'react'
  
  interface AnalyticsProps {
    mode?: 'production' | 'development'
    beforeSend?: (event: any) => void
    debug?: boolean
  }
  
  const Analytics: ComponentType<AnalyticsProps>
  
  export default Analytics
}

declare module '@vercel/speed-insights/next' {
  import { ComponentType } from 'react'
  
  interface SpeedInsightsProps {
    mode?: 'production' | 'development'
    debug?: boolean
  }
  
  const SpeedInsights: ComponentType<SpeedInsightsProps>
  
  export default SpeedInsights
}