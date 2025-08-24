// Test the actual icon mapping functionality
const fs = require('fs');

// Create a simple test file to check if icon mapping works
const testContent = `
import { getIconComponent } from './src/lib/icon-mapping.ts';

console.log('Testing icon mapping...');
console.log('Bot icon:', getIconComponent('Bot'));
console.log('Search icon:', getIconComponent('Search'));
console.log('Unknown icon:', getIconComponent('UnknownIcon'));
`;

fs.writeFileSync('./test-icon-import.js', testContent);

console.log('Test file created. Now checking if we can run it...');

// Try to run the test
try {
  const { execSync } = require('child_process');
  const result = execSync('node test-icon-import.js', { encoding: 'utf8', timeout: 5000 });
  console.log('Test result:', result);
} catch (error) {
  console.log('Test failed:', error.message);
}