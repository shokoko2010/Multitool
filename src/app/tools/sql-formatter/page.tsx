'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Copy, Download, Upload, Database, CheckCircle, AlertCircle } from 'lucide-react'

export default function SQLFormatter() {
  const [sqlInput, setSqlInput] = useState('')
  const [formattedSql, setFormattedSql] = useState('')
  const [error, setError] = useState('')
  const [isValid, setIsValid] = useState(false)
  const [indentSize, setIndentSize] = useState(2)
  const [uppercaseKeywords, setUppercaseKeywords] = useState(true)
  const [commaFirst, setCommaFirst] = useState(false)

  const formatSql = () => {
    try {
      const formatted = formatSqlString(sqlInput, indentSize, uppercaseKeywords, commaFirst)
      setFormattedSql(formatted)
      setError('')
      setIsValid(true)
    } catch (err) {
      setError('SQL formatting error: ' + (err as Error).message)
      setIsValid(false)
      setFormattedSql('')
    }
  }

  const formatSqlString = (sql: string, indent: number, uppercase: boolean, commaFirstStyle: boolean): string => {
    if (!sql.trim()) return ''

    let formatted = sql.trim()
    const indentStr = ' '.repeat(indent)
    
    // Basic SQL formatting rules
    const keywords = [
      'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN', 'IS', 'NULL',
      'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE', 'ALTER',
      'DROP', 'INDEX', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'JOIN', 'INNER', 'LEFT',
      'RIGHT', 'FULL', 'OUTER', 'ON', 'GROUP', 'BY', 'HAVING', 'ORDER', 'ASC', 'DESC',
      'LIMIT', 'OFFSET', 'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'CASE', 'WHEN',
      'THEN', 'ELSE', 'END', 'UNION', 'ALL', 'EXISTS', 'ANY', 'SOME', 'BETWEEN'
    ]

    // Convert keywords to uppercase if requested
    if (uppercase) {
      keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'gi')
        formatted = formatted.replace(regex, keyword)
      })
    }

    // Basic formatting
    formatted = formatted.replace(/\s+/g, ' ') // Multiple spaces to single space
    formatted = formatted.replace(/\s*,\s*/g, commaFirstStyle ? '\n' + indentStr + ', ' : ', ') // Comma formatting
    formatted = formatted.replace(/\s*;\s*/g, ';\n') // Semicolon formatting

    // Add line breaks for major clauses
    const clauseBreaks = [
      /\b(SELECT|FROM|WHERE|GROUP BY|HAVING|ORDER BY|LIMIT|OFFSET)\b/gi,
      /\b(INSERT INTO|VALUES)\b/gi,
      /\b(UPDATE|SET)\b/gi,
      /\b(CREATE TABLE|ALTER TABLE|DROP TABLE)\b/gi,
      /\b(JOIN|INNER JOIN|LEFT JOIN|RIGHT JOIN|FULL JOIN)\b/gi,
      /\b(ON)\b/gi
    ]

    clauseBreaks.forEach(regex => {
      formatted = formatted.replace(regex, '\n$1')
    })

    // Add indentation
    const lines = formatted.split('\n')
    let indentLevel = 0
    const indentedLines = lines.map(line => {
      const trimmed = line.trim()
      
      // Decrease indent level for closing brackets
      if (trimmed.includes(')')) {
        indentLevel = Math.max(0, indentLevel - 1)
      }
      
      const indented = indentStr.repeat(indentLevel) + trimmed
      indentLevel += (trimmed.match(/\(/g) || []).length - (trimmed.match(/\)/g) || []).length
      
      return indented
    })

    formatted = indentedLines.join('\n')

    // Clean up extra whitespace
    formatted = formatted.replace(/\n\s*\n\s*\n/g, '\n\n') // Remove excessive empty lines
    formatted = formatted.replace(/^\s+|\s+$/gm, '') // Trim lines

    return formatted
  }

  const minifySql = () => {
    try {
      const minified = sqlInput
        .replace(/\s+/g, ' ') // Multiple spaces to single space
        .replace(/\s*,\s*/g, ',') // Remove spaces around commas
        .replace(/\s*;\s*/g, ';') // Remove spaces around semicolons
        .replace(/\s*\(\s*/g, '(') // Remove spaces before opening brackets
        .replace(/\s*\)\s*/g, ')') // Remove spaces after closing brackets
        .replace(/\s*=\s*/g, '=') // Remove spaces around equals
        .replace(/\s*>\s*/g, '>') // Remove spaces around >
        .replace(/\s*<\s*/g, '<') // Remove spaces around <
        .replace(/\s*>=\s*/g, '>=') // Remove spaces around >=
        .replace(/\s*<=\s*/g, '<=') // Remove spaces around <=
        .trim()
      
      setFormattedSql(minified)
      setError('')
      setIsValid(true)
    } catch (err) {
      setError('SQL minification error: ' + (err as Error).message)
      setIsValid(false)
      setFormattedSql('')
    }
  }

  const validateSql = () => {
    try {
      // Basic validation - check for balanced parentheses and quotes
      let parenCount = 0
      let singleQuote = false
      let doubleQuote = false
      
      for (let i = 0; i < sqlInput.length; i++) {
        const char = sqlInput[i]
        
        if (char === '(' && !singleQuote && !doubleQuote) {
          parenCount++
        } else if (char === ')' && !singleQuote && !doubleQuote) {
          parenCount--
          if (parenCount < 0) {
            throw new Error('Unmatched closing parenthesis')
          }
        } else if (char === "'" && !doubleQuote) {
          singleQuote = !singleQuote
        } else if (char === '"' && !singleQuote) {
          doubleQuote = !doubleQuote
        }
      }
      
      if (parenCount !== 0) {
        throw new Error('Unmatched parentheses')
      }
      
      if (singleQuote || doubleQuote) {
        throw new Error('Unmatched quotes')
      }
      
      setError('')
      setIsValid(true)
    } catch (err) {
      setError('SQL validation error: ' + (err as Error).message)
      setIsValid(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(formattedSql)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const downloadSql = () => {
    const blob = new Blob([formattedSql], { type: 'text/sql' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'formatted.sql'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const loadSample = () => {
    const sample = `SELECT u.id, u.name, u.email, COUNT(o.id) as order_count, SUM(o.total_amount) as total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at >= '2024-01-01' 
  AND u.status = 'active'
  AND (u.email LIKE '%@gmail.com' OR u.email LIKE '%@yahoo.com')
GROUP BY u.id, u.name, u.email
HAVING COUNT(o.id) > 0
  AND SUM(o.total_amount) > 100
ORDER BY total_spent DESC
LIMIT 10;`
    setSqlInput(sample)
    setError('')
    setIsValid(true)
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">SQL Formatter</h1>
        <p className="text-muted-foreground">
          Format, validate, and beautify SQL queries with customizable options
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Input SQL
            </CardTitle>
            <CardDescription>
              Paste your SQL query or load a sample to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadSample}>
                <Upload className="h-4 w-4 mr-2" />
                Load Sample
              </Button>
              <Button variant="outline" size="sm" onClick={validateSql}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Validate
              </Button>
            </div>
            
            <Textarea
              placeholder="Paste your SQL here..."
              value={sqlInput}
              onChange={(e) => setSqlInput(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
            />

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {isValid && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-md">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Valid SQL</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Formatting Options</CardTitle>
            <CardDescription>
              Customize how your SQL query will be formatted
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Indentation:</label>
                <select 
                  value={indentSize} 
                  onChange={(e) => setIndentSize(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                >
                  <option value={2}>2 spaces</option>
                  <option value={4}>4 spaces</option>
                  <option value={8}>8 spaces</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="uppercase"
                  checked={uppercaseKeywords}
                  onChange={(e) => setUppercaseKeywords(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="uppercase" className="text-sm font-medium">
                  Uppercase Keywords
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="comma-first"
                  checked={commaFirst}
                  onChange={(e) => setCommaFirst(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="comma-first" className="text-sm font-medium">
                  Comma First Style
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>
              Process your SQL query
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              <Button onClick={formatSql} disabled={!sqlInput.trim()}>
                Format SQL
              </Button>
              <Button onClick={minifySql} disabled={!sqlInput.trim()} variant="outline">
                Minify SQL
              </Button>
              <Button 
                onClick={copyToClipboard} 
                disabled={!formattedSql}
                variant="outline"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button 
                onClick={downloadSql} 
                disabled={!formattedSql}
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>

        {formattedSql && (
          <Card>
            <CardHeader>
              <CardTitle>Formatted SQL</CardTitle>
              <CardDescription>
                Your beautifully formatted SQL query
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="formatted" className="w-full">
                <TabsList>
                  <TabsTrigger value="formatted">Formatted</TabsTrigger>
                  <TabsTrigger value="raw">Raw</TabsTrigger>
                </TabsList>
                <TabsContent value="formatted" className="mt-4">
                  <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96 text-sm">
                    <code>{formattedSql}</code>
                  </pre>
                </TabsContent>
                <TabsContent value="raw" className="mt-4">
                  <Textarea
                    value={formattedSql}
                    readOnly
                    className="min-h-[200px] font-mono text-sm"
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>SQL Best Practices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Formatting Guidelines</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Use consistent indentation</li>
                  <li>• Capitalize SQL keywords</li>
                  <li>• Put each clause on a new line</li>
                  <li>• Use proper spacing around operators</li>
                  <li>• Comment complex queries</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Performance Tips</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Use appropriate indexes</li>
                  <li>• Avoid SELECT *</li>
                  <li>• LIMIT result sets</li>
                  <li>• Use JOINs efficiently</li>
                  <li>• Avoid subqueries when possible</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}