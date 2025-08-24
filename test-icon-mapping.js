// Test script to check icon mapping
const fs = require('fs');

// Read the icon mapping file
const iconMappingContent = fs.readFileSync('./src/lib/icon-mapping.ts', 'utf8');
console.log('Icon mapping file length:', iconMappingContent.length);

// Extract the iconMap object
const iconMapMatch = iconMappingContent.match(/export const iconMap: Record<string, React\.ComponentType<any>> = \{([\s\S]*?)\}/);
if (iconMapMatch) {
  const iconMapContent = iconMapMatch[1];
  const iconMatches = iconMapContent.match(/(\w+),/g);
  if (iconMatches) {
    const icons = iconMatches.map(match => match.replace(',', ''));
    console.log('Found icons in mapping:', icons.length);
    console.log('First 10 icons:', icons.slice(0, 10));
  } else {
    console.log('No icons found in mapping');
  }
} else {
  console.log('Could not find iconMap object');
}

// Check if the file is properly structured
console.log('File contains export function:', iconMappingContent.includes('export function getIconComponent'));
console.log('File contains Bot import:', iconMappingContent.includes('Bot'));