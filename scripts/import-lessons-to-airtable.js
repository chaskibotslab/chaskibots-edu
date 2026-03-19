/**
 * Script para importar lecciones de IA y Hacking a Airtable
 * Lee los archivos CSV y los sube a la tabla lessons existente
 * 
 * Uso: node scripts/import-lessons-to-airtable.js
 */

const fs = require('fs');
const path = require('path');

// Cargar variables de entorno manualmente
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    process.env[key.trim()] = valueParts.join('=').trim();
  }
});

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_LESSONS_TABLE = 'lessons';

// Videos educativos por programa y nivel
const EDUCATIONAL_VIDEOS = {
  ia: {
    'inicial-1': 'https://www.youtube.com/watch?v=mJeNghZXtMo',
    'inicial-2': 'https://www.youtube.com/watch?v=a0_lo_GXe-8',
    'primero-egb': 'https://www.youtube.com/watch?v=mJeNghZXtMo',
    'segundo-egb': 'https://www.youtube.com/watch?v=mJeNghZXtMo',
    'tercero-egb': 'https://www.youtube.com/watch?v=mJeNghZXtMo',
    'cuarto-egb': 'https://www.youtube.com/watch?v=kwcillcWOg0',
    'quinto-egb': 'https://www.youtube.com/watch?v=f_uwKZIAeM0',
    'sexto-egb': 'https://www.youtube.com/watch?v=aircAruvnKk',
    'septimo-egb': 'https://www.youtube.com/watch?v=_ZvnD96BbJI',
    'octavo-egb': 'https://www.youtube.com/watch?v=DkpYj0GCWIU',
    'noveno-egb': 'https://www.youtube.com/watch?v=MRIv2IwFTPg',
    'decimo-egb': 'https://www.youtube.com/watch?v=fOvTtapxa9c',
    'primero-bach': 'https://www.youtube.com/watch?v=EMXfZB8FVUA',
    'primero-bgu': 'https://www.youtube.com/watch?v=EMXfZB8FVUA',
    'segundo-bach': 'https://www.youtube.com/watch?v=zjkBMFhNj_g',
    'segundo-bgu': 'https://www.youtube.com/watch?v=zjkBMFhNj_g',
    'tercero-bach': 'https://www.youtube.com/watch?v=ad79nYk2keg',
    'tercero-bgu': 'https://www.youtube.com/watch?v=ad79nYk2keg',
  },
  hacking: {
    'inicial-1': 'https://www.youtube.com/watch?v=yrln8nyVBLU',
    'inicial-2': 'https://www.youtube.com/watch?v=yrln8nyVBLU',
    'primero-egb': 'https://www.youtube.com/watch?v=yrln8nyVBLU',
    'segundo-egb': 'https://www.youtube.com/watch?v=yrln8nyVBLU',
    'tercero-egb': 'https://www.youtube.com/watch?v=yrln8nyVBLU',
    'cuarto-egb': 'https://www.youtube.com/watch?v=XBkzBrXlle0',
    'quinto-egb': 'https://www.youtube.com/watch?v=yrln8nyVBLU',
    'sexto-egb': 'https://www.youtube.com/watch?v=inWWhr5tnEA',
    'septimo-egb': 'https://www.youtube.com/watch?v=wBp0Rb-ZJak',
    'octavo-egb': 'https://www.youtube.com/watch?v=jhXCTbFnK8o',
    'noveno-egb': 'https://www.youtube.com/watch?v=lZAoFs75_cs',
    'decimo-egb': 'https://www.youtube.com/watch?v=3Kq1MIfTWCE',
    'primero-bach': 'https://www.youtube.com/watch?v=G3hpAeoZ4ek',
    'primero-bgu': 'https://www.youtube.com/watch?v=G3hpAeoZ4ek',
    'segundo-bach': 'https://www.youtube.com/watch?v=Lus7aNf2xDg',
    'segundo-bgu': 'https://www.youtube.com/watch?v=Lus7aNf2xDg',
    'tercero-bach': 'https://www.youtube.com/watch?v=pL9q2lOZ1Fw',
    'tercero-bgu': 'https://www.youtube.com/watch?v=pL9q2lOZ1Fw',
  }
};

function parseCSV(content) {
  const lines = content.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim());
  
  const records = [];
  for (let i = 1; i < lines.length; i++) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (const char of lines[i]) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    if (values.length >= headers.length) {
      const record = {};
      headers.forEach((header, index) => {
        record[header] = values[index] || '';
      });
      records.push(record);
    }
  }
  
  return records;
}

function getVideoForLesson(programId, levelId, existingVideoUrl) {
  // Si ya tiene video, mantenerlo
  if (existingVideoUrl && existingVideoUrl.trim() !== '') {
    return existingVideoUrl;
  }
  
  // Asignar video según programa y nivel
  const programVideos = EDUCATIONAL_VIDEOS[programId];
  if (programVideos && programVideos[levelId]) {
    return programVideos[levelId];
  }
  
  // Fallback
  if (programId === 'ia') {
    return 'https://www.youtube.com/watch?v=mJeNghZXtMo';
  } else if (programId === 'hacking') {
    return 'https://www.youtube.com/watch?v=inWWhr5tnEA';
  }
  
  return '';
}

async function createRecords(records) {
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_LESSONS_TABLE}`;
  
  // Airtable permite máximo 10 registros por request
  const batches = [];
  for (let i = 0; i < records.length; i += 10) {
    batches.push(records.slice(i, i + 10));
  }
  
  let created = 0;
  let errors = 0;
  
  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    
    const airtableRecords = batch.map(record => {
      const videoUrl = getVideoForLesson(record.programId, record.levelId, record.videoUrl);
      
      // Limpiar duration de comillas extras y normalizar
      let duration = (record.duration || '').replace(/"/g, '').trim();
      // Normalizar duraciones válidas
      const validDurations = ['5 min', '8 min', '10 min', '12 min', '15 min', '18 min', '20 min', '25 min', '30 min', '35 min', '40 min', '45 min', '50 min', '60 min', '70 min', '80 min', '90 min'];
      if (!validDurations.includes(duration)) {
        // Intentar extraer número y normalizar
        const match = duration.match(/(\d+)/);
        if (match) {
          duration = `${match[1]} min`;
          if (!validDurations.includes(duration)) {
            duration = '30 min'; // Default
          }
        } else {
          duration = '30 min'; // Default
        }
      }
      
      return {
        fields: {
          levelId: record.levelId || '',
          programId: record.programId || '',
          moduleName: record.moduleName || '',
          title: record.title || '',
          type: record.type || 'video',
          duration: duration,
          order: parseInt(record.order) || 1,
          videoUrl: videoUrl,
          content: record.content || '',
          locked: record.locked === 'true',
        }
      };
    });
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ records: airtableRecords }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Error en batch ${batchIndex + 1}: ${errorText}`);
        errors += batch.length;
      } else {
        const data = await response.json();
        created += data.records.length;
        console.log(`✅ Batch ${batchIndex + 1}/${batches.length}: ${data.records.length} registros creados`);
      }
      
      // Esperar para no exceder límites de API (5 requests/segundo)
      await new Promise(resolve => setTimeout(resolve, 250));
      
    } catch (error) {
      console.error(`❌ Error en batch ${batchIndex + 1}: ${error.message}`);
      errors += batch.length;
    }
  }
  
  return { created, errors };
}

async function main() {
  console.log('📚 Importando lecciones de IA y Hacking a Airtable...\n');
  
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    console.error('❌ Error: Faltan variables de entorno AIRTABLE_API_KEY o AIRTABLE_BASE_ID');
    process.exit(1);
  }
  
  const csvFiles = [
    { path: 'airtable/lessons_ia_completo.csv', name: 'IA' },
    { path: 'airtable/lessons_hacking_completo.csv', name: 'Hacking' },
  ];
  
  let totalCreated = 0;
  let totalErrors = 0;
  
  for (const file of csvFiles) {
    const filePath = path.join(__dirname, '..', file.path);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Archivo no encontrado: ${file.path}`);
      continue;
    }
    
    console.log(`\n📄 Procesando ${file.name}: ${file.path}`);
    
    const content = fs.readFileSync(filePath, 'utf8');
    const records = parseCSV(content);
    
    console.log(`   Registros encontrados: ${records.length}`);
    
    if (records.length === 0) {
      console.log(`   ⚠️  No hay registros para importar`);
      continue;
    }
    
    const { created, errors } = await createRecords(records);
    totalCreated += created;
    totalErrors += errors;
    
    console.log(`   ✅ Creados: ${created}, ❌ Errores: ${errors}`);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMEN FINAL:');
  console.log(`   ✅ Total creados: ${totalCreated}`);
  console.log(`   ❌ Total errores: ${totalErrors}`);
  console.log('='.repeat(50));
}

main().catch(console.error);
