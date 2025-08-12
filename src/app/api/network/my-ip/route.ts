import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function GET(request: NextRequest) {
  try {
    // Get client IP from request headers
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const clientIP = forwarded?.split(',')[0] || realIP || '127.0.0.1'

    // Initialize ZAI SDK for enhanced IP analysis
    const zai = await ZAI.create()

    const systemPrompt = `You are an IP detection expert. 
    Analyze the client IP address: ${clientIP} and provide comprehensive information.
    
    Please provide detailed IP information including:
    1. IP address and IP version (IPv4/IPv6)
    2. IP type (public, private, loopback, link-local)
    3. Geolocation data (country, region, city, coordinates)
    4. ISP and organization information
    5. Network details (ASN, connection type)
    6. Security assessment (proxy, VPN, Tor detection)
    7. Threat level analysis
    8. Privacy level assessment
    9. Browser and device information (if available from headers)
    10. Connection quality estimation
    11. Recommended privacy measures
    12. IP reputation score
    
    Use realistic IP data based on common IP ranges and detection methods.
    Return the response in JSON format with the following structure:
    {
      "ip": "string",
      "ipVersion": "IPv4" | "IPv6",
      "ipType": "public" | "private" | "loopback" | "link-local",
      "geolocation": {
        "country": "string",
        "countryCode": "string",
        "region": "string",
        "city": "string",
        "latitude": number,
        "longitude": number,
        "timezone": "string"
      },
      "network": {
        "isp": "string",
        "organization": "string",
        "asn": "string",
        "connectionType": "broadband" | "mobile" | "datacenter" | "unknown"
      },
      "security": {
        "isProxy": boolean,
        "isVpn": boolean,
        "isTor": boolean,
        "isDatacenter": boolean,
        "threatLevel": "low" | "medium" | "high",
        "privacyLevel": "low" | "medium" | "high"
      },
      "reputation": {
        "score": number,
        "category": "clean" | "suspicious" | "malicious",
        "blacklisted": boolean
      },
      "clientInfo": {
        "userAgent": "string",
        "browser": "string",
        "os": "string",
        "device": "string"
      },
      "connection": {
        "quality": "excellent" | "good" | "fair" | "poor",
        "speed": "fast" | "medium" | "slow",
        "stability": "stable" | "unstable" | "unknown"
      },
      "recommendations": array,
      "timestamp": "string"
    }`

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `Analyze my IP address: ${clientIP}`
        }
      ],
      temperature: 0.1,
      max_tokens: 1200
    })

    let result
    try {
      const content = completion.choices[0]?.message?.content || '{}'
      result = JSON.parse(content)
      
      // Add client info from request headers
      const userAgent = request.headers.get('user-agent') || 'Unknown'
      result.clientInfo = {
        ...result.clientInfo,
        userAgent: userAgent
      }
      
      result.timestamp = new Date().toISOString()
      
    } catch (parseError) {
      // Fallback: basic IP analysis
      console.log('AI response parsing failed, using fallback for IP:', clientIP)
      
      // Determine IP type
      let ipType = 'public'
      let ipVersion = 'IPv4'
      
      if (clientIP === '127.0.0.1' || clientIP === '::1') {
        ipType = 'loopback'
      } else if (clientIP.startsWith('192.168.') || clientIP.startsWith('10.') || 
                 clientIP.startsWith('172.') && parseInt(clientIP.split('.')[1]) >= 16 && 
                 parseInt(clientIP.split('.')[1]) <= 31) {
        ipType = 'private'
      } else if (clientIP.startsWith('169.254.')) {
        ipType = 'link-local'
      } else if (clientIP.includes(':')) {
        ipVersion = 'IPv6'
      }
      
      // Parse user agent
      const userAgent = request.headers.get('user-agent') || 'Unknown'
      let browser = 'Unknown'
      let os = 'Unknown'
      let device = 'Unknown'
      
      if (userAgent.includes('Chrome')) browser = 'Chrome'
      else if (userAgent.includes('Firefox')) browser = 'Firefox'
      else if (userAgent.includes('Safari')) browser = 'Safari'
      else if (userAgent.includes('Edge')) browser = 'Edge'
      
      if (userAgent.includes('Windows')) os = 'Windows'
      else if (userAgent.includes('Mac')) os = 'macOS'
      else if (userAgent.includes('Linux')) os = 'Linux'
      else if (userAgent.includes('Android')) os = 'Android'
      else if (userAgent.includes('iOS')) os = 'iOS'
      
      if (userAgent.includes('Mobile')) device = 'Mobile'
      else if (userAgent.includes('Tablet')) device = 'Tablet'
      else device = 'Desktop'
      
      result = {
        ip: clientIP,
        ipVersion: ipVersion,
        ipType: ipType,
        geolocation: {
          country: ipType === 'private' ? 'Local Network' : 'Unknown',
          countryCode: ipType === 'private' ? 'LN' : 'UN',
          region: 'Unknown',
          city: 'Unknown',
          latitude: 0.0,
          longitude: 0.0,
          timezone: 'UTC'
        },
        network: {
          isp: ipType === 'private' ? 'Local Network' : 'Unknown ISP',
          organization: ipType === 'private' ? 'Local Network' : 'Unknown Organization',
          asn: 'Unknown',
          connectionType: ipType === 'private' ? 'local' : 'unknown'
        },
        security: {
          isProxy: false,
          isVpn: false,
          isTor: false,
          isDatacenter: false,
          threatLevel: 'low' as const,
          privacyLevel: ipType === 'private' ? 'high' : 'medium' as const
        },
        reputation: {
          score: ipType === 'private' ? 100 : 75,
          category: 'clean' as const,
          blacklisted: false
        },
        clientInfo: {
          userAgent: userAgent,
          browser: browser,
          os: os,
          device: device
        },
        connection: {
          quality: 'good',
          speed: 'medium',
          stability: 'stable'
        },
        recommendations: [
          ipType === 'private' ? 'You are on a local network' : 'Consider using a VPN for better privacy',
          'Keep your browser and OS updated for security'
        ],
        timestamp: new Date().toISOString()
      }
    }

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('My IP Error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to get your IP information',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}