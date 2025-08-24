const { tools } = require('./src/data/tools.ts');

console.log('Total tools:', tools.length);
console.log('First tool:', tools[0]);
console.log('Categories:', [...new Set(tools.map(tool => tool.category))]);
console.log('Icons used:', [...new Set(tools.map(tool => tool.icon))].sort());