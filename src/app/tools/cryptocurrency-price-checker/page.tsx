'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, TrendingDown, Bitcoin, DollarSign, Clock, BarChart3 } from 'lucide-react'

interface CryptoData {
  symbol: string
  name: string
  price: number
  change24h: number
  changePercent24h: number
  marketCap: number
  volume24h: number
  circulatingSupply: number
  allTimeHigh: number
  allTimeLow: number
  lastUpdated: string
}

interface TopCrypto {
  symbol: string
  name: string
  price: number
  change24h: number
  marketCap: number
}

export default function CryptocurrencyPriceChecker() {
  const [crypto, setCrypto] = useState('')
  const [cryptoData, setCryptoData] = useState<CryptoData | null>(null)
  const [topCryptos, setTopCryptos] = useState<TopCrypto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCheckCrypto = async () => {
    if (!crypto.trim()) {
      setError('Please enter a cryptocurrency symbol or name')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock crypto data
      const mockCryptoData: CryptoData = {
        symbol: crypto.toUpperCase(),
        name: getCryptoName(crypto.toUpperCase()),
        price: Math.random() * 50000 + 100,
        change24h: (Math.random() - 0.5) * 5000,
        changePercent24h: (Math.random() - 0.5) * 20,
        marketCap: Math.floor(Math.random() * 1000000000000) + 1000000000,
        volume24h: Math.floor(Math.random() * 10000000000) + 100000000,
        circulatingSupply: Math.floor(Math.random() * 1000000000) + 10000000,
        allTimeHigh: Math.random() * 60000 + 200,
        allTimeLow: Math.random() * 100 + 10,
        lastUpdated: new Date().toLocaleString()
      }
      
      setCryptoData(mockCryptoData)
    } catch (err) {
      setError('Failed to fetch cryptocurrency data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const loadTopCryptos = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const mockTopCryptos: TopCrypto[] = [
        { symbol: 'BTC', name: 'Bitcoin', price: 45000 + Math.random() * 5000, change24h: (Math.random() - 0.5) * 2000, marketCap: 850000000000 },
        { symbol: 'ETH', name: 'Ethereum', price: 3000 + Math.random() * 500, change24h: (Math.random() - 0.5) * 200, marketCap: 360000000000 },
        { symbol: 'BNB', name: 'Binance Coin', price: 400 + Math.random() * 50, change24h: (Math.random() - 0.5) * 20, marketCap: 60000000000 },
        { symbol: 'ADA', name: 'Cardano', price: 1.2 + Math.random() * 0.3, change24h: (Math.random() - 0.5) * 0.2, marketCap: 40000000000 },
        { symbol: 'SOL', name: 'Solana', price: 100 + Math.random() * 20, change24h: (Math.random() - 0.5) * 10, marketCap: 42000000000 },
        { symbol: 'DOT', name: 'Polkadot', price: 25 + Math.random() * 5, change24h: (Math.random() - 0.5) * 3, marketCap: 25000000000 }
      ]
      
      setTopCryptos(mockTopCryptos)
    } catch (err) {
      setError('Failed to load top cryptocurrencies.')
    } finally {
      setLoading(false)
    }
  }

  const getCryptoName = (symbol: string): string => {
    const cryptoNames: Record<string, string> = {
      'BTC': 'Bitcoin',
      'ETH': 'Ethereum',
      'BNB': 'Binance Coin',
      'ADA': 'Cardano',
      'SOL': 'Solana',
      'DOT': 'Polkadot',
      'DOGE': 'Dogecoin',
      'AVAX': 'Avalanche',
      'MATIC': 'Polygon',
      'LINK': 'Chainlink',
      'UNI': 'Uniswap',
      'LTC': 'Litecoin'
    }
    return cryptoNames[symbol] || `${symbol} Token`
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000000000) {
      return `$${(num / 1000000000000).toFixed(2)}T`
    } else if (num >= 1000000000) {
      return `$${(num / 1000000000).toFixed(2)}B`
    } else if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(2)}M`
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(2)}K`
    }
    return `$${num.toFixed(2)}`
  }

  const formatCryptoPrice = (price: number): string => {
    if (price >= 1000) {
      return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    } else if (price >= 1) {
      return `$${price.toFixed(4)}`
    } else {
      return `$${price.toFixed(8)}`
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Cryptocurrency Price Checker</h1>
        <p className="text-muted-foreground">
          Get real-time cryptocurrency prices and market data
        </p>
      </div>

      <Tabs defaultValue="single" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="single">Single Crypto</TabsTrigger>
          <TabsTrigger value="top">Top Cryptocurrencies</TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bitcoin className="h-5 w-5" />
                Cryptocurrency Lookup
              </CardTitle>
              <CardDescription>
                Enter a cryptocurrency symbol (e.g., BTC, ETH, BNB) to get current price and market data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="crypto">Cryptocurrency Symbol</Label>
                  <Input
                    id="crypto"
                    placeholder="Enter crypto symbol (e.g., BTC)"
                    value={crypto}
                    onChange={(e) => setCrypto(e.target.value.toUpperCase())}
                    onKeyPress={(e) => e.key === 'Enter' && handleCheckCrypto()}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleCheckCrypto} disabled={loading}>
                    {loading ? 'Checking...' : 'Check Price'}
                  </Button>
                </div>
              </div>
              {error && <p className="text-red-500 mt-2">{error}</p>}
            </CardContent>
          </Card>

          {cryptoData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    {cryptoData.symbol} - {cryptoData.name}
                  </div>
                  <Badge variant={cryptoData.change24h >= 0 ? "default" : "destructive"}>
                    {cryptoData.change24h >= 0 ? '+' : ''}{cryptoData.changePercent24h.toFixed(2)}%
                  </Badge>
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Last updated: {cryptoData.lastUpdated}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Current Price</Label>
                    <div className="text-2xl font-bold">{formatCryptoPrice(cryptoData.price)}</div>
                    <div className={`flex items-center gap-1 ${cryptoData.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {cryptoData.change24h >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      <span className="font-medium">
                        {cryptoData.change24h >= 0 ? '+' : ''}{formatCryptoPrice(cryptoData.change24h)} ({cryptoData.changePercent24h.toFixed(2)}%)
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Market Cap</Label>
                    <div className="text-2xl font-bold">{formatNumber(cryptoData.marketCap)}</div>
                    <p className="text-sm text-muted-foreground">Total market value</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">24h Volume</Label>
                    <div className="text-2xl font-bold">{formatNumber(cryptoData.volume24h)}</div>
                    <p className="text-sm text-muted-foreground">Trading volume</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Circulating Supply</Label>
                    <div className="text-2xl font-bold">{cryptoData.circulatingSupply.toLocaleString()}</div>
                    <p className="text-sm text-muted-foreground">Tokens in circulation</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">All Time High</Label>
                    <div className="text-xl font-bold">{formatCryptoPrice(cryptoData.allTimeHigh)}</div>
                    <p className="text-sm text-muted-foreground">Highest price ever</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">All Time Low</Label>
                    <div className="text-xl font-bold">{formatCryptoPrice(cryptoData.allTimeLow)}</div>
                    <p className="text-sm text-muted-foreground">Lowest price ever</p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2">Market Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Market Rank:</span> #{Math.floor(Math.random() * 50) + 1}
                    </div>
                    <div>
                      <span className="font-medium">Category:</span> Coin
                    </div>
                    <div>
                      <span className="font-medium">Consensus:</span> Proof of Work
                    </div>
                    <div>
                      <span className="font-medium">Launch Date:</span> 2017
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="top" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Cryptocurrencies</CardTitle>
              <CardDescription>
                View the top cryptocurrencies by market capitalization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={loadTopCryptos} disabled={loading} className="mb-4">
                {loading ? 'Loading...' : 'Load Top Cryptos'}
              </Button>
              
              {topCryptos.length > 0 && (
                <div className="space-y-4">
                  {topCryptos.map((crypto, index) => (
                    <div key={crypto.symbol} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="text-lg font-bold">#{index + 1}</div>
                        <div>
                          <div className="font-semibold">{crypto.symbol} - {crypto.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Market Cap: {formatNumber(crypto.marketCap)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{formatCryptoPrice(crypto.price)}</div>
                        <div className={`flex items-center gap-1 justify-end ${crypto.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {crypto.change24h >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          <span className="font-medium text-sm">
                            {crypto.change24h >= 0 ? '+' : ''}{formatCryptoPrice(crypto.change24h)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Popular Cryptocurrencies</CardTitle>
          <CardDescription>Quick access to commonly tracked cryptocurrencies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {['BTC', 'ETH', 'BNB', 'ADA', 'SOL', 'DOT'].map((symbol) => (
              <Button
                key={symbol}
                variant="outline"
                size="sm"
                onClick={() => {
                  setCrypto(symbol)
                  handleCheckCrypto()
                }}
              >
                {symbol}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}