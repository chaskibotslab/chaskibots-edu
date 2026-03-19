const fs = require('fs');

// Leer credenciales
let AIRTABLE_API_KEY = '';
let AIRTABLE_BASE_ID = '';

try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  envContent.split('\n').forEach(line => {
    if (line.startsWith('AIRTABLE_API_KEY=')) AIRTABLE_API_KEY = line.split('=')[1].trim();
    if (line.startsWith('AIRTABLE_BASE_ID=')) AIRTABLE_BASE_ID = line.split('=')[1].trim();
  });
} catch (e) {
  console.log('Error leyendo .env.local');
  process.exit(1);
}

// Parsear CSV
function parseCSV(content) {
  const lines = content.split('\n');
  const headers = lines[0].split(',');
  const records = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Parsear línea con comillas
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current);
    
    if (values.length >= 10) {
      records.push({
        levelId: values[0],
        moduleName: values[1],
        title: values[2],
        type: values[3],
        duration: values[4],
        order: parseInt(values[5]) || 1,
        videoUrl: values[6],
        content: values[7],
        locked: values[8] === 'true',
        programId: values[9]
      });
    }
  }
  
  return records;
}

// Importar a Airtable
async function importToAirtable(records, levelFilter) {
  const filtered = levelFilter 
    ? records.filter(r => r.levelId === levelFilter)
    : records;
  
  console.log(`\nImportando ${filtered.length} registros para ${levelFilter || 'todos'}...`);
  
  // Airtable permite máximo 10 registros por request
  const batchSize = 10;
  let imported = 0;
  
  for (let i = 0; i < filtered.length; i += batchSize) {
    const batch = filtered.slice(i, i + batchSize);
    
    const body = {
      records: batch.map(r => ({
        fields: {
          levelId: r.levelId,
          moduleName: r.moduleName,
          title: r.title,
          type: r.type,
          duration: r.duration,
          order: r.order,
          videoUrl: r.videoUrl,
          content: r.content,
          locked: r.locked,
          programId: r.programId
        }
      }))
    };
    
    try {
      const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/lessons`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      
      if (!response.ok) {
        const error = await response.text();
        console.log(`Error en batch ${i/batchSize + 1}:`, error);
        continue;
      }
      
      imported += batch.length;
      process.stdout.write(`\r  Importados: ${imported}/${filtered.length}`);
      
      // Esperar un poco para no exceder límites de API
      await new Promise(resolve => setTimeout(resolve, 250));
      
    } catch (error) {
      console.log(`Error:`, error.message);
    }
  }
  
  console.log(`\n✅ Importación completada: ${imported} registros`);
}

async function main() {
  // Leer CSV
  const csvContent = fs.readFileSync('airtable/lessons_all_levels.csv', 'utf8');
  const records = parseCSV(csvContent);
  
  console.log(`Total de registros en CSV: ${records.length}`);
  
  // Filtrar solo los niveles nuevos
  const newLevels = ['inicial-2', 'segundo-egb', 'tercero-egb'];
  const newRecords = records.filter(r => newLevels.includes(r.levelId));
  
  console.log(`Registros nuevos a importar: ${newRecords.length}`);
  
  if (newRecords.length === 0) {
    console.log('No hay registros nuevos para importar');
    return;
  }
  
  // Importar
  await importToAirtable(newRecords);
}

main();
