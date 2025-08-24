
import { getIconComponent } from './src/lib/icon-mapping.ts';

console.log('Testing icon mapping...');
console.log('Bot icon:', getIconComponent('Bot'));
console.log('Search icon:', getIconComponent('Search'));
console.log('Unknown icon:', getIconComponent('UnknownIcon'));
