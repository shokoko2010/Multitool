'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ArrowRightLeft, DollarSign, RefreshCw } from 'lucide-react'

interface Currency {
  code: string
  name: string
  flag: string
}

interface ExchangeRate {
  from: string
  to: string
  rate: number
  timestamp: number
}

const currencies: Currency[] = [
  { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵' },
  { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭' },
  { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳' },
  { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳' },
  { code: 'MXN', name: 'Mexican Peso', flag: '🇲🇽' },
  { code: 'BRL', name: 'Brazilian Real', flag: '🇧🇷' },
  { code: 'RUB', name: 'Russian Ruble', flag: '🇷🇺' },
  { code: 'KRW', name: 'South Korean Won', flag: '🇰🇷' },
  { code: 'SGD', name: 'Singapore Dollar', flag: '🇸🇬' },
  { code: 'HKD', name: 'Hong Kong Dollar', flag: '🇭🇰' },
  { code: 'NOK', name: 'Norwegian Krone', flag: '🇳🇴' },
  { code: 'SEK', name: 'Swedish Krona', flag: '🇸🇪' },
  { code: 'DKK', name: 'Danish Krone', flag: '🇩🇰' },
  { code: 'PLN', name: 'Polish Złoty', flag: '🇵🇱' },
  { code: 'THB', name: 'Thai Baht', flag: '🇹🇭' },
  { code: 'MYR', name: 'Malaysian Ringgit', flag: '🇲🇾' }
]

export default function CurrencyConverter() {
  const [amount, setAmount] = useState('1')
  const [fromCurrency, setFromCurrency] = useState('USD')
  const [toCurrency, setToCurrency] = useState('EUR')
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null)
  const [exchangeRate, setExchangeRate] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const convertCurrency = async () => {
    if (!amount || isNaN(parseFloat(amount))) {
      setConvertedAmount(null)
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/converters/currency?from=${fromCurrency}&to=${toCurrency}&amount=${amount}`)
      const data = await response.json()
      
      if (data.success) {
        setConvertedAmount(data.data.convertedAmount)
        setExchangeRate(data.data.rate)
        setLastUpdated(new Date())
      } else {
        console.error('Conversion failed:', data.error)
      }
    } catch (error) {
      console.error('Error converting currency:', error)
    } finally {
      setLoading(false)
    }
  }

  const swapCurrencies = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
  }

  useEffect(() => {
    convertCurrency()
  }, [fromCurrency, toCurrency])

  const handleAmountChange = (value: string) => {
    setAmount(value)
    if (value && !isNaN(parseFloat(value))) {
      convertCurrency()
    } else {
      setConvertedAmount(null)
    }
  }

  const getCurrencyInfo = (code: string) => {
    return currencies.find(c => c.code === code) || currencies[0]
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(num)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <DollarSign className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold">Currency Converter</h1>
            </div>
            <p className="text-muted-foreground">
              Convert between different currencies with real-time exchange rates
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Convert Currency</CardTitle>
              <CardDescription>
                Enter amount and select currencies to convert
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount</label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder="Enter amount"
                    className="text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">From</label>
                  <Select value={fromCurrency} onValueChange={setFromCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          <div className="flex items-center gap-2">
                            <span>{currency.flag}</span>
                            <span>{currency.code}</span>
                            <span className="text-muted-foreground text-sm">- {currency.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={swapCurrencies}
                    className="w-full"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">To</label>
                  <Select value={toCurrency} onValueChange={setToCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          <div className="flex items-center gap-2">
                            <span>{currency.flag}</span>
                            <span>{currency.code}</span>
                            <span className="text-muted-foreground text-sm">- {currency.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Result</label>
                  <div className="p-3 border rounded-md bg-muted/50">
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Converting...</span>
                      </div>
                    ) : convertedAmount !== null ? (
                      <div className="text-lg font-semibold">
                        {formatNumber(convertedAmount)} {toCurrency}
                      </div>
                    ) : (
                      <div className="text-muted-foreground">Enter amount to convert</div>
                    )}
                  </div>
                </div>
              </div>

              {exchangeRate && (
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Exchange Rate</span>
                    <Badge variant="secondary">
                      1 {fromCurrency} = {formatNumber(exchangeRate)} {toCurrency}
                    </Badge>
                  </div>
                  
                  {lastUpdated && (
                    <div className="text-xs text-muted-foreground">
                      Last updated: {lastUpdated.toLocaleString()}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-center pt-4">
                <Button onClick={convertCurrency} disabled={loading}>
                  {loading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                  Convert
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Popular Currency Pairs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { from: 'USD', to: 'EUR' },
                  { from: 'USD', to: 'GBP' },
                  { from: 'USD', to: 'JPY' },
                  { from: 'EUR', to: 'GBP' },
                  { from: 'EUR', to: 'USD' },
                  { from: 'GBP', to: 'USD' }
                ].map((pair, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFromCurrency(pair.from)
                      setToCurrency(pair.to)
                    }}
                    className="justify-start"
                  >
                    {pair.from}/{pair.to}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}