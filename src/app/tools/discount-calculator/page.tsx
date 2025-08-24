'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Percent, Calculator, Copy, RefreshCw } from 'lucide-react'

export default function DiscountCalculator() {
  const [originalPrice, setOriginalPrice] = useState('')
  const [discountPercentage, setDiscountPercentage] = useState('')
  const [discountAmount, setDiscountAmount] = useState('')
  const [finalPrice, setFinalPrice] = useState('')
  const [calculationType, setCalculationType] = useState('percentage')
  const [youSave, setYouSave] = useState('')

  const calculateDiscount = () => {
    const price = parseFloat(originalPrice)
    if (isNaN(price) || price <= 0) {
      resetResults()
      return
    }

    let discount = 0
    let final = 0

    if (calculationType === 'percentage') {
      const percentage = parseFloat(discountPercentage)
      if (isNaN(percentage) || percentage < 0 || percentage > 100) {
        resetResults()
        return
      }
      discount = (price * percentage) / 100
      final = price - discount
      setDiscountAmount(discount.toFixed(2))
    } else {
      const amount = parseFloat(discountAmount)
      if (isNaN(amount) || amount < 0 || amount > price) {
        resetResults()
        return
      }
      discount = amount
      final = price - discount
      const percentage = (discount / price) * 100
      setDiscountPercentage(percentage.toFixed(2))
    }

    setFinalPrice(final.toFixed(2))
    setYouSave(discount.toFixed(2))
  }

  const resetResults = () => {
    setDiscountAmount('')
    setFinalPrice('')
    setYouSave('')
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const clearAll = () => {
    setOriginalPrice('')
    setDiscountPercentage('')
    setDiscountAmount('')
    setFinalPrice('')
    setYouSave('')
  }

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount)
    if (isNaN(num)) return amount
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(num)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Discount Calculator</h1>
          <p className="text-muted-foreground">
            Calculate discounts and final prices quickly and accurately
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Discount Calculation
              </CardTitle>
              <CardDescription>
                Enter the original price and discount information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="originalPrice">Original Price ($)</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Enter original price"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Calculation Type</Label>
                <Select value={calculationType} onValueChange={setCalculationType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select calculation type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Discount Percentage</SelectItem>
                    <SelectItem value="amount">Fixed Discount Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {calculationType === 'percentage' ? (
                <div className="space-y-2">
                  <Label htmlFor="discountPercentage">Discount Percentage (%)</Label>
                  <Input
                    id="discountPercentage"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    placeholder="Enter discount percentage"
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(e.target.value)}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="discountAmount">Discount Amount ($)</Label>
                  <Input
                    id="discountAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Enter discount amount"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={calculateDiscount} className="flex-1">
                  <Percent className="w-4 h-4 mr-2" />
                  Calculate Discount
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
                Your discount calculation results will appear here
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {finalPrice ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Original Price</Label>
                      <div className="flex items-center gap-2">
                        <Input value={formatCurrency(originalPrice)} readOnly className="flex-1" />
                        <Button 
                          onClick={() => copyToClipboard(formatCurrency(originalPrice))} 
                          variant="outline" 
                          size="icon"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">You Save</Label>
                      <div className="flex items-center gap-2">
                        <Input value={formatCurrency(youSave)} readOnly className="flex-1" />
                        <Button 
                          onClick={() => copyToClipboard(formatCurrency(youSave))} 
                          variant="outline" 
                          size="icon"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Final Price</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        value={formatCurrency(finalPrice)} 
                        readOnly 
                        className="flex-1 text-lg font-bold text-green-600" 
                      />
                      <Button 
                        onClick={() => copyToClipboard(formatCurrency(finalPrice))} 
                        variant="outline" 
                        size="icon"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {calculationType === 'percentage' && discountPercentage && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Discount Percentage</Label>
                      <div className="flex items-center gap-2">
                        <Input value={`${discountPercentage}%`} readOnly className="flex-1" />
                        <Badge variant="secondary">{discountPercentage}%</Badge>
                      </div>
                    </div>
                  )}

                  {/* Visual Representation */}
                  <div className="pt-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Price Breakdown</Label>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Original Price</span>
                          <span className="text-sm font-medium">{formatCurrency(originalPrice)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Discount</span>
                          <span className="text-sm font-medium text-red-600">-{formatCurrency(youSave)}</span>
                        </div>
                        <div className="border-t pt-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Final Price</span>
                            <span className="font-bold text-green-600">{formatCurrency(finalPrice)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Enter the original price and discount information to see results
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Common Discounts */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Common Discount Percentages</CardTitle>
            <CardDescription>
              Quick reference for common discount scenarios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { percentage: 10, description: 'Common sale' },
                { percentage: 20, description: 'Good deal' },
                { percentage: 25, description: 'Quarter off' },
                { percentage: 33, description: 'Third off' },
                { percentage: 50, description: 'Half price' },
                { percentage: 75, description: 'Three-quarters off' }
              ].map((item) => (
                <Button
                  key={item.percentage}
                  variant="outline"
                  className="h-auto p-3 flex-col"
                  onClick={() => {
                    setCalculationType('percentage')
                    setDiscountPercentage(item.percentage.toString())
                    if (originalPrice) calculateDiscount()
                  }}
                >
                  <div className="text-lg font-bold">{item.percentage}%</div>
                  <div className="text-xs">{item.description}</div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Discount Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">For Shoppers</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Compare final prices across different retailers</li>
                  <li>• Look for additional coupons or cashback offers</li>
                  <li>• Check if the discount applies to the total purchase</li>
                  <li>• Consider the value per unit for bulk purchases</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">For Businesses</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Calculate profit margins after discounts</li>
                  <li>• Consider seasonal pricing strategies</li>
                  <li>• Use psychological pricing (e.g., $19.99 vs $20)</li>
                  <li>• Monitor competitor pricing regularly</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}