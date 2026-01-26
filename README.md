# Mi Calendario de Tareas

Una hermosa app de calendario con notas y tareas, diseñada con colores pasteles comfy.

## Características

✨ **Calendario interactivo** - Visualiza todo el mes de un vistazo
📝 **Tareas y notas** - Anota todo lo que hiciste en cada día
🎨 **Diseño pastel** - Colores suave: rosas, amarillos y verdes
✏️ **Editar y eliminar** - Administra tus tareas fácilmente
☑️ **Marcar completadas** - Marca las tareas como hecho
💾 **Datos persistentes** - Todo se guarda automáticamente

## Requisitos

- Node.js (v14 o superior)
- npm o yarn

## Instalación

1. Clona o abre el proyecto
2. Instala las dependencias:
```bash
npm install
```

3. Copia el archivo `.env.example` a `.env.local` y agrega tus credenciales de Supabase (opcional):
```bash
cp .env.example .env.local
```

## Desarrollo

Para ejecutar en modo desarrollo:
```bash
npm run dev
```

Luego abre http://localhost:5173 en tu navegador.

## Uso

### Ver tareas de un día
- Haz click en cualquier día del calendario
- Se abrirá un modal con las tareas y notas de ese día

### Agregar una tarea
1. Haz click en el día
2. Ingresa el título de la tarea
3. Agrega notas (opcional)
4. Haz click en "Agregar tarea"

### Editar una tarea
- Haz click en el botón ✏️ para editar el título
- O haz click directamente en la tarea

### Marcar como completada
- Haz click en el checkbox a la izquierda de la tarea

### Eliminar una tarea
- Haz click en el botón 🗑️

## Almacenamiento

Por defecto, la app usa **localStorage** (almacenamiento local del navegador).

### Opción: Usar Supabase (base de datos en la nube)

Si quieres que tus datos se sincronicen en múltiples dispositivos:

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. En el dashboard, ve a Settings > API
4. Copia tu `Project URL` y `anon public` key
5. Pega estas credenciales en tu `.env.local`

## Build para producción

```bash
npm run build
```

Esto creará una carpeta `dist` lista para desplegar.

## Tecnologías usadas

- **React** - Framework de UI
- **Vite** - Build tool y dev server
- **React Calendar** - Componente de calendario
- **Supabase** - Base de datos en la nube (opcional)
- **Lucide React** - Iconos
- **CSS personalizado** - Estilos comfy con gradientes

## Estructura del proyecto

```
src/
├── components/
│   ├── Calendar.jsx      # Componente principal del calendario
│   └── TaskModal.jsx     # Modal para ver/editar tareas
├── lib/
│   └── supabase.js       # Configuración de Supabase
├── styles/
│   ├── global.css        # Estilos globales y colores
│   ├── calendar.css      # Estilos del calendario
│   └── modal.css         # Estilos del modal
├── App.jsx               # Componente raíz
└── main.jsx              # Punto de entrada
```

## Próximas mejoras

- [ ] Integración completa con Supabase
- [ ] Sincronización en tiempo real
- [ ] Notificaciones de tareas
- [ ] Categorías para tareas
- [ ] Exportar datos a PDF
- [ ] Tema oscuro (dark mode)

## Licencia

Libre para usar y modificar.

---

**Hecho con ❤️ en colores pasteles**
