// Script para verificar conexión a Airtable
const fs = require('fs');

// Leer .env.local manualmente
let AIRTABLE_API_KEY = '';
let AIRTABLE_BASE_ID = '';

try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const lines = envContent.split('\n');
  lines.forEach(line => {
    if (line.startsWith('AIRTABLE_API_KEY=')) {
      AIRTABLE_API_KEY = line.split('=')[1].trim();
    }
    if (line.startsWith('AIRTABLE_BASE_ID=')) {
      AIRTABLE_BASE_ID = line.split('=')[1].trim();
    }
  });
} catch (e) {
  console.log('No se pudo leer .env.local');
}

console.log('=== Verificación de Airtable ===\n');

// Verificar variables de entorno
console.log('1. Variables de entorno:');
console.log('   AIRTABLE_API_KEY:', AIRTABLE_API_KEY ? `✅ Configurado (${AIRTABLE_API_KEY.substring(0, 10)}...)` : '❌ NO CONFIGURADO');
console.log('   AIRTABLE_BASE_ID:', AIRTABLE_BASE_ID ? `✅ Configurado (${AIRTABLE_BASE_ID})` : '❌ NO CONFIGURADO');

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.log('\n❌ Faltan variables de entorno. Verifica tu archivo .env.local');
  process.exit(1);
}

// Probar conexión
async function testConnection() {
  console.log('\n2. Probando conexión a Airtable...');
  
  // Obtener TODOS los registros (paginación)
  let allRecords = [];
  let offset = null;
  
  do {
    let url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/lessons?pageSize=100`;
    if (offset) url += `&offset=${offset}`;
    
    const resp = await fetch(url, {
      headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` }
    });
    const data = await resp.json();
    allRecords = allRecords.concat(data.records || []);
    offset = data.offset;
  } while (offset);
  
  console.log(`   ✅ Total de lecciones en Airtable: ${allRecords.length}`);
  
  // Contar por nivel
  const byLevel = {};
  const byProgram = {};
  allRecords.forEach(r => {
    const level = r.fields.levelId || 'sin-nivel';
    const program = r.fields.programId || 'sin-programa';
    byLevel[level] = (byLevel[level] || 0) + 1;
    byProgram[program] = (byProgram[program] || 0) + 1;
  });
  
  console.log('\n3. Lecciones por PROGRAMA:');
  Object.entries(byProgram).sort().forEach(([k, v]) => {
    console.log(`   ${k}: ${v} lecciones`);
  });
  
  console.log('\n4. Lecciones por NIVEL:');
  Object.entries(byLevel).sort().forEach(([k, v]) => {
    console.log(`   ${k}: ${v} lecciones`);
  });
  
  // Verificar noveno-egb específicamente
  const noveno = allRecords.filter(r => r.fields.levelId === 'noveno-egb');
  console.log(`\n5. Detalle noveno-egb (${noveno.length} lecciones):`);
  const novenoByProgram = {};
  noveno.forEach(r => {
    const p = r.fields.programId || 'sin-programa';
    novenoByProgram[p] = (novenoByProgram[p] || 0) + 1;
  });
  Object.entries(novenoByProgram).forEach(([k, v]) => {
    console.log(`   ${k}: ${v} lecciones`);
  });
  
  return;
  
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/lessons?maxRecords=3`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('   Status:', response.status, response.statusText);
    
    if (response.status === 401) {
      console.log('\n❌ ERROR 401: API Key inválido o sin permisos');
      console.log('   → Ve a https://airtable.com/create/tokens');
      console.log('   → Crea un nuevo token con permisos: data.records:read, data.records:write');
      return;
    }
    
    if (response.status === 404) {
      console.log('\n❌ ERROR 404: Tabla "lessons" no encontrada');
      console.log('   → Verifica que la tabla se llame exactamente "lessons"');
      return;
    }
    
    if (!response.ok) {
      const error = await response.text();
      console.log('\n❌ Error:', error);
      return;
    }
    
    const data = await response.json();
    console.log('   ✅ Conexión exitosa!');
    console.log(`   Total de registros obtenidos: ${data.records.length}`);
    
    if (data.records.length > 0) {
      console.log('\n3. Muestra de datos:');
      data.records.forEach((record, i) => {
        const f = record.fields;
        console.log(`   [${i+1}] ${f.title || 'Sin título'}`);
        console.log(`       levelId: ${f.levelId || 'N/A'}, programId: ${f.programId || 'N/A'}`);
      });
      
      // Verificar programIds únicos
      console.log('\n4. Verificando programIds...');
      const programIds = new Set(data.records.map(r => r.fields.programId).filter(Boolean));
      console.log('   ProgramIds encontrados:', Array.from(programIds).join(', ') || 'NINGUNO');
      
      if (programIds.size === 0) {
        console.log('\n⚠️  PROBLEMA: No hay programId en los registros');
        console.log('   → Necesitas importar el CSV con la columna programId');
      }
    } else {
      console.log('\n⚠️  La tabla "lessons" está vacía');
      console.log('   → Importa el archivo: airtable/lessons_all_levels.csv');
    }
    
  } catch (error) {
    console.log('\n❌ Error de conexión:', error.message);
  }
}

testConnection();
