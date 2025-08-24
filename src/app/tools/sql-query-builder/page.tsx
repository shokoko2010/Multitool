'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { 
  Database, 
  Plus, 
  Trash2, 
  Copy, 
  Play, 
  Table,
  Columns,
  Filter,
  SortAsc,
  Hash,
  FileText,
  Settings
} from 'lucide-react'

interface TableColumn {
  name: string
  type: string
  selected: boolean
  alias?: string
}

interface TableJoin {
  type: 'INNER' | 'LEFT' | 'RIGHT' | 'FULL'
  table: string
  on: string
}

interface WhereCondition {
  column: string
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'LIKE' | 'IN' | 'NOT IN' | 'IS NULL' | 'IS NOT NULL'
  value: string
  logical: 'AND' | 'OR'
}

interface OrderByClause {
  column: string
  direction: 'ASC' | 'DESC'
}

interface SQLQuery {
  select: TableColumn[]
  from: string
  joins: TableJoin[]
  where: WhereCondition[]
  groupBy: string[]
  having: WhereCondition[]
  orderBy: OrderByClause[]
  limit: number
  offset: number
}

interface DatabaseSchema {
  tables: Array<{
    name: string
    columns: Array<{
      name: string
      type: string
      isPrimary: boolean
      isForeign: boolean
      references?: string
    }>
  }>
}

const sampleSchema: DatabaseSchema = {
  tables: [
    {
      name: 'users',
      columns: [
        { name: 'id', type: 'INT', isPrimary: true, isForeign: false },
        { name: 'name', type: 'VARCHAR(255)', isPrimary: false, isForeign: false },
        { name: 'email', type: 'VARCHAR(255)', isPrimary: false, isForeign: false },
        { name: 'created_at', type: 'TIMESTAMP', isPrimary: false, isForeign: false },
        { name: 'updated_at', type: 'TIMESTAMP', isPrimary: false, isForeign: false }
      ]
    },
    {
      name: 'orders',
      columns: [
        { name: 'id', type: 'INT', isPrimary: true, isForeign: false },
        { name: 'user_id', type: 'INT', isPrimary: false, isForeign: true, references: 'users.id' },
        { name: 'total', type: 'DECIMAL(10,2)', isPrimary: false, isForeign: false },
        { name: 'status', type: 'VARCHAR(50)', isPrimary: false, isForeign: false },
        { name: 'created_at', type: 'TIMESTAMP', isPrimary: false, isForeign: false }
      ]
    },
    {
      name: 'products',
      columns: [
        { name: 'id', type: 'INT', isPrimary: true, isForeign: false },
        { name: 'name', type: 'VARCHAR(255)', isPrimary: false, isForeign: false },
        { name: 'price', type: 'DECIMAL(10,2)', isPrimary: false, isForeign: false },
        { name: 'category', type: 'VARCHAR(100)', isPrimary: false, isForeign: false },
        { name: 'stock', type: 'INT', isPrimary: false, isForeign: false }
      ]
    },
    {
      name: 'order_items',
      columns: [
        { name: 'id', type: 'INT', isPrimary: true, isForeign: false },
        { name: 'order_id', type: 'INT', isPrimary: false, isForeign: true, references: 'orders.id' },
        { name: 'product_id', type: 'INT', isPrimary: false, isForeign: true, references: 'products.id' },
        { name: 'quantity', type: 'INT', isPrimary: false, isForeign: false },
        { name: 'price', type: 'DECIMAL(10,2)', isPrimary: false, isForeign: false }
      ]
    }
  ]
}

export default function SQLQueryBuilder() {
  const [query, setQuery] = useState<SQLQuery>({
    select: [],
    from: '',
    joins: [],
    where: [],
    groupBy: [],
    having: [],
    orderBy: [],
    limit: 0,
    offset: 0
  })

  const [schema] = useState<DatabaseSchema>(sampleSchema)
  const [generatedSQL, setGeneratedSQL] = useState<string>('')
  const [selectedTable, setSelectedTable] = useState<string>('')
  const [queryHistory, setQueryHistory] = useState<string[]>([])

  const generateSQL = () => {
    if (!query.from) return

    let sql = 'SELECT\n'

    // SELECT clause
    if (query.select.length === 0) {
      sql += '  *\n'
    } else {
      const selectedColumns = query.select
        .filter(col => col.selected)
        .map(col => col.alias ? `${col.name} AS ${col.alias}` : col.name)
        .join(',\n  ')
      sql += `  ${selectedColumns}\n`
    }

    // FROM clause
    sql += `FROM\n  ${query.from}\n`

    // JOIN clauses
    query.joins.forEach(join => {
      sql += `${join.type} JOIN ${join.table} ON ${join.on}\n`
    })

    // WHERE clause
    if (query.where.length > 0) {
      sql += 'WHERE\n'
      query.where.forEach((condition, index) => {
        if (index > 0) {
          sql += `  ${condition.logical} `
        } else {
          sql += '  '
        }
        
        if (condition.operator === 'IS NULL' || condition.operator === 'IS NOT NULL') {
          sql += `${condition.column} ${condition.operator}\n`
        } else if (condition.operator === 'IN' || condition.operator === 'NOT IN') {
          sql += `${condition.column} ${condition.operator} (${condition.value})\n`
        } else {
          sql += `${condition.column} ${condition.operator} '${condition.value}'\n`
        }
      })
    }

    // GROUP BY clause
    if (query.groupBy.length > 0) {
      sql += `GROUP BY\n  ${query.groupBy.join(', ')}\n`
    }

    // HAVING clause
    if (query.having.length > 0) {
      sql += 'HAVING\n'
      query.having.forEach((condition, index) => {
        if (index > 0) {
          sql += `  ${condition.logical} `
        } else {
          sql += '  '
        }
        sql += `${condition.column} ${condition.operator} '${condition.value}'\n`
      })
    }

    // ORDER BY clause
    if (query.orderBy.length > 0) {
      sql += `ORDER BY\n  ${query.orderBy.map(ob => `${ob.column} ${ob.direction}`).join(', ')}\n`
    }

    // LIMIT and OFFSET
    if (query.limit > 0) {
      sql += `LIMIT ${query.limit}\n`
    }
    if (query.offset > 0) {
      sql += `OFFSET ${query.offset}\n`
    }

    setGeneratedSQL(sql)
    setQueryHistory(prev => [sql, ...prev.slice(0, 9)]) // Keep last 10 queries
  }

  const addTable = (tableName: string) => {
    if (!query.from) {
      setQuery(prev => ({ ...prev, from: tableName }))
      setSelectedTable(tableName)
      
      // Auto-select all columns from the table
      const table = schema.tables.find(t => t.name === tableName)
      if (table) {
        const columns = table.columns.map(col => ({
          name: `${tableName}.${col.name}`,
          type: col.type,
          selected: true
        }))
        setQuery(prev => ({ ...prev, select: columns }))
      }
    }
  }

  const addJoin = () => {
    const newJoin: TableJoin = {
      type: 'INNER',
      table: '',
      on: ''
    }
    setQuery(prev => ({ ...prev, joins: [...prev.joins, newJoin] }))
  }

  const updateJoin = (index: number, field: keyof TableJoin, value: string) => {
    setQuery(prev => ({
      ...prev,
      joins: prev.joins.map((join, i) => 
        i === index ? { ...join, [field]: value } : join
      )
    }))
  }

  const removeJoin = (index: number) => {
    setQuery(prev => ({
      ...prev,
      joins: prev.joins.filter((_, i) => i !== index)
    }))
  }

  const addWhereCondition = () => {
    const newCondition: WhereCondition = {
      column: '',
      operator: '=',
      value: '',
      logical: 'AND'
    }
    setQuery(prev => ({ ...prev, where: [...prev.where, newCondition] }))
  }

  const updateWhereCondition = (index: number, field: keyof WhereCondition, value: string) => {
    setQuery(prev => ({
      ...prev,
      where: prev.where.map((condition, i) => 
        i === index ? { ...condition, [field]: value } : condition
      )
    }))
  }

  const removeWhereCondition = (index: number) => {
    setQuery(prev => ({
      ...prev,
      where: prev.where.filter((_, i) => i !== index)
    }))
  }

  const addOrderBy = () => {
    const newOrderBy: OrderByClause = {
      column: '',
      direction: 'ASC'
    }
    setQuery(prev => ({ ...prev, orderBy: [...prev.orderBy, newOrderBy] }))
  }

  const updateOrderBy = (index: number, field: keyof OrderByClause, value: string) => {
    setQuery(prev => ({
      ...prev,
      orderBy: prev.orderBy.map((ob, i) => 
        i === index ? { ...ob, [field]: value } : ob
      )
    }))
  }

  const removeOrderBy = (index: number) => {
    setQuery(prev => ({
      ...prev,
      orderBy: prev.orderBy.filter((_, i) => i !== index)
    }))
  }

  const toggleColumn = (columnName: string) => {
    setQuery(prev => ({
      ...prev,
      select: prev.select.map(col => 
        col.name === columnName ? { ...col, selected: !col.selected } : col
      )
    }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const loadExample = () => {
    const exampleQuery: SQLQuery = {
      select: [
        { name: 'users.name', type: 'VARCHAR(255)', selected: true },
        { name: 'users.email', type: 'VARCHAR(255)', selected: true },
        { name: 'COUNT(orders.id)', type: 'INT', selected: true, alias: 'order_count' },
        { name: 'SUM(orders.total)', type: 'DECIMAL(10,2)', selected: true, alias: 'total_spent' }
      ],
      from: 'users',
      joins: [
        { type: 'LEFT', table: 'orders', on: 'users.id = orders.user_id' }
      ],
      where: [
        { column: 'users.created_at', operator: '>=', value: '2024-01-01', logical: 'AND' },
        { column: 'orders.status', operator: '=', value: 'completed', logical: 'AND' }
      ],
      groupBy: ['users.id', 'users.name', 'users.email'],
      having: [
        { column: 'COUNT(orders.id)', operator: '>', value: '0', logical: 'AND' }
      ],
      orderBy: [
        { column: 'total_spent', direction: 'DESC' }
      ],
      limit: 10,
      offset: 0
    }
    
    setQuery(exampleQuery)
    setSelectedTable('users')
  }

  const getTableColumns = (tableName: string) => {
    const table = schema.tables.find(t => t.name === tableName)
    return table ? table.columns : []
  }

  useEffect(() => {
    generateSQL()
  }, [query])

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">SQL Query Builder</h1>
        <p className="text-muted-foreground">
          Build SQL queries visually with an intuitive interface
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Schema
            </CardTitle>
            <CardDescription>
              Available tables and columns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {schema.tables.map((table) => (
                <div key={table.name} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <button
                      onClick={() => addTable(table.name)}
                      className={`text-left flex-1 ${selectedTable === table.name ? 'text-primary' : ''}`}
                    >
                      <div className="font-medium">{table.name}</div>
                    </button>
                    {query.from === table.name && (
                      <Badge variant="default">Selected</Badge>
                    )}
                  </div>
                  <div className="space-y-1">
                    {table.columns.slice(0, 3).map((column) => (
                      <div key={column.name} className="text-xs text-muted-foreground flex items-center gap-1">
                        {column.isPrimary && <Hash className="h-3 w-3 text-yellow-500" />}
                        {column.isForeign && <FileText className="h-3 w-3 text-blue-500" />}
                        {column.name}
                      </div>
                    ))}
                    {table.columns.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{table.columns.length - 3} more columns
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Query Builder</CardTitle>
            <CardDescription>
              Build your SQL query step by step
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="select" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="select">SELECT</TabsTrigger>
                <TabsTrigger value="from">FROM</TabsTrigger>
                <TabsTrigger value="joins">JOINS</TabsTrigger>
                <TabsTrigger value="where">WHERE</TabsTrigger>
                <TabsTrigger value="orderby">ORDER BY</TabsTrigger>
                <TabsTrigger value="options">OPTIONS</TabsTrigger>
              </TabsList>

              <TabsContent value="select" className="space-y-4">
                <div>
                  <Label>Selected Columns</Label>
                  <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                    {query.select.map((column) => (
                      <div key={column.name} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={column.selected}
                            onChange={() => toggleColumn(column.name)}
                            className="rounded"
                          />
                          <span className="text-sm font-mono">{column.name}</span>
                          <Badge variant="outline" className="text-xs">{column.type}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="from" className="space-y-4">
                <div>
                  <Label>From Table</Label>
                  <div className="mt-2">
                    <Select value={query.from} onValueChange={(value) => addTable(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select table" />
                      </SelectTrigger>
                      <SelectContent>
                        {schema.tables.map((table) => (
                          <SelectItem key={table.name} value={table.name}>
                            {table.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="joins" className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Table Joins</Label>
                  <Button onClick={addJoin} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Join
                  </Button>
                </div>
                <div className="space-y-3">
                  {query.joins.map((join, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="grid gap-3 md:grid-cols-3">
                        <div>
                          <Label className="text-xs">Join Type</Label>
                          <Select value={join.type} onValueChange={(value) => updateJoin(index, 'type', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="INNER">INNER JOIN</SelectItem>
                              <SelectItem value="LEFT">LEFT JOIN</SelectItem>
                              <SelectItem value="RIGHT">RIGHT JOIN</SelectItem>
                              <SelectItem value="FULL">FULL JOIN</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Table</Label>
                          <Select value={join.table} onValueChange={(value) => updateJoin(index, 'table', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select table" />
                            </SelectTrigger>
                            <SelectContent>
                              {schema.tables.map((table) => (
                                <SelectItem key={table.name} value={table.name}>
                                  {table.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-end">
                          <Button
                            onClick={() => removeJoin(index)}
                            variant="outline"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-3">
                        <Label className="text-xs">ON Condition</Label>
                        <Input
                          value={join.on}
                          onChange={(e) => updateJoin(index, 'on', e.target.value)}
                          placeholder="table.column = other_table.column"
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="where" className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>WHERE Conditions</Label>
                  <Button onClick={addWhereCondition} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Condition
                  </Button>
                </div>
                <div className="space-y-3">
                  {query.where.map((condition, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="grid gap-3 md:grid-cols-4">
                        {index > 0 && (
                          <div>
                            <Label className="text-xs">Logical</Label>
                            <Select value={condition.logical} onValueChange={(value) => updateWhereCondition(index, 'logical', value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="AND">AND</SelectItem>
                                <SelectItem value="OR">OR</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        <div className={index > 0 ? 'col-span-2' : 'col-span-3'}>
                          <Label className="text-xs">Column</Label>
                          <Input
                            value={condition.column}
                            onChange={(e) => updateWhereCondition(index, 'column', e.target.value)}
                            placeholder="column_name"
                            className="font-mono text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Operator</Label>
                          <Select value={condition.operator} onValueChange={(value) => updateWhereCondition(index, 'operator', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="=">=</SelectItem>
                              <SelectItem value="!=">=</SelectItem>
                              <SelectItem value=">">{'>'}</SelectItem>
                              <SelectItem value="<">{'<'}</SelectItem>
                              <SelectItem value=">=">{'>='}</SelectItem>
                              <SelectItem value="<=">{'<='}</SelectItem>
                              <SelectItem value="LIKE">LIKE</SelectItem>
                              <SelectItem value="IN">IN</SelectItem>
                              <SelectItem value="NOT IN">NOT IN</SelectItem>
                              <SelectItem value="IS NULL">IS NULL</SelectItem>
                              <SelectItem value="IS NOT NULL">IS NOT NULL</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {condition.operator !== 'IS NULL' && condition.operator !== 'IS NOT NULL' && (
                          <div>
                            <Label className="text-xs">Value</Label>
                            <Input
                              value={condition.value}
                              onChange={(e) => updateWhereCondition(index, 'value', e.target.value)}
                              placeholder="value"
                            />
                          </div>
                        )}
                        <div className="flex items-end">
                          <Button
                            onClick={() => removeWhereCondition(index)}
                            variant="outline"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="orderby" className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>ORDER BY</Label>
                  <Button onClick={addOrderBy} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Column
                  </Button>
                </div>
                <div className="space-y-3">
                  {query.orderBy.map((orderBy, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="grid gap-3 md:grid-cols-3">
                        <div>
                          <Label className="text-xs">Column</Label>
                          <Input
                            value={orderBy.column}
                            onChange={(e) => updateOrderBy(index, 'column', e.target.value)}
                            placeholder="column_name"
                            className="font-mono text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Direction</Label>
                          <Select value={orderBy.direction} onValueChange={(value) => updateOrderBy(index, 'direction', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ASC">ASC</SelectItem>
                              <SelectItem value="DESC">DESC</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-end">
                          <Button
                            onClick={() => removeOrderBy(index)}
                            variant="outline"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="options" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="limit">LIMIT</Label>
                    <Input
                      id="limit"
                      type="number"
                      value={query.limit}
                      onChange={(e) => setQuery(prev => ({ ...prev, limit: parseInt(e.target.value) || 0 }))}
                      placeholder="0 (no limit)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="offset">OFFSET</Label>
                    <Input
                      id="offset"
                      type="number"
                      value={query.offset}
                      onChange={(e) => setQuery(prev => ({ ...prev, offset: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Generated SQL
            </CardTitle>
            <CardDescription>
              Your SQL query generated from the builder
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={loadExample} variant="outline" size="sm">
                  Load Example
                </Button>
                <Button onClick={() => copyToClipboard(generatedSQL)} variant="outline" size="sm">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy SQL
                </Button>
              </div>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                <code className="text-sm font-mono">{generatedSQL}</code>
              </pre>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Query History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {queryHistory.length > 0 ? (
                queryHistory.map((sql, index) => (
                  <div key={index} className="p-2 border rounded cursor-pointer hover:bg-muted/50" onClick={() => copyToClipboard(sql)}>
                    <pre className="text-xs font-mono truncate">{sql}</pre>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No query history yet. Generate some SQL queries to see them here.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>SQL Builder Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">Getting Started</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Select a table from the schema to start building</li>
                <li> Columns are automatically selected for the main table</li>
                <li> Add joins to combine data from multiple tables</li>
                <li> Use WHERE conditions to filter your results</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Best Practices</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Use specific column names instead of SELECT *</li>
                <li>• Add indexes to columns used in WHERE and JOIN conditions</li>
                <li>• Use LIMIT for large result sets</li>
                <li>• Test your queries with EXPLAIN to optimize performance</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}