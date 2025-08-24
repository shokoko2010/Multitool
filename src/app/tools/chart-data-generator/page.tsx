'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { BarChart3, Download, FileText, Plus, Trash2, Copy, Palette } from 'lucide-react'

interface ChartDataPoint {
  label: string
  value: number
  color?: string
}

interface ChartSeries {
  name: string
  data: ChartDataPoint[]
  color?: string
}

interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'area' | 'scatter'
  title: string
  width: number
  height: number
  theme: 'light' | 'dark'
  showLegend: boolean
  showGrid: boolean
  showValues: boolean
}

const defaultColors = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
]

export default function ChartDataGenerator() {
  const [csvInput, setCsvInput] = useState('')
  const [chartConfig, setChartConfig] = useState<ChartConfig>({
    type: 'bar',
    title: 'My Chart',
    width: 800,
    height: 400,
    theme: 'light',
    showLegend: true,
    showGrid: true,
    showValues: true
  })
  const [series, setSeries] = useState<ChartSeries[]>([])
  const [labels, setLabels] = useState<string[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const parseCSV = (csv: string): { labels: string[], series: ChartSeries[] } => {
    const lines = csv.trim().split('\n')
    if (lines.length < 2) return { labels: [], series: [] }

    // Parse headers (first column is labels, rest are series)
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    const labelHeaders = headers.slice(1)

    // Parse data
    const parsedLabels: string[] = []
    const seriesData: ChartSeries[] = labelHeaders.map((name, index) => ({
      name,
      data: [],
      color: defaultColors[index % defaultColors.length]
    }))

    lines.slice(1).forEach(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
      if (values.length > 0) {
        parsedLabels.push(values[0])
        
        values.slice(1).forEach((value, index) => {
          const numValue = parseFloat(value) || 0
          if (seriesData[index]) {
            seriesData[index].data.push({
              label: values[0],
              value: numValue,
              color: seriesData[index].color
            })
          }
        })
      }
    })

    return { labels: parsedLabels, series: seriesData }
  }

  const handleImportCSV = () => {
    if (!csvInput.trim()) return
    
    const { labels: parsedLabels, series: parsedSeries } = parseCSV(csvInput)
    setLabels(parsedLabels)
    setSeries(parsedSeries)
  }

  const addSeries = () => {
    const newSeries: ChartSeries = {
      name: `Series ${series.length + 1}`,
      data: labels.map(label => ({
        label,
        value: 0,
        color: defaultColors[series.length % defaultColors.length]
      })),
      color: defaultColors[series.length % defaultColors.length]
    }
    setSeries([...series, newSeries])
  }

  const removeSeries = (index: number) => {
    setSeries(series.filter((_, i) => i !== index))
  }

  const updateSeriesName = (index: number, name: string) => {
    const newSeries = [...series]
    newSeries[index].name = name
    setSeries(newSeries)
  }

  const updateSeriesColor = (index: number, color: string) => {
    const newSeries = [...series]
    newSeries[index].color = color
    newSeries[index].data = newSeries[index].data.map(point => ({
      ...point,
      color
    }))
    setSeries(newSeries)
  }

  const updateDataPoint = (seriesIndex: number, pointIndex: number, value: number) => {
    const newSeries = [...series]
    newSeries[seriesIndex].data[pointIndex].value = value
    setSeries(newSeries)
  }

  const addLabel = () => {
    const newLabel = `Item ${labels.length + 1}`
    setLabels([...labels, newLabel])
    
    // Add data point to each series
    const newSeries = series.map(s => ({
      ...s,
      data: [...s.data, {
        label: newLabel,
        value: 0,
        color: s.color
      }]
    }))
    setSeries(newSeries)
  }

  const removeLabel = (index: number) => {
    const newLabels = labels.filter((_, i) => i !== index)
    setLabels(newLabels)
    
    // Remove data point from each series
    const newSeries = series.map(s => ({
      ...s,
      data: s.data.filter((_, i) => i !== index)
    }))
    setSeries(newSeries)
  }

  const generateChartJS = (): string => {
    if (series.length === 0 || labels.length === 0) return ''

    const datasets = series.map((s, index) => `{
      label: '${s.name}',
      data: ${JSON.stringify(s.data.map(d => d.value))},
      backgroundColor: '${s.color}${chartConfig.type === 'line' ? '20' : '80'}',
      borderColor: '${s.color}',
      borderWidth: ${chartConfig.type === 'line' ? '2' : '1'},
      fill: ${chartConfig.type === 'area' ? 'true' : 'false'}
    }`).join(',\n      ')

    return `// Chart.js Configuration
const ctx = document.getElementById('myChart').getContext('2d');
const myChart = new Chart(ctx, {
    type: '${chartConfig.type}',
    data: {
        labels: ${JSON.stringify(labels)},
        datasets: [
            ${datasets}
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: '${chartConfig.title}'
            },
            legend: {
                display: ${chartConfig.showLegend}
            }
        },
        scales: ${chartConfig.type === 'pie' || chartConfig.type === 'doughnut' ? '{}' : `{
            y: {
                beginAtZero: true,
                grid: {
                    display: ${chartConfig.showGrid}
                }
            },
            x: {
                grid: {
                    display: ${chartConfig.showGrid}
                }
            }
        }`},
        elements: {
            point: {
                radius: ${chartConfig.showValues ? '4' : '0'}
            }
        }
    }
});`
  }

  const generateCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = chartConfig.width
    canvas.height = chartConfig.height

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set background
    ctx.fillStyle = chartConfig.theme === 'dark' ? '#1f2937' : '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw title
    ctx.fillStyle = chartConfig.theme === 'dark' ? '#ffffff' : '#000000'
    ctx.font = 'bold 20px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(chartConfig.title, canvas.width / 2, 30)

    // Simple chart drawing (bar chart example)
    if (chartConfig.type === 'bar' && series.length > 0 && labels.length > 0) {
      const chartArea = {
        x: 60,
        y: 60,
        width: canvas.width - 120,
        height: canvas.height - 120
      }

      const barWidth = chartArea.width / (labels.length * series.length + labels.length)
      const maxValue = Math.max(...series.flatMap(s => s.data.map(d => d.value)))

      // Draw grid
      if (chartConfig.showGrid) {
        ctx.strokeStyle = chartConfig.theme === 'dark' ? '#374151' : '#e5e7eb'
        ctx.lineWidth = 1
        
        for (let i = 0; i <= 5; i++) {
          const y = chartArea.y + (chartArea.height / 5) * i
          ctx.beginPath()
          ctx.moveTo(chartArea.x, y)
          ctx.lineTo(chartArea.x + chartArea.width, y)
          ctx.stroke()
        }
      }

      // Draw bars
      series.forEach((serie, seriesIndex) => {
        serie.data.forEach((point, pointIndex) => {
          const barHeight = (point.value / maxValue) * chartArea.height
          const x = chartArea.x + (pointIndex * (series.length + 1) + seriesIndex) * barWidth
          const y = chartArea.y + chartArea.height - barHeight

          ctx.fillStyle = serie.color || defaultColors[seriesIndex % defaultColors.length]
          ctx.fillRect(x, y, barWidth, barHeight)

          // Draw value
          if (chartConfig.showValues) {
            ctx.fillStyle = chartConfig.theme === 'dark' ? '#ffffff' : '#000000'
            ctx.font = '12px Arial'
            ctx.textAlign = 'center'
            ctx.fillText(point.value.toString(), x + barWidth / 2, y - 5)
          }
        })
      })

      // Draw labels
      ctx.fillStyle = chartConfig.theme === 'dark' ? '#ffffff' : '#000000'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      labels.forEach((label, index) => {
        const x = chartArea.x + (index * (series.length + 1) + series.length / 2) * barWidth
        ctx.fillText(label, x, chartArea.y + chartArea.height + 20)
      })
    }
  }

  const copyChartJS = () => {
    const code = generateChartJS()
    navigator.clipboard.writeText(code)
  }

  const downloadChartJS = () => {
    const code = generateChartJS()
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${chartConfig.title}</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <div style="width: ${chartConfig.width}px; height: ${chartConfig.height}px; margin: 20px auto;">
        <canvas id="myChart"></canvas>
    </div>
    <script>
        ${code}
    </script>
</body>
</html>`
    
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${chartConfig.title.toLowerCase().replace(/\s+/g, '-')}-chart.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `${chartConfig.title.toLowerCase().replace(/\s+/g, '-')}-chart.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  const loadExample = () => {
    setCsvInput(`Month,Sales,Expenses,Profit
January,45000,32000,13000
February,52000,35000,17000
March,48000,33000,15000
April,55000,34000,21000
May,62000,38000,24000
June,58000,36000,22000`)
  }

  // Generate canvas when data changes
  useState(() => {
    if (series.length > 0 && labels.length > 0) {
      setTimeout(generateCanvas, 100)
    }
  })

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Chart Data Generator
          </CardTitle>
          <CardDescription>
            Create interactive charts from CSV data or build charts manually with customizable styling.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="import" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="import">Import CSV</TabsTrigger>
              <TabsTrigger value="manual">Manual Builder</TabsTrigger>
            </TabsList>

            <TabsContent value="import" className="space-y-4">
              <div>
                <Label htmlFor="csv-input">CSV Data</Label>
                <Textarea
                  id="csv-input"
                  placeholder="Paste your CSV data here (first column should contain labels, subsequent columns contain data series)..."
                  value={csvInput}
                  onChange={(e) => setCsvInput(e.target.value)}
                  className="min-h-32 font-mono text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleImportCSV} disabled={!csvInput.trim()}>
                  Import CSV
                </Button>
                <Button onClick={loadExample} variant="outline">
                  Load Example
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="manual" className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={addSeries} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Series
                </Button>
                <Button onClick={addLabel} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Label
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {series.length > 0 && labels.length > 0 && (
            <div className="space-y-6">
              {/* Chart Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Chart Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="chart-type">Chart Type</Label>
                      <Select value={chartConfig.type} onValueChange={(value: ChartConfig['type']) => 
                        setChartConfig({...chartConfig, type: value})
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bar">Bar Chart</SelectItem>
                          <SelectItem value="line">Line Chart</SelectItem>
                          <SelectItem value="pie">Pie Chart</SelectItem>
                          <SelectItem value="doughnut">Doughnut Chart</SelectItem>
                          <SelectItem value="area">Area Chart</SelectItem>
                          <SelectItem value="scatter">Scatter Plot</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="chart-title">Chart Title</Label>
                      <Input
                        id="chart-title"
                        value={chartConfig.title}
                        onChange={(e) => setChartConfig({...chartConfig, title: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="chart-theme">Theme</Label>
                      <Select value={chartConfig.theme} onValueChange={(value: ChartConfig['theme']) => 
                        setChartConfig({...chartConfig, theme: value})
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="chart-width">Width: {chartConfig.width}px</Label>
                      <Slider
                        value={[chartConfig.width]}
                        onValueChange={(value) => setChartConfig({...chartConfig, width: value[0]})}
                        max={1200}
                        min={400}
                        step={50}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="chart-height">Height: {chartConfig.height}px</Label>
                      <Slider
                        value={[chartConfig.height]}
                        onValueChange={(value) => setChartConfig({...chartConfig, height: value[0]})}
                        max={800}
                        min={300}
                        step={50}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="show-legend"
                          checked={chartConfig.showLegend}
                          onChange={(e) => setChartConfig({...chartConfig, showLegend: e.target.checked})}
                        />
                        <Label htmlFor="show-legend">Show Legend</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="show-grid"
                          checked={chartConfig.showGrid}
                          onChange={(e) => setChartConfig({...chartConfig, showGrid: e.target.checked})}
                        />
                        <Label htmlFor="show-grid">Show Grid</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="show-values"
                          checked={chartConfig.showValues}
                          onChange={(e) => setChartConfig({...chartConfig, showValues: e.target.checked})}
                        />
                        <Label htmlFor="show-values">Show Values</Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Series Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Data Series</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {series.map((serie, seriesIndex) => (
                      <div key={seriesIndex} className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Input
                            value={serie.name}
                            onChange={(e) => updateSeriesName(seriesIndex, e.target.value)}
                            className="flex-1"
                            placeholder="Series name"
                          />
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-6 h-6 rounded border"
                              style={{ backgroundColor: serie.color }}
                            />
                            <Input
                              type="color"
                              value={serie.color}
                              onChange={(e) => updateSeriesColor(seriesIndex, e.target.value)}
                              className="w-12 h-8 p-0 border-0"
                            />
                          </div>
                          <Button 
                            onClick={() => removeSeries(seriesIndex)} 
                            variant="outline" 
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                          {serie.data.map((point, pointIndex) => (
                            <div key={pointIndex} className="space-y-1">
                              <Label className="text-xs">{labels[pointIndex]}</Label>
                              <Input
                                type="number"
                                value={point.value}
                                onChange={(e) => updateDataPoint(seriesIndex, pointIndex, Number(e.target.value))}
                                className="text-sm"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Chart Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Chart Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-4 bg-white">
                    <canvas 
                      ref={canvasRef} 
                      className="mx-auto border"
                      style={{ maxWidth: '100%', height: 'auto' }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Export Options */}
              <div className="flex flex-wrap gap-2">
                <Button onClick={generateCanvas} variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Render Canvas
                </Button>
                <Button onClick={copyChartJS} variant="outline">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Chart.js Code
                </Button>
                <Button onClick={downloadChartJS}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Chart.js HTML
                </Button>
                <Button onClick={downloadCanvas} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download PNG
                </Button>
              </div>
            </div>
          )}

          {/* Code Preview */}
          {series.length > 0 && labels.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Chart.js Code
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm font-mono whitespace-pre-wrap">
                    {generateChartJS()}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}