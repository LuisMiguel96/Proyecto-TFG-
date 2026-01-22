# Estilos del Proyecto

Esta carpeta contiene todos los archivos CSS organizados por componentes y páginas.

## Estructura:

```
src/
├── styles/              # Todos los estilos del proyecto
│   ├── Home.css         # Página de inicio
│   ├── Login.css        # Página de login
│   ├── Activities.css   # Página de actividades
│   └── ActivityDetail.css # Página de detalle de actividad
├── pages/               # Solo archivos JSX
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Activities.jsx
│   ├── ActivityDetail.jsx
│   └── StravaCallback.jsx
└── components/          # Componentes con sus CSS
    ├── Navbar.jsx / Navbar.css
    └── ActivityCard.jsx / ActivityCard.css
```

## Notas:
- Todos los CSS de páginas se han centralizado en esta carpeta
- Los CSS globales están en `src/index.css` y `src/App.css`
- Los componentes mantienen sus CSS junto a ellos en `/components/`
- Importación desde páginas: `import '../styles/NombreArchivo.css'`
