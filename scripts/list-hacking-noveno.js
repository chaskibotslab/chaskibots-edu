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

async function listHacking() {
  const filter = 'AND({levelId}="noveno-egb",{programId}="hacking")';
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/lessons?filterByFormula=${encodeURIComponent(filter)}&sort[0][field]=order`;
  
  const resp = await fetch(url, {
    headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` }
  });
  const data = await resp.json();
  
  console.log('Lecciones de HACKING noveno-egb:\n');
  data.records.forEach((r, i) => {
    console.log(`${i+1}. ${r.fields.title} (${r.fields.moduleName})`);
  });
}

listHacking();
