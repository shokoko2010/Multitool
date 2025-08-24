'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Calculator, Copy, RefreshCw, Percent } from 'lucide-react'

const vatRates = [
  { country: 'United States', rate: 0, code: 'US' },
  { country: 'United Kingdom', rate: 20, code: 'UK' },
  { country: 'Germany', rate: 19, code: 'DE' },
  { country: 'France', rate: 20, code: 'FR' },
  { country: 'Italy', rate: 22, code: 'IT' },
  { country: 'Spain', rate: 21, code: 'ES' },
  { country: 'Netherlands', rate: 21, code: 'NL' },
  { country: 'Belgium', rate: 21, code: 'BE' },
  { country: 'Ireland', rate: 23, code: 'IE' },
  { country: 'Sweden', rate: 25, code: 'SE' },
  { country: 'Denmark', rate: 25, code: 'DK' },
  { country: 'Norway', rate: 25, code: 'NO' },
  { country: 'Switzerland', rate: 7.7, code: 'CH' },
  { country: 'Australia', rate: 10, code: 'AU' },
  { country: 'New Zealand', rate: 15, code: 'NZ' },
  { country: 'Canada', rate: 5, code: 'CA' },
  { country: 'Japan', rate: 10, code: 'JP' },
  { country: 'South Korea', rate: 10, code: 'KR' },
  { country: 'Singapore', rate: 8, code: 'SG' },
  { country: 'India', rate: 18, code: 'IN' },
  { country: 'Brazil', rate: 17, code: 'BR' },
  { country: 'Mexico', rate: 16, code: 'MX' },
  { country: 'Argentina', rate: 21, code: 'AR' },
  { country: 'China', rate: 13, code: 'CN' },
  { country: 'Russia', rate: 20, code: 'RU' },
  { country: 'Turkey', rate: 20, code: 'TR' },
  { country: 'South Africa', rate: 15, code: 'ZA' },
  { country: 'Israel', rate: 17, code: 'IL' },
  { country: 'United Arab Emirates', rate: 5, code: 'AE' },
  { country: 'Saudi Arabia', rate: 15, code: 'SA' },
  { country: 'Egypt', rate: 14, code: 'EG' },
  { country: 'Nigeria', rate: 7.5, code: 'NG' },
  { country: 'Kenya', rate: 16, code: 'KE' }
]

export default function VATCalculator() {
  const [amount, setAmount] = useState('')
  const [vatRate, setVatRate] = useState('20')
  const [calculationType, setCalculationType] = useState('exclusive')
  const [vatAmount, setVatAmount] = useState('')
  const [totalAmount, setTotalAmount] = useState('')
  const [netAmount, setNetAmount] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('United Kingdom')

  const calculateVAT = () => {
    const amt = parseFloat(amount)
    if (isNaN(amt) || amt <= 0) {
      resetResults()
      return
    }

    const rate = parseFloat(vatRate) / 100
    let vat = 0
    let total = 0
    let net = 0

    if (calculationType === 'exclusive') {
      // Amount is exclusive of VAT
      vat = amt * rate
      total = amt + vat
      net = amt
    } else {
      // Amount is inclusive of VAT
      total = amt
      net = amt / (1 + rate)
      vat = total - net
    }

    setVatAmount(vat.toFixed(2))
    setTotalAmount(total.toFixed(2))
    setNetAmount(net.toFixed(2))
  }

  const resetResults = () => {
    setVatAmount('')
    setTotalAmount('')
    setNetAmount('')
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const clearAll = () => {
    setAmount('')
    setVatRate('20')
    setCalculationType('exclusive')
    setVatAmount('')
    setTotalAmount('')
    setNetAmount('')
  }

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount)
    if (isNaN(num)) return amount
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(num)
  }

  const handleCountryChange = (country: string) => {
    setSelectedCountry(country)
    const countryData = vatRates.find(c => c.country === country)
    if (countryData) {
      setVatRate(countryData.rate.toString())
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">VAT Calculator</h1>
          <p className="text-muted-foreground">
            Calculate Value Added Tax (VAT) for different countries
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                VAT Calculation
              </CardTitle>
              <CardDescription>
                Enter amount and select VAT rate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select value={selectedCountry} onValueChange={handleCountryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {vatRates.map((country) => (
                      <SelectItem key={country.code} value={country.country}>
                        {country.country} ({country.rate}%)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vatRate">VAT Rate (%)</Label>
                <Input
                  id="vatRate"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  placeholder="Enter VAT rate"
                  value={vatRate}
                  onChange={(e) => setVatRate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Amount Type</Label>
                <Select value={calculationType} onValueChange={setCalculationType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select amount type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exclusive">Exclusive of VAT</SelectItem>
                    <SelectItem value="inclusive">Inclusive of VAT</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button onClick={calculateVAT} className="flex-1">
                  <Percent className="w-4 h-4 mr-2" />
                  Calculate VAT
                </Button>
                <Button onClick={clearAll} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader>
              <CardTitle>Calculation Results</CardTitle>
              <CardDescription>
                Your VAT calculation results will appear here
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {totalAmount ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    {calculationType === 'exclusive' ? (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Net Amount (Excl. VAT)</Label>
                        <div className="flex items-center gap-2">
                          <Input value={formatCurrency(amount)} readOnly className="flex-1" />
                          <Button 
                            onClick={() => copyToClipboard(formatCurrency(amount))} 
                            variant="outline" 
                            size="icon"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Gross Amount (Incl. VAT)</Label>
                        <div className="flex items-center gap-2">
                          <Input value={formatCurrency(amount)} readOnly className="flex-1" />
                          <Button 
                            onClick={() => copyToClipboard(formatCurrency(amount))} 
                            variant="outline" 
                            size="icon"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">VAT Amount ({vatRate}%)</Label>
                      <div className="flex items-center gap-2">
                        <Input value={formatCurrency(vatAmount)} readOnly className="flex-1" />
                        <Button 
                          onClick={() => copyToClipboard(formatCurrency(vatAmount))} 
                          variant="outline" 
                          size="icon"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {calculationType === 'exclusive' ? (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Total Amount (Incl. VAT)</Label>
                        <div className="flex items-center gap-2">
                          <Input 
                            value={formatCurrency(totalAmount)} 
                            readOnly 
                            className="flex-1 text-lg font-bold text-green-600" 
                          />
                          <Button 
                            onClick={() => copyToClipboard(formatCurrency(totalAmount))} 
                            variant="outline" 
                            size="icon"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Net Amount (Excl. VAT)</Label>
                        <div className="flex items-center gap-2">
                          <Input 
                            value={formatCurrency(netAmount)} 
                            readOnly 
                            className="flex-1 text-lg font-bold text-blue-600" 
                          />
                          <Button 
                            onClick={() => copyToClipboard(formatCurrency(netAmount))} 
                            variant="outline" 
                            size="icon"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Visual Representation */}
                  <div className="pt-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Breakdown</Label>
                      <div className="space-y-2">
                        {calculationType === 'exclusive' ? (
                          <>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Net Amount</span>
                              <span className="text-sm font-medium">{formatCurrency(netAmount)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">VAT ({vatRate}%)</span>
                              <span className="text-sm font-medium text-red-600">{formatCurrency(vatAmount)}</span>
                            </div>
                            <div className="border-t pt-2">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">Total Amount</span>
                                <span className="font-bold text-green-600">{formatCurrency(totalAmount)}</span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Gross Amount</span>
                              <span className="text-sm font-medium">{formatCurrency(totalAmount)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">VAT ({vatRate}%)</span>
                              <span className="text-sm font-medium text-red-600">-{formatCurrency(vatAmount)}</span>
                            </div>
                            <div className="border-t pt-2">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">Net Amount</span>
                                <span className="font-bold text-blue-600">{formatCurrency(netAmount)}</span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {selectedCountry}
                    </Badge>
                    <Badge variant="secondary">
                      VAT Rate: {vatRate}%
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Enter the amount and select VAT rate to see results
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Common VAT Rates */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Common VAT Rates by Country</CardTitle>
            <CardDescription>
              Quick reference for VAT rates around the world
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vatRates.filter(c => c.rate > 0).slice(0, 12).map((country) => (
                <Button
                  key={country.code}
                  variant="outline"
                  className="h-auto p-3 flex-col justify-start"
                  onClick={() => {
                    setSelectedCountry(country.country)
                    setVatRate(country.rate.toString())
                    if (amount) calculateVAT()
                  }}
                >
                  <div className="font-medium">{country.country}</div>
                  <div className="text-lg font-bold text-primary">{country.rate}%</div>
                  <div className="text-xs text-muted-foreground">{country.code}</div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* VAT Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>About VAT</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">What is VAT?</h4>
                <p className="text-sm text-muted-foreground">
                  Value Added Tax (VAT) is a consumption tax placed on a product whenever value is added 
                  at each stage of the supply chain, from production to the point of sale.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">How VAT Works</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Businesses collect VAT on sales</li>
                  <li>• Businesses pay VAT on purchases</li>
                  <li>• Net VAT paid to government</li>
                  <li>• End consumer bears the tax cost</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">VAT vs Sales Tax</h4>
                <p className="text-sm text-muted-foreground">
                  VAT is collected at each stage of production, while sales tax is only collected 
                  at the final point of sale to the consumer.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">VAT Registration</h4>
                <p className="text-sm text-muted-foreground">
                  Businesses must register for VAT when their turnover exceeds a certain threshold, 
                  which varies by country.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}