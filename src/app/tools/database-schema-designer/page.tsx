'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Database, 
  Plus, 
  Trash2, 
  Edit, 
  Copy, 
  Download,
  Upload,
  Table,
  Columns,
  Hash,
  FileText,
  Settings,
  Save,
  RefreshCw
} from 'lucide-react'

interface DatabaseColumn {
  id: string
  name: string
  type: string
  length?: number
  precision?: number
  scale?: number
  nullable: boolean
  unique: boolean
  primaryKey: boolean
  foreignKey: {
    referencesTable: string
    referencesColumn: string
    onDelete: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION'
    onUpdate: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION'
  } | null
  defaultValue: string
  comment: string
}

interface DatabaseTable {
  id: string
  name: string
  columns: DatabaseColumn[]
  comment: string
  position: { x: number; y: number }
}

interface DatabaseRelationship {
  id: string
  fromTable: string
  fromColumn: string
  toTable: string
  toColumn: string
  type: '1:1' | '1:N' | 'N:M' | 'N:1'
}

interface DatabaseSchema {
  name: string
  description: string
  tables: DatabaseTable[]
  relationships: DatabaseRelationship[]
}

const dataTypes = [
  'INT', 'BIGINT', 'SMALLINT', 'TINYINT',
  'VARCHAR', 'CHAR', 'TEXT',
  'DECIMAL', 'NUMERIC', 'FLOAT', 'DOUBLE',
  'BOOLEAN', 'BOOL',
  'DATE', 'TIME', 'DATETIME', 'TIMESTAMP',
  'JSON', 'UUID', 'BLOB'
]

const sampleSchema: DatabaseSchema = {
  name: 'E-Commerce Database',
  description: 'Database schema for an e-commerce platform',
  tables: [
    {
      id: '1',
      name: 'users',
      columns: [
        {
          id: '1-1',
          name: 'id',
          type: 'BIGINT',
          nullable: false,
          unique: true,
          primaryKey: true,
          foreignKey: null,
          defaultValue: 'AUTO_INCREMENT',
          comment: 'Primary key for users table'
        },
        {
          id: '1-2',
          name: 'email',
          type: 'VARCHAR',
          length: 255,
          nullable: false,
          unique: true,
          primaryKey: false,
          foreignKey: null,
          defaultValue: '',
          comment: 'User email address (unique)'
        },
        {
          id: '1-3',
          name: 'password_hash',
          type: 'VARCHAR',
          length: 255,
          nullable: false,
          unique: false,
          primaryKey: false,
          foreignKey: null,
          defaultValue: '',
          comment: 'Hashed password'
        },
        {
          id: '1-4',
          name: 'created_at',
          type: 'TIMESTAMP',
          nullable: false,
          unique: false,
          primaryKey: false,
          foreignKey: null,
          defaultValue: 'CURRENT_TIMESTAMP',
          comment: 'Account creation timestamp'
        }
      ],
      comment: 'User accounts and authentication',
      position: { x: 100, y: 100 }
    },
    {
      id: '2',
      name: 'products',
      columns: [
        {
          id: '2-1',
          name: 'id',
          type: 'BIGINT',
          nullable: false,
          unique: true,
          primaryKey: true,
          foreignKey: null,
          defaultValue: 'AUTO_INCREMENT',
          comment: 'Primary key for products'
        },
        {
          id: '2-2',
          name: 'name',
          type: 'VARCHAR',
          length: 255,
          nullable: false,
          unique: false,
          primaryKey: false,
          foreignKey: null,
          defaultValue: '',
          comment: 'Product name'
        },
        {
          id: '2-3',
          name: 'price',
          type: 'DECIMAL',
          precision: 10,
          scale: 2,
          nullable: false,
          unique: false,
          primaryKey: false,
          foreignKey: null,
          defaultValue: '0.00',
          comment: 'Product price'
        },
        {
          id: '2-4',
          name: 'stock_quantity',
          type: 'INT',
          nullable: false,
          unique: false,
          primaryKey: false,
          foreignKey: null,
          defaultValue: '0',
          comment: 'Available stock quantity'
        }
      ],
      comment: 'Product catalog',
      position: { x: 400, y: 100 }
    },
    {
      id: '3',
      name: 'orders',
      columns: [
        {
          id: '3-1',
          name: 'id',
          type: 'BIGINT',
          nullable: false,
          unique: true,
          primaryKey: true,
          foreignKey: null,
          defaultValue: 'AUTO_INCREMENT',
          comment: 'Primary key for orders'
        },
        {
          id: '3-2',
          name: 'user_id',
          type: 'BIGINT',
          nullable: false,
          unique: false,
          primaryKey: false,
          foreignKey: {
            referencesTable: 'users',
            referencesColumn: 'id',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
          },
          defaultValue: '',
          comment: 'Foreign key to users table'
        },
        {
          id: '3-3',
          name: 'total_amount',
          type: 'DECIMAL',
          precision: 10,
          scale: 2,
          nullable: false,
          unique: false,
          primaryKey: false,
          foreignKey: null,
          defaultValue: '0.00',
          comment: 'Total order amount'
        },
        {
          id: '3-4',
          name: 'status',
          type: 'VARCHAR',
          length: 50,
          nullable: false,
          unique: false,
          primaryKey: false,
          foreignKey: null,
          defaultValue: 'pending',
          comment: 'Order status'
        }
      ],
      comment: 'Customer orders',
      position: { x: 250, y: 300 }
    }
  ],
  relationships: [
    {
      id: 'r1',
      fromTable: 'orders',
      fromColumn: 'user_id',
      toTable: 'users',
      toColumn: 'id',
      type: 'N:1'
    }
  ]
}

export default function DatabaseSchemaDesigner() {
  const [schema, setSchema] = useState<DatabaseSchema>(sampleSchema)
  const [selectedTable, setSelectedTable] = useState<DatabaseTable | null>(null)
  const [selectedColumn, setSelectedColumn] = useState<DatabaseColumn | null>(null)
  const [isEditingTable, setIsEditingTable] = useState<boolean>(false)
  const [isEditingColumn, setIsEditingColumn] = useState<boolean>(false)
  const [canvasRef] = useRef<HTMLCanvasElement>(null)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [draggedTable, setDraggedTable] = useState<string | null>(null)

  const addTable = () => {
    const newTable: DatabaseTable = {
      id: Math.random().toString(36).substring(7),
      name: 'new_table',
      columns: [
        {
          id: `${Math.random().toString(36).substring(7)}-1`,
          name: 'id',
          type: 'BIGINT',
          nullable: false,
          unique: true,
          primaryKey: true,
          foreignKey: null,
          defaultValue: 'AUTO_INCREMENT',
          comment: 'Primary key'
        }
      ],
      comment: 'New table description',
      position: { x: 100, y: 100 }
    }
    setSchema(prev => ({
      ...prev,
      tables: [...prev.tables, newTable]
    }))
    setSelectedTable(newTable)
  }

  const deleteTable = (tableId: string) => {
    setSchema(prev => ({
      ...prev,
      tables: prev.tables.filter(table => table.id !== tableId),
      relationships: prev.relationships.filter(rel => 
        rel.fromTable !== tableId && rel.toTable !== tableId
      )
    }))
    if (selectedTable?.id === tableId) {
      setSelectedTable(null)
    }
  }

  const addColumn = (tableId: string) => {
    const table = schema.tables.find(t => t.id === tableId)
    if (!table) return

    const newColumn: DatabaseColumn = {
      id: `${tableId}-${Math.random().toString(36).substring(7)}`,
      name: 'new_column',
      type: 'VARCHAR',
      length: 255,
      nullable: true,
      unique: false,
      primaryKey: false,
      foreignKey: null,
      defaultValue: '',
      comment: 'New column'
    }

    setSchema(prev => ({
      ...prev,
      tables: prev.tables.map(table =>
        table.id === tableId
          ? { ...table, columns: [...table.columns, newColumn] }
          : table
      )
    }))
    setSelectedColumn(newColumn)
  }

  const deleteColumn = (tableId: string, columnId: string) => {
    setSchema(prev => ({
      ...prev,
      tables: prev.tables.map(table =>
        table.id === tableId
          ? { ...table, columns: table.columns.filter(col => col.id !== columnId) }
          : table
      )
    }))
    if (selectedColumn?.id === columnId) {
      setSelectedColumn(null)
    }
  }

  const updateTable = (tableId: string, updates: Partial<DatabaseTable>) => {
    setSchema(prev => ({
      ...prev,
      tables: prev.tables.map(table =>
        table.id === tableId ? { ...table, ...updates } : table
      )
    }))
    if (selectedTable?.id === tableId) {
      setSelectedTable({ ...selectedTable, ...updates })
    }
  }

  const updateColumn = (tableId: string, columnId: string, updates: Partial<DatabaseColumn>) => {
    setSchema(prev => ({
      ...prev,
      tables: prev.tables.map(table =>
        table.id === tableId
          ? {
              ...table,
              columns: table.columns.map(column =>
                column.id === columnId ? { ...column, ...updates } : column
              )
            }
          : table
      )
    }))
    if (selectedColumn?.id === columnId) {
      setSelectedColumn({ ...selectedColumn, ...updates })
    }
  }

  const generateSQL = () => {
    let sql = `-- Database Schema: ${schema.name}\n`
    sql += `-- ${schema.description}\n\n`

    schema.tables.forEach(table => {
      sql += `CREATE TABLE ${table.name} (\n`
      
      const columns = table.columns.map(column => {
        let columnDef = `  ${column.name} ${column.type}`
        
        if (column.length) {
          columnDef += `(${column.length})`
        } else if (column.precision && column.scale) {
          columnDef += `(${column.precision}, ${column.scale})`
        }
        
        if (!column.nullable) columnDef += ' NOT NULL'
        if (column.unique) columnDef += ' UNIQUE'
        if (column.primaryKey) columnDef += ' PRIMARY KEY'
        if (column.defaultValue && column.defaultValue !== 'AUTO_INCREMENT') {
          columnDef += ` DEFAULT '${column.defaultValue}'`
        }
        
        return columnDef
      })
      
      sql += columns.join(',\n')
      sql += '\n);\n\n'
      
      // Add foreign key constraints
      table.columns.forEach(column => {
        if (column.foreignKey) {
          sql += `ALTER TABLE ${table.name} ADD CONSTRAINT fk_${table.name}_${column.name}\n`
          sql += `  FOREIGN KEY (${column.name}) REFERENCES ${column.foreignKey.referencesTable}(${column.foreignKey.referencesColumn})\n`
          sql += `  ON DELETE ${column.foreignKey.onDelete} ON UPDATE ${column.foreignKey.onUpdate};\n\n`
        }
      })
    })

    return sql
  }

  const exportSchema = () => {
    const data = {
      schema,
      exportTime: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `database_schema_${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const importSchema = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          if (data.schema) {
            setSchema(data.schema)
          }
        } catch (error) {
          console.error('Failed to import schema:', error)
        }
      }
      reader.readAsText(file)
    }
  }

  const drawSchema = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw relationships
    ctx.strokeStyle = '#6B7280'
    ctx.lineWidth = 2
    schema.relationships.forEach(rel => {
      const fromTable = schema.tables.find(t => t.name === rel.fromTable)
      const toTable = schema.tables.find(t => t.name === rel.toTable)
      
      if (fromTable && toTable) {
        ctx.beginPath()
        ctx.moveTo(fromTable.position.x + 120, fromTable.position.y + 40)
        ctx.lineTo(toTable.position.x + 120, toTable.position.y + 40)
        ctx.stroke()
      }
    })

    // Draw tables
    schema.tables.forEach(table => {
      // Table background
      ctx.fillStyle = '#F9FAFB'
      ctx.strokeStyle = '#E5E7EB'
      ctx.lineWidth = 2
      ctx.fillRect(table.position.x, table.position.y, 240, 80)
      ctx.strokeRect(table.position.x, table.position.y, 240, 80)

      // Table name
      ctx.fillStyle = '#1F2937'
      ctx.font = 'bold 14px Arial'
      ctx.fillText(table.name, table.position.x + 10, table.position.y + 20)

      // Column count
      ctx.fillStyle = '#6B7280'
      ctx.font = '12px Arial'
      ctx.fillText(`${table.columns.length} columns`, table.position.x + 10, table.position.y + 40)

      // Primary key indicator
      const pkColumn = table.columns.find(col => col.primaryKey)
      if (pkColumn) {
        ctx.fillStyle = '#FCD34D'
        ctx.fillText('🔑', table.position.x + 200, table.position.y + 20)
      }

      // Foreign key indicator
      const fkColumn = table.columns.find(col => col.foreignKey)
      if (fkColumn) {
        ctx.fillStyle = '#60A5FA'
        ctx.fillText('🔗', table.position.x + 220, table.position.y + 20)
      }
    })
  }

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Check if clicking on a table
    const clickedTable = schema.tables.find(table => 
      x >= table.position.x && x <= table.position.x + 240 &&
      y >= table.position.y && y <= table.position.y + 80
    )

    if (clickedTable) {
      setIsDragging(true)
      setDraggedTable(clickedTable.id)
      setSelectedTable(clickedTable)
    }
  }

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !draggedTable) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    updateTable(draggedTable, {
      position: { x: x - 120, y: y - 40 }
    })

    drawSchema()
  }

  const handleCanvasMouseUp = () => {
    setIsDragging(false)
    setDraggedTable(null)
  }

  useEffect(() => {
    drawSchema()
  }, [schema])

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Database Schema Designer</h1>
        <p className="text-muted-foreground">
          Design and visualize database schemas with an intuitive interface
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Schema Controls
            </CardTitle>
            <CardDescription>
              Manage your database schema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="schemaName">Schema Name</Label>
              <Input
                id="schemaName"
                value={schema.name}
                onChange={(e) => setSchema(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Database schema name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="schemaDescription">Description</Label>
              <Textarea
                id="schemaDescription"
                value={schema.description}
                onChange={(e) => setSchema(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Schema description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Tables ({schema.tables.length})</Label>
                <Button onClick={addTable} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Table
                </Button>
              </div>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {schema.tables.map((table) => (
                  <div
                    key={table.id}
                    className={`p-2 border rounded cursor-pointer hover:bg-muted/50 ${
                      selectedTable?.id === table.id ? 'bg-muted border-primary' : ''
                    }`}
                    onClick={() => setSelectedTable(table)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{table.name}</span>
                      <div className="flex gap-1">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteTable(table.id)
                          }}
                          variant="ghost"
                          size="sm"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {table.columns.length} columns
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={exportSchema} variant="outline" size="sm" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <label className="flex-1">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </span>
                </Button>
                <input
                  type="file"
                  accept=".json"
                  onChange={importSchema}
                  className="hidden"
                />
              </label>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Schema Designer</CardTitle>
            <CardDescription>
              Drag tables to arrange them, click to edit details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border rounded-lg overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={600}
                  className="w-full cursor-move bg-white"
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseUp}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedTable && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Table: {selectedTable.name}</CardTitle>
                <CardDescription>{selectedTable.comment}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setIsEditingTable(true)}
                  variant="outline"
                  size="sm"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Table
                </Button>
                <Button
                  onClick={() => addColumn(selectedTable.id)}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Column
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Nullable</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Unique</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Primary Key</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Foreign Key</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Default</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTable.columns.map((column) => (
                      <tr key={column.id} className="hover:bg-muted/50">
                        <td className="border border-gray-300 px-4 py-2">
                          <div className="flex items-center gap-2">
                            {column.primaryKey && <Hash className="h-4 w-4 text-yellow-500" />}
                            {column.foreignKey && <FileText className="h-4 w-4 text-blue-500" />}
                            {column.name}
                          </div>
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {column.type}
                          {column.length && `(${column.length})`}
                          {column.precision && `(${column.precision}, ${column.scale})`}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {column.nullable ? 'Yes' : 'No'}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {column.unique ? 'Yes' : 'No'}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {column.primaryKey ? 'Yes' : 'No'}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {column.foreignKey ? (
                            <div className="text-sm">
                              <div>{column.foreignKey.referencesTable}.{column.foreignKey.referencesColumn}</div>
                              <div className="text-xs text-muted-foreground">
                                ON DELETE {column.foreignKey.onDelete}
                              </div>
                            </div>
                          ) : 'No'}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {column.defaultValue || '-'}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <div className="flex gap-1">
                            <Button
                              onClick={() => {
                                setSelectedColumn(column)
                                setIsEditingColumn(true)
                              }}
                              variant="ghost"
                              size="sm"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              onClick={() => deleteColumn(selectedTable.id, column.id)}
                              variant="ghost"
                              size="sm"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="sql" className="w-full mt-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sql">Generated SQL</TabsTrigger>
          <TabsTrigger value="relationships">Relationships</TabsTrigger>
        </TabsList>

        <TabsContent value="sql" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SQL Schema Definition</CardTitle>
              <CardDescription>
                SQL CREATE TABLE statements for your schema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Button onClick={() => copyToClipboard(generateSQL())} variant="outline" size="sm">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy SQL
                </Button>
                <Button onClick={() => {
                  const blob = new Blob([generateSQL()], { type: 'text/sql' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `schema_${schema.name.replace(/\s+/g, '_')}.sql`
                  document.body.appendChild(a)
                  a.click()
                  document.body.removeChild(a)
                  URL.revokeObjectURL(url)
                }} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download SQL
                </Button>
              </div>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                <code className="text-sm font-mono">{generateSQL()}</code>
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relationships" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Table Relationships</CardTitle>
              <CardDescription>
                Foreign key relationships between tables
              </CardDescription>
            </CardHeader>
            <CardContent>
              {schema.relationships.length > 0 ? (
                <div className="space-y-3">
                  {schema.relationships.map((rel) => (
                    <div key={rel.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">
                            {rel.fromTable}.{rel.fromColumn} → {rel.toTable}.{rel.toColumn}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Type: {rel.type}
                          </div>
                        </div>
                        <Badge variant="outline">{rel.type}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No relationships defined yet. Add foreign keys to create relationships.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Table Dialog */}
      <Dialog open={isEditingTable} onOpenChange={setIsEditingTable}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Table</DialogTitle>
            <DialogDescription>
              Modify table properties
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tableName">Table Name</Label>
              <Input
                id="tableName"
                value={selectedTable?.name || ''}
                onChange={(e) => selectedTable && updateTable(selectedTable.id, { name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="tableComment">Comment</Label>
              <Textarea
                id="tableComment"
                value={selectedTable?.comment || ''}
                onChange={(e) => selectedTable && updateTable(selectedTable.id, { comment: e.target.value })}
                rows={3}
              />
            </div>
            <Button onClick={() => setIsEditingTable(false)}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Column Dialog */}
      <Dialog open={isEditingColumn} onOpenChange={setIsEditingColumn}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Column</DialogTitle>
            <DialogDescription>
              Modify column properties
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="columnName">Column Name</Label>
              <Input
                id="columnName"
                value={selectedColumn?.name || ''}
                onChange={(e) => selectedColumn && selectedTable && updateColumn(selectedTable.id, selectedColumn.id, { name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="columnType">Data Type</Label>
              <Select
                value={selectedColumn?.type || ''}
                onValueChange={(value) => selectedColumn && selectedTable && updateColumn(selectedTable.id, selectedColumn.id, { type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dataTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="columnNullable">Nullable</Label>
                <input
                  type="checkbox"
                  id="columnNullable"
                  checked={selectedColumn?.nullable || false}
                  onChange={(e) => selectedColumn && selectedTable && updateColumn(selectedTable.id, selectedColumn.id, { nullable: e.target.checked })}
                />
              </div>
              <div>
                <Label htmlFor="columnUnique">Unique</Label>
                <input
                  type="checkbox"
                  id="columnUnique"
                  checked={selectedColumn?.unique || false}
                  onChange={(e) => selectedColumn && selectedTable && updateColumn(selectedTable.id, selectedColumn.id, { unique: e.target.checked })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="columnDefault">Default Value</Label>
              <Input
                id="columnDefault"
                value={selectedColumn?.defaultValue || ''}
                onChange={(e) => selectedColumn && selectedTable && updateColumn(selectedTable.id, selectedColumn.id, { defaultValue: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="columnComment">Comment</Label>
              <Textarea
                id="columnComment"
                value={selectedColumn?.comment || ''}
                onChange={(e) => selectedColumn && selectedTable && updateColumn(selectedTable.id, selectedColumn.id, { comment: e.target.value })}
                rows={2}
              />
            </div>
            <Button onClick={() => setIsEditingColumn(false)}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
}