import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://yourdomain.com'
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/api/',
      crawlDelay: 1,
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}