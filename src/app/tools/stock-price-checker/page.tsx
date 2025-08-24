'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, DollarSign, Clock } from 'lucide-react'

interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  lastUpdated: string
}

export default function StockPriceChecker() {
  const [symbol, setSymbol] = useState('')
  const [stockData, setStockData] = useState<StockData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCheckStock = async () => {
    if (!symbol.trim()) {
      setError('Please enter a stock symbol')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock stock data
      const mockStockData: StockData = {
        symbol: symbol.toUpperCase(),
        name: getStockName(symbol.toUpperCase()),
        price: Math.random() * 1000 + 50,
        change: (Math.random() - 0.5) * 20,
        changePercent: (Math.random() - 0.5) * 10,
        volume: Math.floor(Math.random() * 10000000) + 100000,
        marketCap: Math.floor(Math.random() * 1000000000) + 100000000,
        lastUpdated: new Date().toLocaleString()
      }
      
      setStockData(mockStockData)
    } catch (err) {
      setError('Failed to fetch stock data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getStockName = (symbol: string): string => {
    const stockNames: Record<string, string> = {
      'AAPL': 'Apple Inc.',
      'GOOGL': 'Alphabet Inc.',
      'MSFT': 'Microsoft Corporation',
      'AMZN': 'Amazon.com Inc.',
      'TSLA': 'Tesla Inc.',
      'META': 'Meta Platforms Inc.',
      'NVDA': 'NVIDIA Corporation',
      'JPM': 'JPMorgan Chase & Co.',
      'V': 'Visa Inc.',
      'WMT': 'Walmart Inc.'
    }
    return stockNames[symbol] || `${symbol} Corporation`
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000000) {
      return `$${(num / 1000000000).toFixed(2)}B`
    } else if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(2)}M`
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(2)}K`
    }
    return `$${num.toFixed(2)}`
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Stock Price Checker</h1>
        <p className="text-muted-foreground">
          Get real-time stock prices and market data for any publicly traded company
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Stock Symbol Lookup
          </CardTitle>
          <CardDescription>
            Enter a stock symbol (e.g., AAPL, GOOGL, MSFT) to get current price and market data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="symbol">Stock Symbol</Label>
              <Input
                id="symbol"
                placeholder="Enter stock symbol (e.g., AAPL)"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && handleCheckStock()}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleCheckStock} disabled={loading}>
                {loading ? 'Checking...' : 'Check Price'}
              </Button>
            </div>
          </div>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </CardContent>
      </Card>

      {stockData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {stockData.symbol} - {stockData.name}
              </div>
              <Badge variant={stockData.change >= 0 ? "default" : "destructive"}>
                {stockData.change >= 0 ? '+' : ''}{stockData.changePercent.toFixed(2)}%
              </Badge>
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Last updated: {stockData.lastUpdated}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Current Price</Label>
                <div className="text-2xl font-bold">${stockData.price.toFixed(2)}</div>
                <div className={`flex items-center gap-1 ${stockData.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stockData.change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  <span className="font-medium">
                    {stockData.change >= 0 ? '+' : ''}{stockData.change.toFixed(2)} ({stockData.changePercent.toFixed(2)}%)
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Volume</Label>
                <div className="text-2xl font-bold">{stockData.volume.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">Shares traded today</p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Market Cap</Label>
                <div className="text-2xl font-bold">{formatNumber(stockData.marketCap)}</div>
                <p className="text-sm text-muted-foreground">Total market value</p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">52W Range</Label>
                <div className="text-lg font-bold">
                  ${(stockData.price * 0.8).toFixed(2)} - ${(stockData.price * 1.2).toFixed(2)}
                </div>
                <p className="text-sm text-muted-foreground">Estimated range</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Market Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Exchange:</span> NASDAQ
                </div>
                <div>
                  <span className="font-medium">Sector:</span> Technology
                </div>
                <div>
                  <span className="font-medium">Industry:</span> Software
                </div>
                <div>
                  <span className="font-medium">CEO:</span> Chief Executive Officer
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Popular Stocks</CardTitle>
          <CardDescription>Quick access to commonly tracked stocks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META'].map((symbol) => (
              <Button
                key={symbol}
                variant="outline"
                size="sm"
                onClick={() => {
                  setSymbol(symbol)
                  handleCheckStock()
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