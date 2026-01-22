# Assets - Imágenes del Proyecto

## Actualmente:
El proyecto usa imágenes de **Unsplash** directamente mediante URLs. Esto es perfecto para desarrollo y no requiere descargar imágenes.

## Si prefieres usar imágenes locales:

### cycling-hero.jpg
- **Descripción:** Imagen principal de ciclismo para el hero section
- **Tamaño recomendado:** 1400x400px
- **Formato:** JPG o PNG

**Para usar imagen local:**

1. Descarga una imagen de ciclismo desde:
   - https://unsplash.com/s/photos/cycling
   - https://www.pexels.com/search/cycling/

2. Guárdala como `cycling-hero.jpg` en esta carpeta

3. Modifica `Home.jsx`:
   ```javascript
   // Cambiar de:
   const cyclingImage = "https://images.unsplash.com/..."
   
   // A:
   import cyclingHeroImg from '../assets/cycling-hero.jpg'
   const cyclingImage = cyclingHeroImg
   ```

## Ventajas de usar URLs de Unsplash:
✅ No ocupan espacio en el repositorio  
✅ No se suben a Git  
✅ Imágenes profesionales de alta calidad  
✅ Funcionan inmediatamente sin configuración

