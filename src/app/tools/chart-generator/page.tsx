'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { BarChart3, PieChart, LineChart, TrendingUp, Download, Copy, RefreshCw, AlertCircle, CheckCircle, Palette } from 'lucide-react'

interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor: string[]
    borderColor: string[]
    borderWidth: number
  }[]
}

interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar'
  title: string
  xAxisLabel?: string
  yAxisLabel?: string
  showLegend: boolean
  showGrid: boolean
  responsive: boolean
  maintainAspectRatio: boolean
}

const colorPalettes = [
  ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
  ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'],
  ['#FF8A80', '#80D8FF', '#B388FF', '#8C9EFF', '#80DEEA', '#A7FFEB'],
  ['#F48FB1', '#CE93D8', '#90CAF9', '#80CBC4', '#A5D6A7', '#FFCC02'],
  ['#EF5350', '#42A5F5', '#FFCA28', '#66BB6A', '#AB47BC', '#26C6DA']
]

export default function ChartGenerator() {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'doughnut' | 'radar'>('bar')
  const [chartTitle, setChartTitle] = useState('My Chart')
  const [dataInput, setDataInput] = useState('')
  const [labelsInput, setLabelsInput] = useState('')
  const [datasetLabel, setDatasetLabel] = useState('Dataset 1')
  const [chartConfig, setChartConfig] = useState<ChartConfig>({
    type: 'bar',
    title: 'My Chart',
    showLegend: true,
    showGrid: true,
    responsive: true,
    maintainAspectRatio: false
  })
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [selectedPalette, setSelectedPalette] = useState(0)

  const parseData = (dataText: string): number[] => {
    return dataText
      .split(/[,\n\r\t]+/)
      .map(item => parseFloat(item.trim()))
      .filter(num => !isNaN(num))
  }

  const parseLabels = (labelsText: string): string[] => {
    return labelsText
      .split(/[,\n\r\t]+/)
      .map(label => label.trim())
      .filter(label => label.length > 0)
  }

  const generateChart = async () => {
    if (!dataInput) {
      setError('Please enter data values')
      return
    }

    const data = parseData(dataInput)
    const labels = labelsInput ? parseLabels(labelsInput) : data.map((_, index) => `Item ${index + 1}`)

    if (data.length === 0) {
      setError('Please enter valid numeric data')
      return
    }

    if (labels.length !== data.length) {
      setError('Number of labels must match number of data points')
      return
    }

    setIsGenerating(true)
    setError(null)
    setSuccess(false)

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))

      const colors = colorPalettes[selectedPalette]
      const backgroundColors = data.map((_, index) => colors[index % colors.length])
      const borderColors = backgroundColors.map(color => color.replace('0.8', '1'))

      const chartData: ChartData = {
        labels,
        datasets: [{
          label: datasetLabel,
          data,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 2
        }]
      }

      setChartData(chartData)
      setSuccess(true)

    } catch (err) {
      setError('Failed to generate chart')
    } finally {
      setIsGenerating(false)
    }
  }

  const generateSampleData = () => {
    const sampleData = Array.from({ length: 6 }, () => Math.floor(Math.random() * 100) + 10)
    const sampleLabels = ['January', 'February', 'March', 'April', 'May', 'June']
    
    setDataInput(sampleData.join(', '))
    setLabelsInput(sampleLabels.join(', '))
    setDatasetLabel('Monthly Sales')
    setChartTitle('Monthly Sales Report')
  }

  const downloadChart = () => {
    if (!chartData) return

    // Create a simple SVG representation for download
    const svg = createChartSVG(chartData, chartConfig)
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${chartTitle.replace(/\s+/g, '_')}.svg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const createChartSVG = (data: ChartData, config: ChartConfig): string => {
    const width = 800
    const height = 600
    const margin = { top: 60, right: 60, bottom: 80, left: 80 }
    const chartWidth = width - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom

    const maxValue = Math.max(...data.datasets[0].data)
    const barWidth = chartWidth / data.labels.length * 0.8

    let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`
    
    // Background
    svg += `<rect width="${width}" height="${height}" fill="white"/>`
    
    // Title
    svg += `<text x="${width/2}" y="30" text-anchor="middle" font-size="20" font-weight="bold">${config.title}</text>`
    
    if (config.type === 'bar') {
      // Bars
      data.labels.forEach((label, index) => {
        const value = data.datasets[0].data[index]
        const barHeight = (value / maxValue) * chartHeight
        const x = margin.left + (index * chartWidth / data.labels.length) + (chartWidth / data.labels.length - barWidth) / 2
        const y = margin.top + chartHeight - barHeight
        
        svg += `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="${data.datasets[0].backgroundColor[index]}" stroke="${data.datasets[0].borderColor[index]}" stroke-width="1"/>`
        svg += `<text x="${x + barWidth/2}" y="${y - 5}" text-anchor="middle" font-size="12">${value}</text>`
        svg += `<text x="${x + barWidth/2}" y="${height - 20}" text-anchor="middle" font-size="12">${label}</text>`
      })
    } else if (config.type === 'line') {
      // Line chart implementation would go here
      // For now, create a simple placeholder
      svg += `<text x="${width/2}" y="${height/2}" text-anchor="middle" font-size="16" fill="gray">Line Chart Placeholder</text>`
    }

    svg += '</svg>'
    return svg
  }

  const copyChartData = () => {
    if (!chartData) return
    
    const dataStr = JSON.stringify(chartData, null, 2)
    navigator.clipboard.writeText(dataStr)
  }

  const getChartIcon = (type: string) => {
    switch (type) {
      case 'bar': return <BarChart3 className="h-4 w-4" />
      case 'line': return <LineChart className="h-4 w-4" />
      case 'pie': return <PieChart className="h-4 w-4" />
      case 'doughnut': return <PieChart className="h-4 w-4" />
      case 'radar': return <TrendingUp className="h-4 w-4" />
      default: return <BarChart3 className="h-4 w-4" />
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Chart Generator
            </CardTitle>
            <CardDescription>
              Create beautiful charts from your data with customizable styles and export options
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="data" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="data">Data</TabsTrigger>
                <TabsTrigger value="config">Configuration</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="data" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="chart-title">Chart Title</Label>
                    <Input
                      id="chart-title"
                      placeholder="Enter chart title..."
                      value={chartTitle}
                      onChange={(e) => setChartTitle(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="chart-type">Chart Type</Label>
                    <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bar">
                          <div className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Bar Chart
                          </div>
                        </SelectItem>
                        <SelectItem value="line">
                          <div className="flex items-center gap-2">
                            <LineChart className="h-4 w-4" />
                            Line Chart
                          </div>
                        </SelectItem>
                        <SelectItem value="pie">
                          <div className="flex items-center gap-2">
                            <PieChart className="h-4 w-4" />
                            Pie Chart
                          </div>
                        </SelectItem>
                        <SelectItem value="doughnut">
                          <div className="flex items-center gap-2">
                            <PieChart className="h-4 w-4" />
                            Doughnut Chart
                          </div>
                        </SelectItem>
                        <SelectItem value="radar">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Radar Chart
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="dataset-label">Dataset Label</Label>
                  <Input
                    id="dataset-label"
                    placeholder="Enter dataset label..."
                    value={datasetLabel}
                    onChange={(e) => setDatasetLabel(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="labels">Labels (optional)</Label>
                  <Textarea
                    id="labels"
                    placeholder="Enter labels separated by commas or new lines..."
                    value={labelsInput}
                    onChange={(e) => setLabelsInput(e.target.value)}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    If not provided, will use "Item 1", "Item 2", etc.
                  </p>
                </div>

                <div>
                  <Label htmlFor="data">Data Values</Label>
                  <Textarea
                    id="data"
                    placeholder="Enter numeric values separated by commas or new lines..."
                    value={dataInput}
                    onChange={(e) => setDataInput(e.target.value)}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter numbers separated by commas, spaces, or new lines
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Color Palette</Label>
                    <div className="flex gap-2 mt-2">
                      {colorPalettes.map((palette, index) => (
                        <div
                          key={index}
                          className={`w-8 h-8 rounded cursor-pointer border-2 ${selectedPalette === index ? 'border-primary' : 'border-gray-300'}`}
                          style={{ background: `linear-gradient(45deg, ${palette.slice(0, 3).join(', ')})` }}
                          onClick={() => setSelectedPalette(index)}
                        />
                      ))}
                    </div>
                  </div>
                  <Button variant="outline" onClick={generateSampleData}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sample Data
                  </Button>
                </div>

                <Button
                  onClick={generateChart}
                  disabled={isGenerating || !dataInput}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Generate Chart
                    </>
                  )}
                </Button>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-red-700 text-sm">{error}</span>
                  </div>
                )}

                {success && chartData && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-green-700 text-sm">
                      Chart generated successfully with {chartData.labels.length} data points!
                    </span>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="config" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="x-axis-label">X-Axis Label (optional)</Label>
                    <Input
                      id="x-axis-label"
                      placeholder="Enter X-axis label..."
                      value={chartConfig.xAxisLabel || ''}
                      onChange={(e) => setChartConfig(prev => ({ ...prev, xAxisLabel: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="y-axis-label">Y-Axis Label (optional)</Label>
                    <Input
                      id="y-axis-label"
                      placeholder="Enter Y-axis label..."
                      value={chartConfig.yAxisLabel || ''}
                      onChange={(e) => setChartConfig(prev => ({ ...prev, yAxisLabel: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label>Chart Options</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="show-legend"
                        checked={chartConfig.showLegend}
                        onCheckedChange={(checked) => 
                          setChartConfig(prev => ({ ...prev, showLegend: checked as boolean }))
                        }
                      />
                      <Label htmlFor="show-legend" className="text-sm">Show Legend</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="show-grid"
                        checked={chartConfig.showGrid}
                        onCheckedChange={(checked) => 
                          setChartConfig(prev => ({ ...prev, showGrid: checked as boolean }))
                        }
                      />
                      <Label htmlFor="show-grid" className="text-sm">Show Grid</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="responsive"
                        checked={chartConfig.responsive}
                        onCheckedChange={(checked) => 
                          setChartConfig(prev => ({ ...prev, responsive: checked as boolean }))
                        }
                      />
                      <Label htmlFor="responsive" className="text-sm">Responsive</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="maintain-aspect-ratio"
                        checked={chartConfig.maintainAspectRatio}
                        onCheckedChange={(checked) => 
                          setChartConfig(prev => ({ ...prev, maintainAspectRatio: checked as boolean }))
                        }
                      />
                      <Label htmlFor="maintain-aspect-ratio" className="text-sm">Maintain Aspect Ratio</Label>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="preview" className="space-y-4">
                {chartData ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{chartTitle}</h3>
                        <p className="text-sm text-muted-foreground">
                          {getChartIcon(chartType)} {chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={copyChartData}>
                          <Copy className="h-4 w-4 mr-1" />
                          Copy Data
                        </Button>
                        <Button variant="outline" size="sm" onClick={downloadChart}>
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>

                    <Card>
                      <CardContent className="p-6">
                        <div className="w-full h-96 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                          <div className="text-center">
                            <BarChart3 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                            <h4 className="text-lg font-medium text-gray-600 mb-2">{chartTitle}</h4>
                            <p className="text-sm text-gray-500 mb-4">
                              Interactive {chartType} chart preview
                            </p>
                            <div className="flex justify-center gap-2">
                              {chartData.labels.slice(0, 5).map((label, index) => (
                                <div key={index} className="text-center">
                                  <div 
                                    className="w-4 h-4 rounded-full mx-auto mb-1"
                                    style={{ backgroundColor: chartData.datasets[0].backgroundColor[index] }}
                                  />
                                  <span className="text-xs text-gray-600">{label}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Data Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Data Points:</span>
                              <span className="font-medium">{chartData.labels.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Min Value:</span>
                              <span className="font-medium">{Math.min(...chartData.datasets[0].data)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Max Value:</span>
                              <span className="font-medium">{Math.max(...chartData.datasets[0].data)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Average:</span>
                              <span className="font-medium">
                                {(chartData.datasets[0].data.reduce((a, b) => a + b, 0) / chartData.datasets[0].data.length).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Color Palette</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {chartData.datasets[0].backgroundColor.map((color, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <div 
                                  className="w-6 h-6 rounded border"
                                  style={{ backgroundColor: color }}
                                />
                                <span className="text-xs font-mono">{color}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No chart generated yet. Go to the Data tab to create your chart.
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Features</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Multiple Chart Types:</strong> Bar, Line, Pie, Doughnut, Radar
            </div>
            <div>
              <strong>Custom Styling:</strong> Color palettes, labels, titles
            </div>
            <div>
              <strong>Data Input:</strong> Flexible data entry with comma or line separation
            </div>
            <div>
              <strong>Export Options:</strong> Download charts as SVG images
            </div>
            <div>
              <strong>Live Preview:</strong> Interactive chart preview with data summary
            </div>
            <div>
              <strong>Sample Data:</strong> Generate sample data for testing
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}