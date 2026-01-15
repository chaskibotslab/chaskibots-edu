# 📁 Estructura de Carpetas en Google Drive

Crea esta estructura en tu Google Drive para organizar todo el contenido:

```
📁 ChaskiBots-EDU/
│
├── 📁 Videos/
│   ├── 📁 Inicial-1/
│   │   ├── 📁 Modulo-1-Bienvenida/
│   │   │   ├── 🎬 01-bienvenidos-al-curso.mp4
│   │   │   ├── 🎬 02-que-es-un-robot.mp4
│   │   │   └── 🎬 03-robots-en-nuestra-vida.mp4
│   │   ├── 📁 Modulo-2-Mi-Kit/
│   │   │   ├── 🎬 01-unboxing-kit.mp4
│   │   │   ├── 🎬 02-los-leds.mp4
│   │   │   └── 🎬 03-cables-conexiones.mp4
│   │   └── 📁 Modulo-3-Circuitos/
│   │       └── ...
│   │
│   ├── 📁 Inicial-2/
│   │   └── ... (misma estructura)
│   │
│   ├── 📁 Primero-EGB/
│   ├── 📁 Segundo-EGB/
│   └── ... (hasta Tercero-Bach)
│
├── 📁 Paralelos-Secciones/          ← PARA CLASES ESPECÍFICAS
│   ├── 📁 2024-2025/                ← Año lectivo
│   │   ├── 📁 Inicial-1-A/
│   │   │   ├── 📁 Fotos-Clase/
│   │   │   ├── 📁 Trabajos-Estudiantes/
│   │   │   └── 📁 Materiales-Especificos/
│   │   ├── 📁 Inicial-1-B/
│   │   ├── 📁 Primero-EGB-A/
│   │   └── ...
│   │
│   └── 📁 2025-2026/
│       └── ...
│
├── 📁 Imagenes/
│   ├── 📁 Kits/
│   │   ├── 📁 Inicial-1/
│   │   │   ├── 🖼️ kit-completo.jpg
│   │   │   ├── 🖼️ led-rojo.jpg
│   │   │   ├── 🖼️ cables-jumper.jpg
│   │   │   └── 🖼️ pila-cr2032.jpg
│   │   ├── 📁 Inicial-2/
│   │   └── ...
│   │
│   ├── 📁 Componentes/
│   │   ├── 🖼️ led-rojo.jpg
│   │   ├── 🖼️ led-verde.jpg
│   │   ├── 🖼️ esp32.jpg
│   │   ├── 🖼️ arduino-nano.jpg
│   │   └── ...
│   │
│   ├── 📁 Proyectos/
│   │   ├── 📁 Inicial-1/
│   │   │   ├── 🖼️ semaforo-colores.jpg
│   │   │   ├── 🖼️ tarjeta-luminosa.jpg
│   │   │   └── ...
│   │   └── ...
│   │
│   └── 📁 Pasos-Ensamblaje/
│       ├── 📁 Kit-Inicial-1/
│       │   ├── 🖼️ paso-1.jpg
│       │   ├── 🖼️ paso-2.jpg
│       │   └── ...
│       └── ...
│
├── 📁 Documentos/
│   ├── 📁 Guias-PDF/
│   │   ├── 📄 guia-inicial-1.pdf
│   │   ├── 📄 guia-inicial-2.pdf
│   │   └── ...
│   │
│   └── 📁 Plantillas/
│       └── ...
│
└── 📁 Recursos-Adicionales/
    ├── 📁 Diagramas/
    └── 📁 Presentaciones/
```

---

## 🔗 Cómo Obtener URLs de Google Drive

### Para VIDEOS:

1. Sube el video a la carpeta correspondiente
2. Click derecho → **"Compartir"**
3. Cambia a **"Cualquier persona con el enlace"**
4. Copia el enlace (se ve así):
   ```
   https://drive.google.com/file/d/1ABC123xyz/view?usp=sharing
   ```
5. **Transforma** el enlace para embed:
   ```
   https://drive.google.com/file/d/1ABC123xyz/preview
   ```

### Para IMÁGENES:

1. Sube la imagen
2. Click derecho → **"Compartir"** → **"Cualquier persona con el enlace"**
3. Copia el enlace y extrae el ID (la parte después de `/d/` y antes de `/view`)
4. Usa este formato:
   ```
   https://drive.google.com/uc?export=view&id=1ABC123xyz
   ```

---

## 📝 Ejemplo de URLs

| Tipo | URL Original | URL para la App |
|------|--------------|-----------------|
| Video | `https://drive.google.com/file/d/1ABC123/view` | `https://drive.google.com/file/d/1ABC123/preview` |
| Imagen | `https://drive.google.com/file/d/1XYZ789/view` | `https://drive.google.com/uc?export=view&id=1XYZ789` |

---

## ⚠️ Importante

- **Siempre** configura los archivos como "Cualquier persona con el enlace puede ver"
- Los videos grandes pueden tardar en cargar
- Para mejor rendimiento, considera usar **YouTube** para videos (No listados)
