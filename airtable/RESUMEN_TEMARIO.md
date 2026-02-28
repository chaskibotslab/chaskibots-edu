# 📊 RESUMEN DEL TEMARIO COMPLETO - ChaskiBots EDU

## Archivos Generados

| Archivo | Contenido | Lecciones |
|---------|-----------|-----------|
| `lessons.csv` | Robótica (existente) | 172 lecciones |
| `lessons_ia.csv` | Inteligencia Artificial | 156 lecciones |
| `lessons_hacking.csv` | Hacking/Ciberseguridad | 120 lecciones |
| `tasks_ia_hacking.csv` | Tareas para IA y Hacking | 96 tareas |
| `TEMARIO_COMPLETO_IA_HACKING.md` | Documentación detallada | - |

**TOTAL: 448 lecciones + 96 tareas**

---

## 📚 Distribución por Nivel

### ROBÓTICA (Ya existente)
| Nivel | Semanas | Lecciones | Proyectos |
|-------|---------|-----------|-----------|
| Inicial 1 | 8 | 7 | 1 |
| Inicial 2 | 8 | 8 | 2 |
| 1° EGB | 12 | 12 | 3 |
| 2° EGB | 12 | 12 | 3 |
| 3° EGB | 12 | 12 | 3 |
| 4° EGB | 12 | 12 | 3 |
| 5° EGB | 12 | 12 | 3 |
| 6° EGB | 12 | 12 | 3 |
| 7° EGB | 12 | 12 | 3 |
| 8° EGB | 12 | 12 | 3 |
| 9° EGB | 12 | 12 | 3 |
| 10° EGB | 12 | 12 | 3 |
| 1° Bach | 12 | 12 | 3 |
| 2° Bach | 12 | 12 | 3 |
| 3° Bach | 12 | 12 | 3 |

### INTELIGENCIA ARTIFICIAL (Nuevo)
| Nivel | Módulos | Lecciones | Enfoque |
|-------|---------|-----------|---------|
| Inicial 1 | 4 | 8 | Robots inteligentes, reconocimiento |
| Inicial 2 | 4 | 8 | Decisiones, patrones, clasificación |
| 1° EGB | 4 | 12 | Secuencias, algoritmos, Scratch Jr |
| 2° EGB | 4 | 12 | Condicionales, bucles, apps |
| 3° EGB | 4 | 12 | Machine Learning, Teachable Machine |
| 4° EGB | 4 | 12 | Scratch avanzado, chatbots |
| 5° EGB | 4 | 12 | ML for Kids, texto, predicciones |
| 6° EGB | 4 | 12 | IA en robots, visión, voz |
| 7° EGB | 4 | 12 | Python básico, NumPy, Matplotlib |
| 8° EGB | 4 | 12 | Pandas, Scikit-learn, modelos ML |
| 9° EGB | 4 | 12 | Redes neuronales, TensorFlow, CNNs |
| 10° EGB | 4 | 12 | NLP, chatbots ML, OpenCV |
| 1° Bach | 4 | 12 | RNNs, GANs, deployment |
| 2° Bach | 4 | 12 | Ética IA, RL, LLMs |
| 3° Bach | 4 | 12 | MLOps, especialización, capstone |

### HACKING/CIBERSEGURIDAD (Nuevo)
| Nivel | Módulos | Lecciones | Enfoque |
|-------|---------|-----------|---------|
| 4° EGB | 4 | 12 | Ciudadano digital, contraseñas, privacidad |
| 5° EGB | 4 | 12 | Fake news, phishing, malware |
| 6° EGB | 4 | 12 | Redes, encriptación, 2FA |
| 7° EGB | 4 | 12 | Hacking ético, OSINT, CVEs |
| 8° EGB | 4 | 12 | Linux, terminal, Nmap, Wireshark |
| 9° EGB | 4 | 12 | Seguridad web, OWASP, XSS, SQLi |
| 10° EGB | 4 | 12 | Pentesting, Metasploit, CTF |
| 1° Bach | 4 | 12 | Redes, WiFi, cracking passwords |
| 2° Bach | 4 | 12 | Social engineering, privesc, AD |
| 3° Bach | 4 | 12 | Blue team, forensics, malware analysis |

---

## 🎯 Cómo Importar a Airtable

### Opción 1: Importar CSVs directamente
1. Ir a Airtable → Base de ChaskiBots
2. Crear nueva tabla o usar existente
3. Importar CSV → Seleccionar archivo
4. Mapear columnas correctamente

### Opción 2: Agregar a tabla existente
1. Abrir tabla `lessons` existente
2. Importar → Agregar a tabla existente
3. Seleccionar `lessons_ia.csv`
4. Repetir con `lessons_hacking.csv`

### Columnas del CSV:
- `levelId` - ID del nivel (inicial-1, primero-egb, etc.)
- `moduleName` - Nombre del módulo
- `title` - Título de la lección
- `type` - Tipo (video, activity, tutorial, project)
- `duration` - Duración estimada
- `order` - Orden dentro del nivel
- `videoUrl` - URL del video (vacío para agregar después)
- `content` - Descripción del contenido
- `locked` - Si está bloqueado (true/false)

---

## 📝 Agregar Videos

Cada lección tiene un campo `videoUrl` vacío listo para agregar:

### Formato Google Drive:
```
https://drive.google.com/file/d/TU_FILE_ID/preview
```

### Formato YouTube:
```
https://www.youtube.com/embed/VIDEO_ID
```

---

## ✅ Próximos Pasos

1. **Importar CSVs a Airtable**
   - lessons_ia.csv
   - lessons_hacking.csv
   - tasks_ia_hacking.csv

2. **Agregar videos a cada lección**
   - Subir videos a Google Drive
   - Copiar URLs al campo videoUrl

3. **Configurar tareas**
   - Asignar fechas de entrega
   - Configurar puntuación

4. **Probar en la plataforma**
   - Verificar que las lecciones aparezcan
   - Probar reproducción de videos

---

## 📈 Estadísticas Finales

| Categoría | Cantidad |
|-----------|----------|
| **Lecciones Robótica** | 172 |
| **Lecciones IA** | 156 |
| **Lecciones Hacking** | 120 |
| **Total Lecciones** | **448** |
| **Tareas IA** | 48 |
| **Tareas Hacking** | 48 |
| **Total Tareas** | **96** |
| **Niveles cubiertos** | 15 |
| **Años escolares** | Inicial a 3° Bach |

---

## 🔧 Estructura de Carpetas

```
airtable/
├── lessons.csv              ← Robótica (existente)
├── lessons_ia.csv           ← IA (nuevo)
├── lessons_hacking.csv      ← Hacking (nuevo)
├── tasks_ia_hacking.csv     ← Tareas (nuevo)
├── TEMARIO_COMPLETO_IA_HACKING.md  ← Documentación
└── RESUMEN_TEMARIO.md       ← Este archivo
```

