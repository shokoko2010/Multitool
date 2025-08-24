'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Dice1, Shuffle, Target, List, Plus, Trash2 } from 'lucide-react'

export default function RandomDecisionMaker() {
  const [options, setOptions] = useState<string[]>(['Option 1', 'Option 2', 'Option 3'])
  const [newOption, setNewOption] = useState('')
  const [selectedOption, setSelectedOption] = useState<string>('')
  const [isSpinning, setIsSpinning] = useState(false)
  const [history, setHistory] = useState<string[]>([])

  const addOption = () => {
    if (newOption.trim() && !options.includes(newOption.trim())) {
      setOptions([...options, newOption.trim()])
      setNewOption('')
    }
  }

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index))
  }

  const makeRandomDecision = () => {
    if (options.length < 2) return

    setIsSpinning(true)
    setSelectedOption('')

    // Simulate spinning animation
    let spinCount = 0
    const spinInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * options.length)
      setSelectedOption(options[randomIndex])
      spinCount++

      if (spinCount > 20) {
        clearInterval(spinInterval)
        const finalIndex = Math.floor(Math.random() * options.length)
        setSelectedOption(options[finalIndex])
        setIsSpinning(false)
        setHistory([options[finalIndex], ...history.slice(0, 9)])
      }
    }, 100)
  }

  const clearHistory = () => {
    setHistory([])
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addOption()
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Random Decision Maker</h1>
        <p className="text-muted-foreground">
          Let fate decide! Add your options and let the random generator make the choice for you
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <List className="h-5 w-5" />
                Your Options
              </CardTitle>
              <CardDescription>
                Add the options you want to choose from
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a new option"
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <Button onClick={addOption} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  {options.map((option, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <span>{option}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOption(index)}
                        className="h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {options.length < 2 && (
                  <p className="text-sm text-muted-foreground">
                    Add at least 2 options to make a decision
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shuffle className="h-5 w-5" />
                Decision History
              </CardTitle>
              <CardDescription>
                Recent decisions made with this tool
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {history.length > 0 ? (
                  <>
                    {history.map((decision, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span>{decision}</span>
                        <Badge variant="outline">#{index + 1}</Badge>
                      </div>
                    ))}
                    <Button variant="outline" onClick={clearHistory} className="w-full">
                      Clear History
                    </Button>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No decisions made yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dice1 className="h-5 w-5" />
                Make Decision
              </CardTitle>
              <CardDescription>
                Click the button to let fate decide
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-6">
                <div className="relative">
                  <div className={`w-32 h-32 mx-auto rounded-full border-4 flex items-center justify-center ${
                    isSpinning ? 'border-primary animate-pulse' : 'border-muted-foreground/20'
                  }`}>
                    {selectedOption ? (
                      <div className="text-center px-4">
                        <div className="text-lg font-bold">{selectedOption}</div>
                      </div>
                    ) : (
                      <Target className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>
                  
                  {isSpinning && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
                    </div>
                  )}
                </div>

                <Button
                  onClick={makeRandomDecision}
                  disabled={options.length < 2 || isSpinning}
                  size="lg"
                  className="w-full"
                >
                  <Dice1 className="h-5 w-5 mr-2" />
                  {isSpinning ? 'Making Decision...' : 'Make Random Decision'}
                </Button>

                {selectedOption && !isSpinning && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-green-800 font-medium">
                      Decision: {selectedOption}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Templates</CardTitle>
              <CardDescription>
                Use these pre-filled option sets for common decisions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => setOptions(['Yes', 'No'])}
                  className="w-full justify-start"
                >
                  Yes/No Decision
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setOptions(['Pizza', 'Burger', 'Sushi', 'Pasta', 'Salad'])}
                  className="w-full justify-start"
                >
                  What to Eat?
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setOptions(['Movie', 'TV Show', 'Book', 'Game', 'Music'])}
                  className="w-full justify-start"
                >
                  Entertainment Choice
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setOptions(['Go Out', 'Stay Home', 'Exercise', 'Socialize', 'Relax'])}
                  className="w-full justify-start"
                >
                  Weekend Activity
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}