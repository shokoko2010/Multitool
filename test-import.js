// Try to import the tools data
try {
  const tools = require('./src/data/tools.ts').tools;
  console.log('Success! Tools loaded:', tools.length);
  console.log('First tool:', tools[0].name);
} catch (error) {
  console.error('Error importing tools:', error.message);
}