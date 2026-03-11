// Probar el filtro de la API directamente
const fs = require('fs');

let AIRTABLE_API_KEY = '';
let AIRTABLE_BASE_ID = '';

try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  envContent.split('\n').forEach(line => {
    if (line.startsWith('AIRTABLE_API_KEY=')) AIRTABLE_API_KEY = line.split('=')[1].trim();
    if (line.startsWith('AIRTABLE_BASE_ID=')) AIRTABLE_BASE_ID = line.split('=')[1].trim();
  });
} catch (e) {}

async function testFilter(levelId, programId) {
  const filters = [];
  if (levelId) filters.push(`{levelId}="${levelId}"`);
  if (programId) filters.push(`{programId}="${programId}"`);
  
  const formula = filters.length === 1 ? filters[0] : `AND(${filters.join(',')})`;
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/lessons?filterByFormula=${encodeURIComponent(formula)}&maxRecords=5&sort[0][field]=order&sort[0][direction]=asc`;
  
  console.log(`\n=== Probando: levelId=${levelId}, programId=${programId} ===`);
  console.log('Formula:', formula);
  
  const resp = await fetch(url, {
    headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` }
  });
  
  const data = await resp.json();
  
  if (data.error) {
    console.log('ERROR:', data.error);
    return;
  }
  
  console.log(`Resultados: ${data.records.length} lecciones`);
  data.records.forEach((r, i) => {
    console.log(`  [${i+1}] ${r.fields.title} (programId: ${r.fields.programId})`);
  });
}

async function main() {
  // Probar con inicial-1 y los 3 programas
  await testFilter('inicial-1', 'robotica');
  await testFilter('inicial-1', 'ia');
  await testFilter('inicial-1', 'hacking');
}

main();
