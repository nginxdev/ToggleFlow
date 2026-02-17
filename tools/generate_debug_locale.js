
const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, '../frontend/src/locales/en.json');
const debugPath = path.join(__dirname, '../frontend/src/locales/debug.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

function transform(obj, prefix = '') {
  const result = {};
  for (const key in obj) {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null) {
      result[key] = transform(value, newKey);
    } else {
      result[key] = `xxx-${newKey}-xxx`;
    }
  }
  return result;
}

const debug = transform(en);
fs.writeFileSync(debugPath, JSON.stringify(debug, null, 2));
console.log('debug.json created');
