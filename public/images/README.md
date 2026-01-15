# 📁 Estructura de Imágenes Locales

Esta carpeta contiene las imágenes que se usan en la aplicación.

## 📂 Estructura de Carpetas

```
images/
├── cursos/              ← Imágenes específicas por nivel/curso
│   ├── inicial-1/       ← Fotos del curso Inicial 1
│   ├── inicial-2/
│   ├── primero-egb/
│   ├── segundo-egb/
│   ├── tercero-egb/
│   └── ... (crear más según necesites)
│
├── kits/                ← Fotos de los kits de cada nivel
│   ├── kit-inicial-1.jpg
│   ├── kit-inicial-2.jpg
│   └── ...
│
├── componentes/         ← Fotos de componentes individuales
│   ├── led-rojo.jpg
│   ├── led-verde.jpg
│   ├── esp32.jpg
│   ├── arduino-nano.jpg
│   └── ...
│
└── proyectos/           ← Fotos de proyectos terminados
    ├── semaforo.jpg
    ├── robot-otto.jpg
    └── ...
```

## 🔗 Cómo Usar las Imágenes en el Código

En cualquier componente React, usa la ruta relativa desde `/public`:

```tsx
// Ejemplo en un componente
<img src="/images/cursos/inicial-1/leccion-1.jpg" alt="Lección 1" />

// En los datos del curso
{
  thumbnailUrl: '/images/cursos/inicial-1/leccion-1.jpg'
}
```

## 📝 Convenciones de Nombres

- Usa **minúsculas** y **guiones** (no espacios ni mayúsculas)
- Ejemplos buenos: `led-rojo.jpg`, `kit-inicial-1.jpg`, `paso-1-conexion.jpg`
- Ejemplos malos: `LED Rojo.jpg`, `Kit_Inicial_1.JPG`

## 🖼️ Formatos Recomendados

| Formato | Uso |
|---------|-----|
| `.jpg` | Fotos de kits, componentes, proyectos |
| `.png` | Imágenes con transparencia, iconos |
| `.webp` | Mejor compresión (moderno) |
| `.svg` | Iconos y gráficos vectoriales |

## ⚠️ Importante

- Las imágenes en `/public` son accesibles directamente por URL
- No subas imágenes muy pesadas (máximo 500KB recomendado)
- Optimiza las imágenes antes de subirlas
