'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  GitBranch, 
  Layers, 
  Download, 
  Upload, 
  RefreshCw,
  Network,
  FileText,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

interface DependencyNode {
  id: string
  name: string
  version: string
  type: 'package' | 'module' | 'file' | 'class' | 'function'
  size: number
  color: string
  x: number
  y: number
  dependencies: string[]
  dependents: string[]
  issues: string[]
}

interface DependencyEdge {
  source: string
  target: string
  type: 'imports' | 'requires' | 'extends' | 'implements' | 'uses'
  strength: number
}

interface DependencyGraph {
  nodes: DependencyNode[]
  edges: DependencyEdge[]
  stats: {
    totalNodes: number
    totalEdges: number
    maxDepth: number
    circularDependencies: string[][]
    isolatedNodes: string[]
    criticalPath: string[]
  }
}

const sampleData = {
  packageJson: `{
  "name": "my-web-app",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^4.9.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "axios": "^1.4.0",
    "lodash": "^4.17.21",
    "moment": "^2.29.4",
    "styled-components": "^5.3.10"
  },
  "devDependencies": {
    "@types/node": "^18.0.0",
    "@types/lodash": "^4.14.0",
    "webpack": "^5.88.0",
    "jest": "^29.5.0",
    "eslint": "^8.42.0"
  }
}`,
  imports: `import React, { useState, useEffect } from 'react';
import axios from 'axios';
import lodash from 'lodash';
import moment from 'moment';
import styled from 'styled-components';

// Component with multiple dependencies
const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/user');
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const formatDate = (date) => {
    return moment(date).format('MMMM Do, YYYY');
  };

  const processUserData = lodash.memoize((data) => {
    return lodash.mapValues(data, (value, key) => {
      return lodash.isString(value) ? value.trim() : value;
    });
  });

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>No user data</div>;

  const processedUser = processUserData(user);

  return (
    <div>
      <h1>User Profile</h1>
      <p>Joined: {formatDate(user.createdAt)}</p>
      <pre>{JSON.stringify(processedUser, null, 2)}</pre>
    </div>
  );
};

export default UserProfile;`
}

export default function DependencyGraphVisualizer() {
  const [inputType, setInputType] = useState<'package' | 'imports' | 'custom'>('package')
  const [inputData, setInputData] = useState<string>(sampleData.packageJson)
  const [graph, setGraph] = useState<DependencyGraph | null>(null)
  const [selectedNode, setSelectedNode] = useState<DependencyNode | null>(null)
  const [layoutType, setLayoutType] = useState<'force' | 'hierarchical' | 'circular'>('force')
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false)
  
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const analyzeDependencies = async () => {
    setIsAnalyzing(true)
    
    try {
      // Simulate analysis delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const dependencyGraph = performDependencyAnalysis(inputData, inputType)
      setGraph(dependencyGraph)
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const performDependencyAnalysis = (data: string, type: string): DependencyGraph => {
    let nodes: DependencyNode[] = []
    let edges: DependencyEdge[] = []

    if (type === 'package') {
      // Analyze package.json dependencies
      try {
        const packageData = JSON.parse(data)
        
        // Add main package
        nodes.push({
          id: 'main',
          name: packageData.name || 'main',
          version: packageData.version || '1.0.0',
          type: 'package',
          size: 40,
          color: '#3B82F6',
          x: 0,
          y: 0,
          dependencies: [],
          dependents: [],
          issues: []
        })

        // Add dependencies
        if (packageData.dependencies) {
          Object.entries(packageData.dependencies).forEach(([name, version], index) => {
            const id = `dep-${index}`
            nodes.push({
              id,
              name,
              version: version as string,
              type: 'package',
              size: 30,
              color: '#10B981',
              x: 0,
              y: 0,
              dependencies: [],
              dependents: ['main'],
              issues: []
            })
            edges.push({
              source: 'main',
              target: id,
              type: 'requires',
              strength: 1
            })
          })
        }

        // Add dev dependencies
        if (packageData.devDependencies) {
          Object.entries(packageData.devDependencies).forEach(([name, version], index) => {
            const id = `dev-${index}`
            nodes.push({
              id,
              name,
              version: version as string,
              type: 'package',
              size: 25,
              color: '#F59E0B',
              x: 0,
              y: 0,
              dependencies: [],
              dependents: ['main'],
              issues: []
            })
            edges.push({
              source: 'main',
              target: id,
              type: 'requires',
              strength: 0.8
            })
          })
        }
      } catch (error) {
        // Handle invalid JSON
        nodes.push({
          id: 'error',
          name: 'Invalid JSON',
          version: '',
          type: 'package',
          size: 30,
          color: '#EF4444',
          x: 0,
          y: 0,
          dependencies: [],
          dependents: [],
          issues: ['Invalid package.json format']
        })
      }
    } else if (type === 'imports') {
      // Analyze import statements
      const importMatches = data.match(/import\s+.*?from\s+['"]([^'"]+)['"]/g) || []
      const requireMatches = data.match(/require\(['"]([^'"]+)['"]\)/g) || []
      
      // Add main file
      nodes.push({
        id: 'main',
        name: 'main.js',
        version: '',
        type: 'file',
        size: 40,
        color: '#3B82F6',
        x: 0,
        y: 0,
        dependencies: [],
        dependents: [],
        issues: []
      })

      // Process imports
      const allImports = [...importMatches, ...requireMatches]
      allImports.forEach((match, index) => {
        const importPath = match.match(/['"]([^'"]+)['"]/)?.[1] || ''
        if (importPath) {
          const id = `import-${index}`
          const isExternal = importPath.startsWith('.') ? false : true
          
          nodes.push({
            id,
            name: importPath.split('/').pop() || importPath,
            version: '',
            type: isExternal ? 'package' : 'module',
            size: isExternal ? 30 : 25,
            color: isExternal ? '#10B981' : '#8B5CF6',
            x: 0,
            y: 0,
            dependencies: [],
            dependents: ['main'],
            issues: []
          })
          
          edges.push({
            source: 'main',
            target: id,
            type: 'imports',
            strength: 1
          })
        }
      })
    }

    // Calculate positions based on layout type
    nodes = calculateLayout(nodes, edges, layoutType)

    // Calculate statistics
    const stats = {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      maxDepth: calculateMaxDepth(nodes, edges),
      circularDependencies: findCircularDependencies(nodes, edges),
      isolatedNodes: nodes.filter(node => node.dependencies.length === 0 && node.dependents.length === 0).map(n => n.id),
      criticalPath: findCriticalPath(nodes, edges)
    }

    return { nodes, edges, stats }
  }

  const calculateLayout = (nodes: DependencyNode[], edges: DependencyEdge[], layout: string): DependencyNode[] => {
    const positionedNodes = [...nodes]
    
    if (layout === 'force') {
      // Simple force-directed layout simulation
      const centerX = 400
      const centerY = 300
      const radius = 200
      
      positionedNodes.forEach((node, index) => {
        const angle = (index / positionedNodes.length) * 2 * Math.PI
        node.x = centerX + Math.cos(angle) * radius
        node.y = centerY + Math.sin(angle) * radius
      })
    } else if (layout === 'hierarchical') {
      // Hierarchical layout
      const levels: { [key: string]: DependencyNode[] } = {}
      
      // Find root nodes (nodes with no dependents)
      const rootNodes = positionedNodes.filter(node => node.dependents.length === 0)
      
      // Assign levels
      rootNodes.forEach((node, index) => {
        const level = 0
        if (!levels[level]) levels[level] = []
        levels[level].push(node)
        
        // Position root nodes
        node.x = 100 + (index * 150)
        node.y = 100
      })
      
      // Position other nodes based on dependencies
      positionedNodes.forEach(node => {
        if (node.dependencies.length > 0) {
          const level = 1
          if (!levels[level]) levels[level] = []
          levels[level].push(node)
          
          const levelNodes = levels[level]
          const index = levelNodes.indexOf(node)
          node.x = 100 + (index * 150)
          node.y = 250
        }
      })
    } else if (layout === 'circular') {
      // Circular layout
      const centerX = 400
      const centerY = 300
      const radius = Math.min(300, 50 + positionedNodes.length * 15)
      
      positionedNodes.forEach((node, index) => {
        const angle = (index / positionedNodes.length) * 2 * Math.PI
        node.x = centerX + Math.cos(angle) * radius
        node.y = centerY + Math.sin(angle) * radius
      })
    }
    
    return positionedNodes
  }

  const calculateMaxDepth = (nodes: DependencyNode[], edges: DependencyEdge[]): number => {
    // Simplified depth calculation
    return Math.max(1, Math.ceil(Math.log2(nodes.length)))
  }

  const findCircularDependencies = (nodes: DependencyNode[], edges: DependencyEdge[]): string[][] => {
    // Simplified circular dependency detection
    const circular: string[][] = []
    
    // Check for self-references
    edges.forEach(edge => {
      if (edge.source === edge.target) {
        circular.push([edge.source])
      }
    })
    
    return circular
  }

  const findCriticalPath = (nodes: DependencyNode[], edges: DependencyEdge[]): string[] => {
    // Simplified critical path calculation
    return nodes.slice(0, Math.min(5, nodes.length)).map(n => n.id)
  }

  const drawGraph = () => {
    const canvas = canvasRef.current
    if (!canvas || !graph) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw edges
    graph.edges.forEach(edge => {
      const sourceNode = graph.nodes.find(n => n.id === edge.source)
      const targetNode = graph.nodes.find(n => n.id === edge.target)
      
      if (sourceNode && targetNode) {
        ctx.beginPath()
        ctx.moveTo(sourceNode.x, sourceNode.y)
        ctx.lineTo(targetNode.x, targetNode.y)
        
        // Set edge style based on type
        switch (edge.type) {
          case 'imports':
            ctx.strokeStyle = '#3B82F6'
            break
          case 'requires':
            ctx.strokeStyle = '#10B981'
            break
          case 'extends':
            ctx.strokeStyle = '#F59E0B'
            break
          default:
            ctx.strokeStyle = '#6B7280'
        }
        
        ctx.lineWidth = edge.strength * 2
        ctx.stroke()
        
        // Draw arrow
        const angle = Math.atan2(targetNode.y - sourceNode.y, targetNode.x - sourceNode.x)
        const arrowLength = 10
        const arrowAngle = Math.PI / 6
        
        ctx.beginPath()
        ctx.moveTo(
          targetNode.x - targetNode.size * Math.cos(angle),
          targetNode.y - targetNode.size * Math.sin(angle)
        )
        ctx.lineTo(
          targetNode.x - targetNode.size * Math.cos(angle) - arrowLength * Math.cos(angle - arrowAngle),
          targetNode.y - targetNode.size * Math.sin(angle) - arrowLength * Math.sin(angle - arrowAngle)
        )
        ctx.moveTo(
          targetNode.x - targetNode.size * Math.cos(angle),
          targetNode.y - targetNode.size * Math.sin(angle)
        )
        ctx.lineTo(
          targetNode.x - targetNode.size * Math.cos(angle) - arrowLength * Math.cos(angle + arrowAngle),
          targetNode.y - targetNode.size * Math.sin(angle) - arrowLength * Math.sin(angle + arrowAngle)
        )
        ctx.stroke()
      }
    })

    // Draw nodes
    graph.nodes.forEach(node => {
      ctx.beginPath()
      ctx.arc(node.x, node.y, node.size, 0, 2 * Math.PI)
      ctx.fillStyle = node.color
      ctx.fill()
      
      // Highlight selected node
      if (selectedNode?.id === node.id) {
        ctx.strokeStyle = '#1F2937'
        ctx.lineWidth = 3
        ctx.stroke()
      }
      
      // Draw node label
      ctx.fillStyle = '#FFFFFF'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      // Truncate long names
      let displayName = node.name
      if (displayName.length > 12) {
        displayName = displayName.substring(0, 9) + '...'
      }
      
      ctx.fillText(displayName, node.x, node.y)
    })
  }

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!graph) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Find clicked node
    const clickedNode = graph.nodes.find(node => {
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2)
      return distance <= node.size
    })

    setSelectedNode(clickedNode || null)
  }

  const exportGraph = () => {
    if (!graph) return

    const data = {
      nodes: graph.nodes,
      edges: graph.edges,
      stats: graph.stats,
      exportTime: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dependency_graph_${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const loadSampleData = (type: 'package' | 'imports') => {
    setInputType(type)
    setInputData(sampleData[type === 'package' ? 'packageJson' : 'imports'])
  }

  useEffect(() => {
    drawGraph()
  }, [graph, layoutType, selectedNode])

  useEffect(() => {
    if (graph) {
      drawGraph()
    }
  }, [graph])

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dependency Graph Visualizer</h1>
        <p className="text-muted-foreground">
          Visualize and analyze dependencies in your codebase or project
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Input Configuration
            </CardTitle>
            <CardDescription>
              Configure dependency analysis parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="inputType">Input Type</Label>
                <Select value={inputType} onValueChange={(value: any) => setInputType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="package">Package.json</SelectItem>
                    <SelectItem value="imports">Import Statements</SelectItem>
                    <SelectItem value="custom">Custom Format</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Layout Type</Label>
                <Select value={layoutType} onValueChange={(value: any) => setLayoutType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="force">Force-Directed</SelectItem>
                    <SelectItem value="hierarchical">Hierarchical</SelectItem>
                    <SelectItem value="circular">Circular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Sample Data</Label>
              <div className="flex gap-2">
                <Button onClick={() => loadSampleData('package')} variant="outline" size="sm">
                  Package.json
                </Button>
                <Button onClick={() => loadSampleData('imports')} variant="outline" size="sm">
                  Imports
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="inputData">Input Data</Label>
              <Textarea
                id="inputData"
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
                placeholder="Paste your package.json, import statements, or custom data..."
                rows={12}
                className="font-mono text-sm"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={analyzeDependencies} disabled={isAnalyzing || !inputData.trim()} className="flex-1">
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <GitBranch className="h-4 w-4 mr-2" />
                    Analyze Dependencies
                  </>
                )}
              </Button>
              {graph && (
                <Button onClick={exportGraph} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dependency Graph</CardTitle>
            <CardDescription>
              Interactive visualization of your dependency structure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {graph ? (
                <>
                  <div className="border rounded-lg overflow-hidden">
                    <canvas
                      ref={canvasRef}
                      width={800}
                      height={600}
                      onClick={handleCanvasClick}
                      className="w-full cursor-pointer bg-white"
                    />
                  </div>

                  {selectedNode && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">{selectedNode.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-3 md:grid-cols-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Type:</span>
                            <span className="ml-2 font-medium capitalize">{selectedNode.type}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Version:</span>
                            <span className="ml-2 font-medium">{selectedNode.version || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Dependencies:</span>
                            <span className="ml-2 font-medium">{selectedNode.dependencies.length}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Dependents:</span>
                            <span className="ml-2 font-medium">{selectedNode.dependents.length}</span>
                          </div>
                        </div>
                        {selectedNode.issues.length > 0 && (
                          <div className="mt-3">
                            <span className="text-sm font-medium text-red-600">Issues:</span>
                            <ul className="text-sm text-red-600 mt-1">
                              {selectedNode.issues.map((issue, index) => (
                                <li key={index}>• {issue}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-96 bg-muted rounded-lg">
                  <div className="text-center">
                    <Network className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Analyze your dependencies to see the visualization
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {graph && (
        <Tabs defaultValue="stats" className="w-full mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="issues">Issues</TabsTrigger>
            <TabsTrigger value="legend">Legend</TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Total Nodes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{graph.stats.totalNodes}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Total Edges</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{graph.stats.totalEdges}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Max Depth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{graph.stats.maxDepth}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Circular Deps</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{graph.stats.circularDependencies.length}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Analysis Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {graph.stats.circularDependencies.length === 0 ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    )}
                    <span>
                      {graph.stats.circularDependencies.length === 0 ? 'No circular dependencies' : 
                       `${graph.stats.circularDependencies.length} circular dependencies found`}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {graph.stats.isolatedNodes.length === 0 ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    )}
                    <span>
                      {graph.stats.isolatedNodes.length === 0 ? 'No isolated nodes' : 
                       `${graph.stats.isolatedNodes.length} isolated nodes found`}
                    </span>
                  </div>

                  <div>
                    <span className="font-medium">Critical Path:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {graph.stats.criticalPath.map((nodeId, index) => (
                        <Badge key={index} variant="secondary">
                          {nodeId}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="issues" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dependency Issues</CardTitle>
              </CardHeader>
              <CardContent>
                {graph.stats.circularDependencies.length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-red-600">Circular Dependencies</h4>
                    {graph.stats.circularDependencies.map((circular, index) => (
                      <div key={index} className="p-3 border border-red-200 bg-red-50 rounded-lg">
                        <div className="font-medium text-red-800">
                          Circular dependency detected
                        </div>
                        <div className="text-sm text-red-600 mt-1">
                          Path: {circular.join(' → ')}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p className="text-green-600 font-medium">No circular dependencies found!</p>
                  </div>
                )}

                {graph.stats.isolatedNodes.length > 0 && (
                  <div className="space-y-3 mt-6">
                    <h4 className="font-semibold text-yellow-600">Isolated Nodes</h4>
                    <div className="flex flex-wrap gap-2">
                      {graph.stats.isolatedNodes.map((nodeId, index) => (
                        <Badge key={index} variant="outline">
                          {nodeId}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="legend" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Graph Legend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-semibold mb-2">Node Types</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                        <span className="text-sm">Main Package/File</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-green-500"></div>
                        <span className="text-sm">Dependencies</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                        <span className="text-sm">Dev Dependencies</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                        <span className="text-sm">Modules/Files</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Edge Types</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-0.5 bg-blue-500"></div>
                        <span className="text-sm">Imports</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-0.5 bg-green-500"></div>
                        <span className="text-sm">Requires</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-0.5 bg-yellow-500"></div>
                        <span className="text-sm">Extends</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-0.5 bg-gray-500"></div>
                        <span className="text-sm">Other</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Interactions</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>• Click on nodes to view details</div>
                    <div>• Node size indicates importance/usage</div>
                    <div>• Edge thickness indicates dependency strength</div>
                    <div>• Arrows show dependency direction</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}