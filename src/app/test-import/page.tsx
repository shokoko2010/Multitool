// Simple test to check if tools can be imported
import { tools } from '@/data/tools'

export default function TestImport() {
  try {
    const toolsCount = tools ? tools.length : 0
    return (
      <div>
        <h1>Import Test</h1>
        <p>Tools loaded: {toolsCount}</p>
      </div>
    )
  } catch (error) {
    return (
      <div>
        <h1>Import Error</h1>
        <p>{error.message}</p>
      </div>
    )
  }
}