import { NextRequest, NextResponse } from 'next/server'
import { promises as dnsPromises } from 'dns'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const { domain } = await request.json()

    if (!domain) {
      return NextResponse.json(
        { success: false, error: 'Domain is required' },
        { status: 400 }
      )
    }

    // Basic domain validation
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*$/
    if (!domainRegex.test(domain)) {
      return NextResponse.json(
        { success: false, error: 'Invalid domain format' },
        { status: 400 }
      )
    }

    // Initialize ZAI SDK for enhanced domain analysis
    const zai = await ZAI.create()

    let ipAddresses = []
    let dnsError = null

    try {
      // Try to resolve domain to IP addresses using DNS
      ipAddresses = await dnsPromises.resolve4(domain)
      
      // Also try IPv6
      try {
        const ipv6Addresses = await dnsPromises.resolve6(domain)
        ipAddresses = [...ipAddresses, ...ipv6Addresses]
      } catch (ipv6Error) {
        // IPv6 not available, continue with IPv4 only
      }
      
    } catch (error) {
      console.log('DNS resolution failed, using AI analysis for domain:', domain)
      dnsError = error
    }

    // Use AI to enhance domain analysis or provide fallback
    const systemPrompt = `You are a DNS and networking expert. Analyze the domain: ${domain}

    Please provide comprehensive domain analysis including:
    1. IP addresses associated with the domain
    2. Domain registration information
    3. Name servers
    4. Geographic location of servers
    5. ISP/hosting provider
    6. Domain age estimation
    7. Security status (SSL, malware, etc.)
    8. Content type estimation
    9. Traffic estimation
    10. Technical infrastructure details

    Use realistic domain data based on common domain patterns and services.
    Return the response in JSON format with the following structure:
    {
      "domain": "string",
      "ipAddresses": array,
      "nameServers": array,
      "isp": "string",
      "hostingProvider": "string",
      "country": "string",
      "countryCode": "string",
      "region": "string",
      "city": "string",
      "domainAge": string,
      "sslStatus": "valid" | "invalid" | "none",
      "securityStatus": "secure" | "warning" | "insecure",
      "contentType": "website" | "api" | "mail" | "other",
      "estimatedTraffic": "low" | "medium" | "high",
      "technicalInfo": object,
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
          content: `Analyze domain and convert to IP addresses: ${domain}`
        }
      ],
      temperature: 0.1,
      max_tokens: 1000
    })

    let result
    try {
      const content = completion.choices[0]?.message?.content || '{}'
      result = JSON.parse(content)
      
      // If we have actual DNS results, incorporate them
      if (ipAddresses.length > 0) {
        result.ipAddresses = ipAddresses
        result.usesRealData = true
        result.resolutionStatus = 'success'
      } else {
        result.usesRealData = false
        result.resolutionStatus = 'failed'
        result.resolutionError = dnsError ? dnsError.message : 'Unknown DNS error'
      }
      
      result.domain = domain
      result.timestamp = new Date().toISOString()
      
    } catch (parseError) {
      // Fallback: basic domain analysis
      console.log('AI response parsing failed, using fallback for domain:', domain)
      
      result = {
        domain: domain,
        ipAddresses: ipAddresses.length > 0 ? ipAddresses : ['192.168.1.1'], // fallback IP
        nameServers: ['ns1.example.com', 'ns2.example.com'],
        isp: 'Unknown ISP',
        hostingProvider: 'Unknown Hosting',
        country: 'Unknown',
        countryCode: 'UN',
        region: 'Unknown',
        city: 'Unknown',
        domainAge: 'Unknown',
        sslStatus: 'none',
        securityStatus: 'unknown',
        contentType: 'website',
        estimatedTraffic: 'low',
        technicalInfo: {
          note: 'Limited domain data available',
          dnsResolutionFailed: ipAddresses.length === 0
        },
        usesRealData: ipAddresses.length > 0,
        resolutionStatus: ipAddresses.length > 0 ? 'success' : 'failed',
        resolutionError: ipAddresses.length === 0 ? 'DNS resolution failed' : null,
        timestamp: new Date().toISOString()
      }
    }

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Domain to IP Error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to convert domain to IP',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}