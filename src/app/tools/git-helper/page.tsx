'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { GitBranch, GitCommit, GitPullRequest, GitMerge, Copy, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react'

interface GitCommand {
  command: string
  description: string
  category: string
}

interface GitTip {
  title: string
  description: string
  category: string
}

export default function GitHelper() {
  const [activeTab, setActiveTab] = useState('commands')
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  
  const gitCommands: GitCommand[] = [
    { command: 'git init', description: 'Initialize a new Git repository', category: 'basic' },
    { command: 'git clone <url>', description: 'Clone a repository from URL', category: 'basic' },
    { command: 'git add .', description: 'Add all files to staging area', category: 'basic' },
    { command: 'git add <file>', description: 'Add specific file to staging', category: 'basic' },
    { command: 'git commit -m "message"', description: 'Commit staged changes with message', category: 'basic' },
    { command: 'git status', description: 'Show working tree status', category: 'basic' },
    { command: 'git log', description: 'Show commit history', category: 'basic' },
    { command: 'git diff', description: 'Show changes between commits', category: 'basic' },
    { command: 'git branch', description: 'List branches', category: 'branches' },
    { command: 'git branch <name>', description: 'Create new branch', category: 'branches' },
    { command: 'git checkout <branch>', description: 'Switch to branch', category: 'branches' },
    { command: 'git checkout -b <branch>', description: 'Create and switch to branch', category: 'branches' },
    { command: 'git merge <branch>', description: 'Merge branch into current', category: 'branches' },
    { command: 'git branch -d <branch>', description: 'Delete branch', category: 'branches' },
    { command: 'git remote -v', description: 'Show remote repositories', category: 'remote' },
    { command: 'git remote add <name> <url>', description: 'Add remote repository', category: 'remote' },
    { command: 'git push <remote> <branch>', description: 'Push to remote repository', category: 'remote' },
    { command: 'git pull <remote> <branch>', description: 'Pull from remote repository', category: 'remote' },
    { command: 'git fetch', description: 'Fetch from remote repository', category: 'remote' },
    { command: 'git reset HEAD~1', description: 'Undo last commit', category: 'undo' },
    { command: 'git reset --hard HEAD~1', description: 'Remove last commit and changes', category: 'undo' },
    { command: 'git revert <commit>', description: 'Revert a commit', category: 'undo' },
    { command: 'git clean -fd', description: 'Remove untracked files', category: 'cleanup' },
    { command: 'git stash', description: 'Stash changes', category: 'cleanup' },
    { command: 'git stash pop', description: 'Apply stashed changes', category: 'cleanup' },
    { command: 'git config --global user.name "Name"', description: 'Set git username', category: 'config' },
    { command: 'git config --global user.email "email"', description: 'Set git email', category: 'config' },
    { command: 'git config --global init.defaultBranch main', description: 'Set default branch name', category: 'config' },
  ]

  const gitTips: GitTip[] = [
    { title: 'Use .gitignore', description: 'Always create .gitignore file to exclude unnecessary files', category: 'best-practices' },
    { title: 'Meaningful Commit Messages', description: 'Write clear, descriptive commit messages', category: 'best-practices' },
    { title: 'Use Branches', description: 'Create feature branches for new work', category: 'best-practices' },
    { title: 'Pull Before Push', description: 'Always pull before pushing to avoid conflicts', category: 'best-practices' },
    { title: 'Small Commits', description: 'Make small, focused commits', category: 'best-practices' },
    { title: 'Use SSH Keys', description: 'Set up SSH keys for secure authentication', category: 'security' },
    { title: 'Keep Secrets Out', description: 'Never commit sensitive information', category: 'security' },
    { title: 'Regular Backups', description: 'Push to remote regularly as backup', category: 'security' },
    { title: 'Use .gitattributes', description: 'Set file attributes for line endings', category: 'advanced' },
    { title: 'Use Submodules', description: 'Manage dependencies with git submodules', category: 'advanced' },
    { title: 'Use Worktrees', description: 'Use git worktrees for multiple branches', category: 'advanced' },
    { title: 'Use Git Hooks', description: 'Automate tasks with git hooks', category: 'advanced' },
  ]

  const filteredCommands = gitCommands.filter(cmd => {
    const matchesSearch = cmd.command.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cmd.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || cmd.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const filteredTips = gitTips.filter(tip => {
    const matchesSearch = tip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tip.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || tip.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = [
    { value: 'all', label: 'All' },
    { value: 'basic', label: 'Basic' },
    { value: 'branches', label: 'Branches' },
    { value: 'remote', label: 'Remote' },
    { value: 'undo', label: 'Undo' },
    { value: 'cleanup', label: 'Cleanup' },
    { value: 'config', label: 'Config' },
    { value: 'best-practices', label: 'Best Practices' },
    { value: 'security', label: 'Security' },
    { value: 'advanced', label: 'Advanced' },
  ]

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedCommand(text)
      setTimeout(() => setCopiedCommand(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const openGitDocumentation = () => {
    window.open('https://git-scm.com/doc', '_blank')
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Git Helper
            </CardTitle>
            <CardDescription>
              Essential Git commands, tips, and best practices for developers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search commands or tips..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="sm:w-48">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" onClick={openGitDocumentation}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Docs
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="commands">Git Commands</TabsTrigger>
                <TabsTrigger value="tips">Git Tips</TabsTrigger>
              </TabsList>

              <TabsContent value="commands" className="space-y-4">
                <div className="grid gap-3">
                  {filteredCommands.map((cmd, index) => (
                    <Card key={index} className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                                {cmd.command}
                              </code>
                              <Badge variant="secondary" className="text-xs">
                                {cmd.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {cmd.description}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(cmd.command)}
                            className="ml-2"
                          >
                            {copiedCommand === cmd.command ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {filteredCommands.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No commands found matching your search.
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="tips" className="space-y-4">
                <div className="grid gap-3">
                  {filteredTips.map((tip, index) => (
                    <Card key={index} className="border-l-4 border-l-green-500">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            <AlertCircle className="h-4 w-4 text-green-500" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{tip.title}</h4>
                              <Badge variant="secondary" className="text-xs">
                                {tip.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {tip.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {filteredTips.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No tips found matching your search.
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <GitCommit className="h-5 w-5" />
                Common Workflows
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <strong>New Project:</strong>
                <div className="ml-4 mt-1 space-y-1">
                  <code>git init</code>
                  <code>git add .</code>
                  <code>git commit -m "Initial commit"</code>
                </div>
              </div>
              <div>
                <strong>Start Feature:</strong>
                <div className="ml-4 mt-1 space-y-1">
                  <code>git checkout -b feature-name</code>
                  <code>git add .</code>
                  <code>git commit -m "Add feature"</code>
                </div>
              </div>
              <div>
                <strong>Push to Remote:</strong>
                <div className="ml-4 mt-1 space-y-1">
                  <code>git push origin main</code>
                </div>
              </div>
              <div>
                <strong>Update Local:</strong>
                <div className="ml-4 mt-1 space-y-1">
                  <code>git pull origin main</code>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <GitPullRequest className="h-5 w-5" />
                Quick Reference
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <strong>Undo Changes:</strong>
                <div className="ml-4 mt-1">
                  <code>git checkout -- &lt;file&gt;</code> - Discard changes
                </div>
              </div>
              <div>
                <strong>Branch Management:</strong>
                <div className="ml-4 mt-1">
                  <code>git branch -a</code> - List all branches
                </div>
              </div>
              <div>
                <strong>Remote Setup:</strong>
                <div className="ml-4 mt-1">
                  <code>git remote add origin &lt;url&gt;</code>
                </div>
              </div>
              <div>
                <strong>Configuration:</strong>
                <div className="ml-4 mt-1">
                  <code>git config --global user.name "Name"</code>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}