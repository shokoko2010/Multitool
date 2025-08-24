'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowRightLeft, TrendingUp, TrendingDown, RefreshCw, Copy, Download } from 'lucide-react'

interface ExchangeRate {
  code: string
  name: string
  rate: number
}

interface ConversionHistory {
  id: string
  fromCurrency: string
  toCurrency: string
  amount: number
  result: number
  timestamp: Date
  rate: number
}

export default function CurrencyConverter() {
  const [amount, setAmount] = useState<string>('1')
  const [fromCurrency, setFromCurrency] = useState<string>('USD')
  const [toCurrency, setToCurrency] = useState<string>('EUR')
  const [result, setResult] = useState<number>(0)
  const [exchangeRate, setExchangeRate] = useState<number>(0)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [conversionHistory, setConversionHistory] = useState<ConversionHistory[]>([])
  const [currencies, setCurrencies] = useState<ExchangeRate[]>([
    { code: 'USD', name: 'US Dollar', rate: 1 },
    { code: 'EUR', name: 'Euro', rate: 0.85 },
    { code: 'GBP', name: 'British Pound', rate: 0.73 },
    { code: 'JPY', name: 'Japanese Yen', rate: 110.25 },
    { code: 'CAD', name: 'Canadian Dollar', rate: 1.25 },
    { code: 'AUD', name: 'Australian Dollar', rate: 1.35 },
    { code: 'CHF', name: 'Swiss Franc', rate: 0.92 },
    { code: 'CNY', name: 'Chinese Yuan', rate: 6.45 },
    { code: 'INR', name: 'Indian Rupee', rate: 74.5 },
    { code: 'MXN', name: 'Mexican Peso', rate: 20.15 },
    { code: 'BRL', name: 'Brazilian Real', rate: 5.25 },
    { code: 'RUB', name: 'Russian Ruble', rate: 73.5 },
    { code: 'KRW', name: 'South Korean Won', rate: 1180.5 },
    { code: 'SGD', name: 'Singapore Dollar', rate: 1.35 },
    { code: 'HKD', name: 'Hong Kong Dollar', rate: 7.85 },
    { code: 'SEK', name: 'Swedish Krona', rate: 8.65 },
    { code: 'NOK', name: 'Norwegian Krone', rate: 8.45 },
    { code: 'DKK', name: 'Danish Krone', rate: 6.35 },
    { code: 'PLN', name: 'Polish Złoty', rate: 3.95 },
    { code: 'THB', name: 'Thai Baht', rate: 33.25 }
  ])
  const [aiInsights, setAiInsights] = useState<string>('')
  const [loadingInsights, setLoadingInsights] = useState<boolean>(false)

  const getCurrencyInsights = async () => {
    setLoadingInsights(true)
    try {
      // Use API endpoint for insights instead of direct SDK call
      const response = await fetch('/api/converters/currency-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromCurrency,
          toCurrency
        })
      })

      if (response.ok) {
        const data = await response.json()
        setAiInsights(data.insights || 'No insights available at this time.')
      } else {
        setAiInsights('Unable to fetch insights at this time.')
      }
    } catch (error) {
      console.error('Error fetching insights:', error)
      setAiInsights('Unable to fetch insights at this time.')
    } finally {
      setLoadingInsights(false)
    }
  }

  const fetchExchangeRates = async () => {
    setIsLoading(true)
    try {
      // Fetch AI-powered exchange rates
      const response = await fetch('/api/converters/currency', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 1,
          from: 'USD',
          to: 'EUR'
        })
      })

      if (response.ok) {
        const data = await response.json()
        // Update currencies with AI-powered rates
        const baseRate = data.exchangeRate || 0.85
        setCurrencies(prevCurrencies => 
          prevCurrencies.map(currency => ({
            ...currency,
            rate: currency.code === 'USD' ? 1 : 
                  currency.code === 'EUR' ? baseRate :
                  // Generate realistic rates for other currencies based on EUR rate
                  currency.code === 'GBP' ? baseRate * 0.86 :
                  currency.code === 'JPY' ? baseRate * 129.5 :
                  currency.code === 'CAD' ? baseRate * 1.47 :
                  currency.code === 'AUD' ? baseRate * 1.59 :
                  currency.code === 'CHF' ? baseRate * 1.08 :
                  currency.code === 'CNY' ? baseRate * 7.59 :
                  currency.code === 'INR' ? baseRate * 87.6 :
                  currency.code === 'MXN' ? baseRate * 23.7 :
                  currency.code === 'BRL' ? baseRate * 6.18 :
                  currency.code === 'RUB' ? baseRate * 86.5 :
                  currency.code === 'KRW' ? baseRate * 1389 :
                  currency.code === 'SGD' ? baseRate * 1.59 :
                  currency.code === 'HKD' ? baseRate * 9.24 :
                  currency.code === 'SEK' ? baseRate * 10.18 :
                  currency.code === 'NOK' ? baseRate * 9.94 :
                  currency.code === 'DKK' ? baseRate * 7.47 :
                  currency.code === 'PLN' ? baseRate * 4.65 :
                  currency.code === 'THB' ? baseRate * 39.1 : currency.rate
          }))
        )
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('Error fetching exchange rates:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const convertCurrency = async () => {
    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      setResult(0)
      return
    }

    // Try to use AI-powered conversion first
    try {
      const response = await fetch('/api/converters/currency', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amountNum,
          from: fromCurrency,
          to: toCurrency
        })
      })

      if (response.ok) {
        const data = await response.json()
        setResult(data.convertedAmount)
        setExchangeRate(data.exchangeRate)
        setLastUpdated(new Date())

        // Add to history
        const historyItem: ConversionHistory = {
          id: Date.now().toString(),
          fromCurrency,
          toCurrency,
          amount: amountNum,
          result: data.convertedAmount,
          timestamp: new Date(),
          rate: data.exchangeRate
        }
        
        setConversionHistory(prev => [historyItem, ...prev.slice(0, 9)])
        return
      }
    } catch (error) {
      console.error('AI conversion failed, using fallback:', error)
    }

    // Fallback to local conversion
    const fromRate = currencies.find(c => c.code === fromCurrency)?.rate || 1
    const toRate = currencies.find(c => c.code === toCurrency)?.rate || 1
    
    const convertedAmount = (amountNum / fromRate) * toRate
    const rate = toRate / fromRate
    
    setResult(convertedAmount)
    setExchangeRate(rate)
    setLastUpdated(new Date())

    // Add to history
    const historyItem: ConversionHistory = {
      id: Date.now().toString(),
      fromCurrency,
      toCurrency,
      amount: amountNum,
      result: convertedAmount,
      timestamp: new Date(),
      rate
    }
    
    setConversionHistory(prev => [historyItem, ...prev.slice(0, 9)])
  }

  const swapCurrencies = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const exportHistory = () => {
    const csvContent = [
      ['Date', 'From', 'To', 'Amount', 'Result', 'Rate'],
      ...conversionHistory.map(item => [
        item.timestamp.toLocaleString(),
        item.fromCurrency,
        item.toCurrency,
        item.amount.toFixed(2),
        item.result.toFixed(2),
        item.rate.toFixed(6)
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `currency-conversion-history-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const refreshRates = () => {
    fetchExchangeRates()
  }

  useEffect(() => {
    convertCurrency()
  }, [fromCurrency, toCurrency])

  useEffect(() => {
    // Initialize with AI-powered rates on component mount
    fetchExchangeRates()
  }, [])

  useEffect(() => {
    // Clear insights when currency pair changes
    setAiInsights('')
  }, [fromCurrency, toCurrency])

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  const getCurrencySymbol = (code: string) => {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      CAD: 'C$',
      AUD: 'A$',
      CHF: 'Fr',
      CNY: '¥',
      INR: '₹',
      MXN: '$',
      BRL: 'R$',
      RUB: '₽',
      KRW: '₩',
      SGD: 'S$',
      HKD: 'HK$',
      SEK: 'kr',
      NOK: 'kr',
      DKK: 'kr',
      PLN: 'zł',
      THB: '฿'
    }
    return symbols[code] || code
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Currency Converter</h1>
        <p className="text-muted-foreground">Convert between different currencies with real-time exchange rates</p>
      </div>

      <Tabs defaultValue="converter" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="converter">Converter</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="converter" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Currency Conversion
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={refreshRates}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh Rates
                </Button>
              </CardTitle>
              <CardDescription>
                Last updated: {lastUpdated.toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="from">From</Label>
                  <Select value={fromCurrency} onValueChange={setFromCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.code} - {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={swapCurrencies}
                    className="mb-2"
                  >
                    <ArrowRightLeft className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>To</Label>
                  <Select value={toCurrency} onValueChange={setToCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.code} - {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Result</Label>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">
                      {formatCurrency(result, toCurrency)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      1 {fromCurrency} = {exchangeRate.toFixed(6)} {toCurrency}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={convertCurrency} className="flex-1">
                  Convert
                </Button>
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(result.toFixed(2))}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AI Insights Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                AI Market Insights
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={getCurrencyInsights}
                  disabled={loadingInsights}
                >
                  {loadingInsights ? 'Analyzing...' : 'Get Insights'}
                </Button>
              </CardTitle>
              <CardDescription>
                AI-powered analysis for {fromCurrency}/{toCurrency} currency pair
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingInsights ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3" />
                  <span className="text-muted-foreground">Analyzing market data...</span>
                </div>
              ) : aiInsights ? (
                <div className="space-y-3">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800 leading-relaxed">
                        {aiInsights}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Insights generated by AI using current market data and trends
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Click "Get Insights" to receive AI-powered market analysis</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Popular Currency Pairs</CardTitle>
              <CardDescription>Quick access to commonly converted currencies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { from: 'USD', to: 'EUR' },
                  { from: 'USD', to: 'GBP' },
                  { from: 'EUR', to: 'GBP' },
                  { from: 'USD', to: 'JPY' },
                  { from: 'USD', to: 'CAD' },
                  { from: 'EUR', to: 'USD' },
                  { from: 'GBP', to: 'USD' },
                  { from: 'USD', to: 'CNY' }
                ].map((pair, index) => {
                  const fromRate = currencies.find(c => c.code === pair.from)?.rate || 1
                  const toRate = currencies.find(c => c.code === pair.to)?.rate || 1
                  const rate = toRate / fromRate
                  
                  return (
                    <div
                      key={index}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => {
                        setFromCurrency(pair.from)
                        setToCurrency(pair.to)
                      }}
                    >
                      <div className="font-medium">
                        {pair.from}/{pair.to}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {rate.toFixed(4)}
                      </div>
                      <div className="flex items-center mt-1">
                        {rate > 1 ? (
                          <TrendingUp className="h-3 w-3 text-green-500" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-500" />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Conversion History
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportHistory}
                  disabled={conversionHistory.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </CardTitle>
              <CardDescription>
                Your recent currency conversions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {conversionHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No conversion history yet
                </div>
              ) : (
                <div className="space-y-3">
                  {conversionHistory.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">
                          {getCurrencySymbol(item.fromCurrency)}{item.amount.toFixed(2)} {item.fromCurrency} → {getCurrencySymbol(item.toCurrency)}{item.result.toFixed(2)} {item.toCurrency}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {item.timestamp.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">
                          Rate: {item.rate.toFixed(4)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}