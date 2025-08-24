'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BarChart3, PieChart, LineChart, Download, Upload, Palette, Settings } from 'lucide-react'

interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string[]
    borderColor?: string
    borderWidth?: number
  }[]
}

interface ChartConfig {
  type: 'bar' | 'pie' | 'line' | 'doughnut' | 'radar' | 'polarArea'
  title: string
  width: number
  height: number
  backgroundColor: string
  borderColor: string
  showLegend: boolean
  showGrid: boolean
}

const defaultColors = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
  '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
]

export default function ChartCreator() {
  const [csvData, setCsvData] = useState('')
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [config, setConfig] = useState<ChartConfig>({
    type: 'bar',
    title: 'My Chart',
    width: 800,
    height: 600,
    backgroundColor: '#ffffff',
    borderColor: '#cccccc',
    showLegend: true,
    showGrid: true
  })
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const parseCSV = (csv: string): ChartData => {
    const lines = csv.trim().split('\\n')
    if (lines.length < 2) throw new Error('CSV must have at least 2 lines')

    const headers = lines[0].split(',').map(h => h.trim())
    const dataRows = lines.slice(1).map(line => 
      line.split(',').map(cell => parseFloat(cell.trim()) || 0)
    )

    const labels = headers.slice(1)
    const datasets = dataRows.map((row, index) => ({
      label: row[0].toString() || `Dataset ${index + 1}`,
      data: row.slice(1),
      backgroundColor: defaultColors[index % defaultColors.length],
      borderColor: defaultColors[index % defaultColors.length],
      borderWidth: 2
    }))

    return { labels, datasets }
  }

  const drawChart = () => {
    const canvas = canvasRef.current
    if (!canvas || !chartData) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = config.width
    canvas.height = config.height

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set background
    ctx.fillStyle = config.backgroundColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Chart dimensions
    const padding = 60
    const chartWidth = canvas.width - 2 * padding
    const chartHeight = canvas.height - 2 * padding - 40 // Extra space for title

    // Draw title
    ctx.fillStyle = '#333333'
    ctx.font = 'bold 24px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(config.title, canvas.width / 2, 30)

    // Draw chart based on type
    switch (config.type) {
      case 'bar':
        drawBarChart(ctx, chartData, padding, chartWidth, chartHeight)
        break
      case 'pie':
        drawPieChart(ctx, chartData, padding, chartWidth, chartHeight)
        break
      case 'line':
        drawLineChart(ctx, chartData, padding, chartWidth, chartHeight)
        break
      case 'doughnut':
        drawDoughnutChart(ctx, chartData, padding, chartWidth, chartHeight)
        break
      default:
        drawBarChart(ctx, chartData, padding, chartWidth, chartHeight)
    }

    // Draw legend
    if (config.showLegend) {
      drawLegend(ctx, chartData, canvas.width, canvas.height)
    }
  }

  const drawBarChart = (ctx: CanvasRenderingContext2D, data: ChartData, padding: number, width: number, height: number) => {
    if (data.datasets.length === 0) return

    const maxValue = Math.max(...data.datasets.flatMap(d => d.data))
    const barWidth = width / (data.labels.length * data.datasets.length + data.labels.length - 1)
    const groupWidth = barWidth * data.datasets.length + barWidth * (data.datasets.length - 1)

    // Draw axes
    ctx.strokeStyle = config.borderColor
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, padding + height)
    ctx.lineTo(padding + width, padding + height)
    ctx.stroke()

    // Draw grid lines
    if (config.showGrid) {
      ctx.strokeStyle = '#e0e0e0'
      ctx.lineWidth = 1
      for (let i = 0; i <= 5; i++) {
        const y = padding + (height * i) / 5
        ctx.beginPath()
        ctx.moveTo(padding, y)
        ctx.lineTo(padding + width, y)
        ctx.stroke()
      }
    }

    // Draw bars
    data.labels.forEach((label, labelIndex) => {
      data.datasets.forEach((dataset, datasetIndex) => {
        const value = dataset.data[labelIndex] || 0
        const barHeight = (value / maxValue) * height
        const x = padding + labelIndex * groupWidth + datasetIndex * barWidth
        const y = padding + height - barHeight

        ctx.fillStyle = dataset.backgroundColor || defaultColors[datasetIndex % defaultColors.length]
        ctx.fillRect(x, y, barWidth, barHeight)

        // Draw value on top of bar
        ctx.fillStyle = '#333333'
        ctx.font = '12px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(value.toString(), x + barWidth / 2, y - 5)
      })

      // Draw label
      ctx.fillStyle = '#666666'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.save()
      ctx.translate(padding + labelIndex * groupWidth + groupWidth / 2, padding + height + 20)
      ctx.rotate(-Math.PI / 6)
      ctx.fillText(label, 0, 0)
      ctx.restore()
    })
  }

  const drawPieChart = (ctx: CanvasRenderingContext2D, data: ChartData, padding: number, width: number, height: number) => {
    if (data.datasets.length === 0) return

    const centerX = padding + width / 2
    const centerY = padding + height / 2
    const radius = Math.min(width, height) / 3

    const dataset = data.datasets[0]
    const total = dataset.data.reduce((sum, value) => sum + value, 0)

    let currentAngle = -Math.PI / 2

    dataset.data.forEach((value, index) => {
      const sliceAngle = (value / total) * 2 * Math.PI

      ctx.fillStyle = dataset.backgroundColor || defaultColors[index % defaultColors.length]
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
      ctx.closePath()
      ctx.fill()

      // Draw label
      const labelAngle = currentAngle + sliceAngle / 2
      const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7)
      const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7)

      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 12px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(`${Math.round((value / total) * 100)}%`, labelX, labelY)

      currentAngle += sliceAngle
    })
  }

  const drawLineChart = (ctx: CanvasRenderingContext2D, data: ChartData, padding: number, width: number, height: number) => {
    if (data.datasets.length === 0) return

    const maxValue = Math.max(...data.datasets.flatMap(d => d.data))
    const xStep = width / (data.labels.length - 1)

    // Draw axes
    ctx.strokeStyle = config.borderColor
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, padding + height)
    ctx.lineTo(padding + width, padding + height)
    ctx.stroke()

    // Draw grid lines
    if (config.showGrid) {
      ctx.strokeStyle = '#e0e0e0'
      ctx.lineWidth = 1
      for (let i = 0; i <= 5; i++) {
        const y = padding + (height * i) / 5
        ctx.beginPath()
        ctx.moveTo(padding, y)
        ctx.lineTo(padding + width, y)
        ctx.stroke()
      }
    }

    // Draw lines
    data.datasets.forEach((dataset, datasetIndex) => {
      ctx.strokeStyle = dataset.borderColor || defaultColors[datasetIndex % defaultColors.length]
      ctx.lineWidth = 2
      ctx.beginPath()

      dataset.data.forEach((value, index) => {
        const x = padding + index * xStep
        const y = padding + height - (value / maxValue) * height

        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }

        // Draw point
        ctx.fillStyle = dataset.backgroundColor || defaultColors[datasetIndex % defaultColors.length]
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, 2 * Math.PI)
        ctx.fill()
      })

      ctx.stroke()
    })

    // Draw labels
    data.labels.forEach((label, index) => {
      const x = padding + index * xStep
      ctx.fillStyle = '#666666'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.save()
      ctx.translate(x, padding + height + 20)
      ctx.rotate(-Math.PI / 6)
      ctx.fillText(label, 0, 0)
      ctx.restore()
    })
  }

  const drawDoughnutChart = (ctx: CanvasRenderingContext2D, data: ChartData, padding: number, width: number, height: number) => {
    if (data.datasets.length === 0) return

    const centerX = padding + width / 2
    const centerY = padding + height / 2
    const outerRadius = Math.min(width, height) / 3
    const innerRadius = outerRadius * 0.6

    const dataset = data.datasets[0]
    const total = dataset.data.reduce((sum, value) => sum + value, 0)

    let currentAngle = -Math.PI / 2

    dataset.data.forEach((value, index) => {
      const sliceAngle = (value / total) * 2 * Math.PI

      ctx.fillStyle = dataset.backgroundColor || defaultColors[index % defaultColors.length]
      ctx.beginPath()
      ctx.arc(centerX, centerY, outerRadius, currentAngle, currentAngle + sliceAngle)
      ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true)
      ctx.closePath()
      ctx.fill()

      currentAngle += sliceAngle
    })
  }

  const drawLegend = (ctx: CanvasRenderingContext2D, data: ChartData, canvasWidth: number, canvasHeight: number) => {
    const legendX = canvasWidth - 150
    const legendY = canvasHeight - 100

    data.datasets.forEach((dataset, index) => {
      const y = legendY + index * 20

      // Color box
      ctx.fillStyle = dataset.backgroundColor || defaultColors[index % defaultColors.length]
      ctx.fillRect(legendX, y, 15, 15)

      // Label
      ctx.fillStyle = '#333333'
      ctx.font = '12px Arial'
      ctx.textAlign = 'left'
      ctx.fillText(dataset.label, legendX + 20, y + 12)
    })
  }

  const handleImportCSV = () => {
    if (!csvData.trim()) return

    try {
      const parsedData = parseCSV(csvData)
      setChartData(parsedData)
    } catch (error) {
      alert('Error parsing CSV: ' + (error as Error).message)
    }
  }

  const downloadChart = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `${config.title.replace(/\\s+/g, '_')}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  const loadExample = () => {
    const exampleCSV = `Month,Product A,Product B,Product C
January,120,90,150
February,135,110,165
March,125,95,140
April,140,120,155
May,155,130,170
June,160,125,180`

    setCsvData(exampleCSV)
    const parsedData = parseCSV(exampleCSV)
    setChartData(parsedData)
    setConfig(prev => ({ ...prev, title: 'Monthly Sales Data' }))
  }

  useEffect(() => {
    if (chartData) {
      drawChart()
    }
  }, [chartData, config])

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Chart Creator
          </CardTitle>
          <CardDescription>
            Create beautiful charts from CSV data. Supports bar, pie, line, and doughnut charts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="data" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="data">Data Input</TabsTrigger>
              <TabsTrigger value="settings">Chart Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="data" className="space-y-4">
              <div>
                <Label htmlFor="csv-input">CSV Data</Label>
                <Textarea
                  id="csv-input"
                  placeholder="Paste your CSV data here (first column should contain labels/series names)..."
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                  className="min-h-32 font-mono text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleImportCSV} disabled={!csvData.trim()} className="flex-1">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Data
                </Button>
                <Button onClick={loadExample} variant="outline">
                  Load Example
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="chart-type">Chart Type</Label>
                  <Select value={config.type} onValueChange={(value: any) => setConfig(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bar">Bar Chart</SelectItem>
                      <SelectItem value="pie">Pie Chart</SelectItem>
                      <SelectItem value="line">Line Chart</SelectItem>
                      <SelectItem value="doughnut">Doughnut Chart</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="chart-title">Chart Title</Label>
                  <Input
                    id="chart-title"
                    value={config.title}
                    onChange={(e) => setConfig(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="chart-width">Width (px)</Label>
                  <Input
                    id="chart-width"
                    type="number"
                    value={config.width}
                    onChange={(e) => setConfig(prev => ({ ...prev, width: parseInt(e.target.value) || 800 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="chart-height">Height (px)</Label>
                  <Input
                    id="chart-height"
                    type="number"
                    value={config.height}
                    onChange={(e) => setConfig(prev => ({ ...prev, height: parseInt(e.target.value) || 600 }))}
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="show-legend"
                    checked={config.showLegend}
                    onChange={(e) => setConfig(prev => ({ ...prev, showLegend: e.target.checked }))}
                  />
                  <Label htmlFor="show-legend">Show Legend</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="show-grid"
                    checked={config.showGrid}
                    onChange={(e) => setConfig(prev => ({ ...prev, showGrid: e.target.checked }))}
                  />
                  <Label htmlFor="show-grid">Show Grid</Label>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {chartData && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Chart Preview</h3>
                <Button onClick={downloadChart} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download PNG
                </Button>
              </div>
              
              <div className="border rounded-lg p-4 bg-white overflow-auto">
                <canvas ref={canvasRef} className="mx-auto" />
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{chartData.labels.length}</div>
                  <div className="text-sm text-muted-foreground">Labels</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{chartData.datasets.length}</div>
                  <div className="text-sm text-muted-foreground">Datasets</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{config.type.toUpperCase()}</div>
                  <div className="text-sm text-muted-foreground">Chart Type</div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">About Chart Creator</h3>
            <p className="text-sm text-muted-foreground">
              This tool creates interactive charts from CSV data. The first column should contain labels or series names, 
              and subsequent columns contain data values. Charts are rendered as high-quality PNG images that can be 
              downloaded and used in presentations, reports, or websites.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}