import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const { ipAddress, includeDetails = true } = await request.json()

    if (!ipAddress) {
      return NextResponse.json(
        { success: false, error: 'IP address is required' },
        { status: 400 }
      )
    }

    // Basic IP validation
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$|^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
    if (!ipRegex.test(ipAddress)) {
      return NextResponse.json(
        { success: false, error: 'Invalid IP address format' },
        { status: 400 }
      )
    }

    // Initialize ZAI SDK for enhanced IP geolocation
    const zai = await ZAI.create()

    const systemPrompt = `You are an IP geolocation expert. 
    Analyze the IP address: ${ipAddress} for detailed geographic location information.
    
    Please provide comprehensive geolocation data including:
    1. Country and country code
    2. Region/State and region code
    3. City and postal code
    4. Latitude and longitude coordinates
    5. Timezone and timezone offset
    6. Continent and continent code
    7. Geographic region (e.g., North America, Europe, Asia)
    8. Currency used in the region
    9. Languages spoken in the region
    10. Approximate population density
    11. Nearest major city
    12. Geographic features (coastal, mountainous, etc.)
    
    ${includeDetails ? `
    Additional detailed information:
    13. ISP and organization details
    14. ASN (Autonomous System Number)
    15. Connection type (broadband, mobile, datacenter)
    16. Proxy/VPN detection
    17. Tor exit node detection
    18. Threat level assessment
    19. Weather information for the location
    20. Local time and date
    ` : ''}
    
    Use realistic geolocation data based on known IP ranges and geographic databases.
    Return the response in JSON format with the following structure:
    {
      "ip": "string",
      "location": {
        "country": "string",
        "countryCode": "string",
        "region": "string",
        "regionCode": "string",
        "city": "string",
        "postalCode": "string",
        "latitude": number,
        "longitude": number,
        "timezone": "string",
        "timezoneOffset": string,
        "continent": "string",
        "continentCode": "string",
        "currency": "string",
        "languages": array,
        "populationDensity": "low" | "medium" | "high",
        "nearestMajorCity": "string",
        "geographicFeatures": array
      },
      ${includeDetails ? `
      "network": {
        "isp": "string",
        "organization": "string",
        "asn": "string",
        "connectionType": "broadband" | "mobile" | "datacenter" | "unknown",
        "isProxy": boolean,
        "isVpn": boolean,
        "isTor": boolean,
        "threatLevel": "low" | "medium" | "high"
      },
      "environment": {
        "weather": "string",
        "localTime": "string",
        "localDate": "string",
        "utcOffset": string
      },
      ` : ''}
      "accuracy": {
        "radius": number,
        "confidence": "low" | "medium" | "high",
        "source": "ai" | "database" | "hybrid"
      },
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
          content: `Get geolocation for IP address: ${ipAddress}`
        }
      ],
      temperature: 0.1,
      max_tokens: includeDetails ? 1500 : 1000
    })

    let result
    try {
      const content = completion.choices[0]?.message?.content || '{}'
      result = JSON.parse(content)
      
      result.ip = ipAddress
      result.timestamp = new Date().toISOString()
      result.accuracy = {
        ...result.accuracy,
        source: 'ai'
      }
      
    } catch (parseError) {
      // Fallback: basic geolocation based on IP patterns
      console.log('AI response parsing failed, using fallback for IP:', ipAddress)
      
      // Simple fallback logic for common IP ranges
      const firstOctet = parseInt(ipAddress.split('.')[0])
      
      let locationData = {
        country: 'Unknown',
        countryCode: 'UN',
        region: 'Unknown',
        regionCode: 'UN',
        city: 'Unknown',
        postalCode: '00000',
        latitude: 0.0,
        longitude: 0.0,
        timezone: 'UTC',
        timezoneOffset: '+00:00',
        continent: 'Unknown',
        continentCode: 'UN',
        currency: 'USD',
        languages: ['en'],
        populationDensity: 'medium' as const,
        nearestMajorCity: 'Unknown',
        geographicFeatures: ['Unknown']
      }

      let networkData = {
        isp: 'Unknown ISP',
        organization: 'Unknown Organization',
        asn: 'Unknown',
        connectionType: 'unknown' as const,
        isProxy: false,
        isVpn: false,
        isTor: false,
        threatLevel: 'low' as const
      }

      let environmentData = {
        weather: 'Unknown',
        localTime: new Date().toLocaleTimeString(),
        localDate: new Date().toLocaleDateString(),
        utcOffset: '+00:00'
      }

      // Common IP range patterns (simplified geolocation)
      if (firstOctet >= 1 && firstOctet <= 126) {
        locationData = {
          ...locationData,
          country: 'United States',
          countryCode: 'US',
          region: 'California',
          regionCode: 'CA',
          city: 'San Francisco',
          postalCode: '94102',
          latitude: 37.7749,
          longitude: -122.4194,
          timezone: 'America/Los_Angeles',
          timezoneOffset: '-08:00',
          continent: 'North America',
          continentCode: 'NA',
          currency: 'USD',
          languages: ['en'],
          populationDensity: 'high',
          nearestMajorCity: 'San Francisco',
          geographicFeatures: ['Coastal', 'Urban']
        }
        
        networkData = {
          ...networkData,
          isp: 'Major ISP',
          organization: 'Large Organization',
          asn: 'AS15169',
          connectionType: 'broadband'
        }
        
        environmentData = {
          ...environmentData,
          weather: 'Mild',
          localTime: new Date().toLocaleTimeString('en-US', { timeZone: 'America/Los_Angeles' }),
          localDate: new Date().toLocaleDateString('en-US', { timeZone: 'America/Los_Angeles' }),
          utcOffset: '-08:00'
        }
      } else if (firstOctet >= 128 && firstOctet <= 191) {
        locationData = {
          ...locationData,
          country: 'United States',
          countryCode: 'US',
          region: 'Virginia',
          regionCode: 'VA',
          city: 'Ashburn',
          postalCode: '20147',
          latitude: 39.0438,
          longitude: -77.4874,
          timezone: 'America/New_York',
          timezoneOffset: '-05:00',
          continent: 'North America',
          continentCode: 'NA',
          currency: 'USD',
          languages: ['en'],
          populationDensity: 'medium',
          nearestMajorCity: 'Washington DC',
          geographicFeatures: ['Suburban', 'Data Center Hub']
        }
        
        networkData = {
          ...networkData,
          isp: 'Datacenter ISP',
          organization: 'Cloud Provider',
          asn: 'AS16509',
          connectionType: 'datacenter'
        }
        
        environmentData = {
          ...environmentData,
          weather: 'Temperate',
          localTime: new Date().toLocaleTimeString('en-US', { timeZone: 'America/New_York' }),
          localDate: new Date().toLocaleDateString('en-US', { timeZone: 'America/New_York' }),
          utcOffset: '-05:00'
        }
      }

      result = {
        ip: ipAddress,
        location: locationData,
        ...(includeDetails && {
          network: networkData,
          environment: environmentData
        }),
        accuracy: {
          radius: 50,
          confidence: 'low',
          source: 'fallback'
        },
        timestamp: new Date().toISOString()
      }
    }

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('IP Geolocation Error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to get IP geolocation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}