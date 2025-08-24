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
import { Table, Download, FileText, Plus, Trash2, Copy } from 'lucide-react'

interface TableColumn {
  name: string
  type: 'text' | 'number' | 'date' | 'boolean'
  width?: string
}

interface TableRow {
  [key: string]: string | number | boolean
}

export default function DataTableGenerator() {
  const [csvInput, setCsvInput] = useState('')
  const [columns, setColumns] = useState<TableColumn[]>([])
  const [rows, setRows] = useState<TableRow[]>([])
  const [tableName, setTableName] = useState('My Table')
  const [tableStyle, setTableStyle] = useState('default')
  const tableRef = useRef<HTMLDivElement>(null)

  const parseCSV = (csv: string): { columns: TableColumn[], rows: TableRow[] } => {
    const lines = csv.trim().split('\n')
    if (lines.length < 2) return { columns: [], rows: [] }

    // Parse headers
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    
    // Parse rows
    const dataRows = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
      const row: TableRow = {}
      
      headers.forEach((header, index) => {
        const value = values[index] || ''
        
        // Auto-detect type
        if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
          row[header] = value.toLowerCase() === 'true'
        } else if (!isNaN(Number(value)) && value !== '') {
          row[header] = Number(value)
        } else if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
          row[header] = value // Keep as string for date formatting
        } else {
          row[header] = value
        }
      })
      
      return row
    })

    // Create column definitions
    const columnDefs: TableColumn[] = headers.map(header => {
      const sampleValue = dataRows[0]?.[header]
      let type: TableColumn['type'] = 'text'
      
      if (typeof sampleValue === 'boolean') type = 'boolean'
      else if (typeof sampleValue === 'number') type = 'number'
      else if (typeof sampleValue === 'string' && sampleValue.match(/^\d{4}-\d{2}-\d{2}$/)) type = 'date'
      
      return { name: header, type }
    })

    return { columns: columnDefs, rows: dataRows }
  }

  const handleImportCSV = () => {
    if (!csvInput.trim()) return
    
    const { columns: parsedColumns, rows: parsedRows } = parseCSV(csvInput)
    setColumns(parsedColumns)
    setRows(parsedRows)
  }

  const addColumn = () => {
    const newColumn: TableColumn = {
      name: `Column ${columns.length + 1}`,
      type: 'text'
    }
    setColumns([...columns, newColumn])
    
    // Add empty value to all rows
    setRows(rows.map(row => ({ ...row, [newColumn.name]: '' })))
  }

  const removeColumn = (index: number) => {
    const columnName = columns[index].name
    const newColumns = columns.filter((_, i) => i !== index)
    const newRows = rows.map(row => {
      const newRow = { ...row }
      delete newRow[columnName]
      return newRow
    })
    
    setColumns(newColumns)
    setRows(newRows)
  }

  const addRow = () => {
    const newRow: TableRow = {}
    columns.forEach(col => {
      newRow[col.name] = col.type === 'boolean' ? false : ''
    })
    setRows([...rows, newRow])
  }

  const removeRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index))
  }

  const updateCell = (rowIndex: number, columnName: string, value: string) => {
    const newRows = [...rows]
    const column = columns.find(col => col.name === columnName)
    
    if (column) {
      if (column.type === 'boolean') {
        newRows[rowIndex][columnName] = value.toLowerCase() === 'true'
      } else if (column.type === 'number') {
        newRows[rowIndex][columnName] = Number(value) || 0
      } else {
        newRows[rowIndex][columnName] = value
      }
    }
    
    setRows(newRows)
  }

  const generateHTML = (): string => {
    if (columns.length === 0) return ''

    const styleClasses = {
      default: '',
      striped: 'table-striped',
      bordered: 'table-bordered',
      hover: 'table-hover',
      compact: 'table-sm'
    }

    let html = `<div class="table-responsive">\n`
    html += `  <table class="table ${styleClasses[tableStyle as keyof typeof styleClasses]}">\n`
    
    // Table header
    html += `    <thead>\n      <tr>\n`
    columns.forEach(col => {
      html += `        <th>${col.name}</th>\n`
    })
    html += `      </tr>\n    </thead>\n`
    
    // Table body
    html += `    <tbody>\n`
    rows.forEach((row, rowIndex) => {
      html += `      <tr>\n`
      columns.forEach(col => {
        const value = row[col.name]
        let displayValue = value
        
        if (col.type === 'boolean') {
          displayValue = value ? '✓' : '✗'
        } else if (col.type === 'number') {
          displayValue = Number(value).toLocaleString()
        }
        
        html += `        <td>${displayValue}</td>\n`
      })
      html += `      </tr>\n`
    })
    html += `    </tbody>\n  </table>\n</div>`

    return html
  }

  const copyHTML = () => {
    const html = generateHTML()
    navigator.clipboard.writeText(html)
  }

  const downloadHTML = () => {
    const html = generateHTML()
    const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${tableName}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .table-responsive { overflow-x: auto; }
        .table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; }
        .table th, .table td { padding: 0.75rem; border: 1px solid #dee2e6; text-align: left; }
        .table th { background-color: #f8f9fa; font-weight: bold; }
        .table-striped tbody tr:nth-of-type(odd) { background-color: rgba(0,0,0,.05); }
        .table-bordered th, .table-bordered td { border: 1px solid #dee2e6; }
        .table-hover tbody tr:hover { background-color: rgba(0,0,0,.075); }
        .table-sm th, .table-sm td { padding: 0.3rem; }
    </style>
</head>
<body>
    <h1>${tableName}</h1>
    ${html}
</body>
</html>`
    
    const blob = new Blob([fullHTML], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${tableName.toLowerCase().replace(/\s+/g, '-')}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  const loadExample = () => {
    setCsvInput(`Name,Age,City,Active,JoinDate
John Doe,28,New York,true,2023-01-15
Jane Smith,34,Los Angeles,false,2022-03-20
Mike Johnson,45,Chicago,true,2021-07-10
Sarah Wilson,29,Houston,true,2023-02-28
David Brown,38,Phoenix,false,2020-11-15`)
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Table className="h-6 w-6" />
            Data Table Generator
          </CardTitle>
          <CardDescription>
            Create responsive HTML tables from CSV data or build tables manually with custom styling options.
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
                  placeholder="Paste your CSV data here (first row should contain headers)..."
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
                <Button onClick={addColumn} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Column
                </Button>
                <Button onClick={addRow} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Row
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {columns.length > 0 && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div>
                  <Label htmlFor="table-name">Table Name</Label>
                  <Input
                    id="table-name"
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                    className="w-48"
                  />
                </div>
                <div>
                  <Label htmlFor="table-style">Table Style</Label>
                  <Select value={tableStyle} onValueChange={setTableStyle}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="striped">Striped</SelectItem>
                      <SelectItem value="bordered">Bordered</SelectItem>
                      <SelectItem value="hover">Hover</SelectItem>
                      <SelectItem value="compact">Compact</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Column Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Columns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {columns.map((column, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 border rounded">
                        <Input
                          value={column.name}
                          onChange={(e) => {
                            const newColumns = [...columns]
                            const oldName = column.name
                            const newName = e.target.value
                            newColumns[index].name = newName
                            
                            // Update all rows
                            const newRows = rows.map(row => {
                              const newRow = { ...row }
                              newRow[newName] = newRow[oldName]
                              delete newRow[oldName]
                              return newRow
                            })
                            
                            setColumns(newColumns)
                            setRows(newRows)
                          }}
                          className="flex-1"
                        />
                        <Select 
                          value={column.type} 
                          onValueChange={(value: TableColumn['type']) => {
                            const newColumns = [...columns]
                            newColumns[index].type = value
                            setColumns(newColumns)
                          }}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="date">Date</SelectItem>
                            <SelectItem value="boolean">Boolean</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          onClick={() => removeColumn(index)} 
                          variant="outline" 
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Data Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Data Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          {columns.map((column, index) => (
                            <th key={index} className="border border-gray-300 px-4 py-2 text-left font-medium">
                              {column.name}
                            </th>
                          ))}
                          <th className="border border-gray-300 px-4 py-2 text-left font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row, rowIndex) => (
                          <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            {columns.map((column, colIndex) => (
                              <td key={colIndex} className="border border-gray-300 px-4 py-2">
                                <Input
                                  value={String(row[column.name] || '')}
                                  onChange={(e) => updateCell(rowIndex, column.name, e.target.value)}
                                  className="w-full border-0 p-0 h-auto"
                                />
                              </td>
                            ))}
                            <td className="border border-gray-300 px-4 py-2">
                              <Button 
                                onClick={() => removeRow(rowIndex)} 
                                variant="outline" 
                                size="sm"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Export Options */}
              <div className="flex gap-2">
                <Button onClick={copyHTML} variant="outline">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy HTML
                </Button>
                <Button onClick={downloadHTML}>
                  <Download className="h-4 w-4 mr-2" />
                  Download HTML
                </Button>
              </div>
            </div>
          )}

          {/* HTML Preview */}
          {columns.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  HTML Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm font-mono whitespace-pre-wrap">
                    {generateHTML()}
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