// Probar la API directamente para ver qué devuelve
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

async function testPrograms() {
  const levels = ['inicial-1', 'cuarto-egb'];
  const programs = ['robotica', 'ia', 'hacking'];
  
  for (const level of levels) {
    console.log(`\n=== NIVEL: ${level} ===`);
    
    for (const program of programs) {
      const filters = `AND({levelId}="${level}",{programId}="${program}")`;
      const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/lessons?filterByFormula=${encodeURIComponent(filters)}&maxRecords=3&sort[0][field]=order&sort[0][direction]=asc`;
      
      const resp = await fetch(url, {
        headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` }
      });
      const data = await resp.json();
      
      console.log(`\n${program.toUpperCase()}:`);
      if (data.records && data.records.length > 0) {
        data.records.forEach((r, i) => {
          console.log(`  ${i+1}. ${r.fields.title}`);
        });
      } else {
        console.log('  (sin resultados)');
      }
    }
  }
}

testPrograms();
