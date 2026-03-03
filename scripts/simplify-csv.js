const fs = require('fs');

// Leer el archivo original
const content = fs.readFileSync('airtable/lessons_dinamico_completo.csv', 'utf8');
const lines = content.split('\n');

// Header simplificado
const header = 'levelId,moduleName,title,type,duration,order,videoUrl,content,locked,programId';
const rows = [header];

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  
  // Parsear CSV con comillas
  const parts = [];
  let current = '';
  let inQuotes = false;
  
  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      parts.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  parts.push(current);
  
  if (parts.length >= 10) {
    // Extraer solo los primeros 10 campos
    const levelId = parts[0];
    const moduleName = parts[1];
    const title = parts[2];
    const type = parts[3];
    const duration = parts[4];
    const order = parts[5];
    const videoUrl = parts[6];
    const content = parts[7].substring(0, 300).replace(/"/g, '""'); // Limitar contenido
    const locked = parts[8];
    const programId = parts[9];
    
    rows.push(`${levelId},${moduleName},${title},${type},${duration},${order},${videoUrl},"${content}",${locked},${programId}`);
  }
}

// Guardar archivo simplificado
fs.writeFileSync('airtable/lessons_all_levels.csv', rows.join('\n'));
console.log(`Creado lessons_all_levels.csv con ${rows.length} filas`);
