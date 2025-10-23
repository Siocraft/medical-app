# Medical App

Una aplicación frontend moderna y responsive en React para gestionar registros médicos. Permite a los pacientes ver de forma segura su información médica, citas, historia clínica y medicamentos. Construida con React 19, TypeScript y Vite para un rendimiento óptimo.

**Repositorio:** [https://github.com/Siocraft/medical-app](https://github.com/Siocraft/medical-app)

**Organización:** [Siocraft](https://github.com/Siocraft)

## Características

- **Autenticación Segura** - Sistema de login y registro basado en JWT
- **Dashboard de Paciente** - Vista completa de registros médicos y datos de salud
- **Historia Médica** - Explorar citas pasadas y registros clínicos
- **Gestión de Alergias** - Seguimiento y visualización de alergias del paciente
- **Medicamentos** - Ver prescripciones actuales e historia de medicamentos
- **Diseño Responsive** - Optimizado para escritorio, tablet y dispositivos móviles
- **Internacionalización** - Soporte multiidioma con i18next
- **UI Profesional** - Interfaz limpia y confiable con temática médica
- **Datos en Tiempo Real** - TanStack Query para obtención y caché eficiente de datos

## Stack Tecnológico

- **React 19** - Biblioteca UI moderna con últimas características
- **TypeScript** - Seguridad de tipos y mejor experiencia de desarrollo
- **Vite** - Herramienta de construcción y servidor dev ultrarrápido
- **React Router DOM** - Enrutamiento y navegación del lado del cliente
- **TanStack Query** - Obtención, caché y sincronización de datos
- **Axios** - Cliente HTTP para comunicación con API
- **Formik** - Gestión de estado de formularios y validación
- **i18next** - Framework de internacionalización
- **Lucide React** - Biblioteca de iconos hermosa y consistente
- **JWT Decode** - Parseo y validación de tokens

## Comenzar

### Prerrequisitos

- Node.js 18+ y npm
- La API backend medical-api ejecutándose (por defecto: http://localhost:3000)

#### Instalación de Node.js y npm

Si aún no tienes Node.js instalado, sigue estas instrucciones:

**Opción 1: Instalación Oficial (Recomendado para principiantes)**

1. **Descargar Node.js:**
   - Visita [https://nodejs.org](https://nodejs.org)
   - Descarga la versión LTS (Long Term Support) - actualmente v18 o superior
   - Ejecuta el instalador y sigue las instrucciones en pantalla

2. **Verificar la instalación:**
   ```bash
   node --version    # Debe mostrar v18.x.x o superior
   npm --version     # Debe mostrar 9.x.x o superior
   ```

**Opción 2: Usando un Gestor de Versiones**

Para macOS/Linux - usando nvm (Node Version Manager):
```bash
# Instalar nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Recargar el shell
source ~/.bashrc  # o ~/.zshrc si usas zsh

# Instalar Node.js versión 18
nvm install 18
nvm use 18
nvm alias default 18

# Verificar instalación
node --version
npm --version
```

Para Windows - usando nvm-windows:
```bash
# Descargar e instalar nvm-windows desde:
# https://github.com/coreybutler/nvm-windows/releases

# Después de instalar, abrir PowerShell o CMD como administrador:
nvm install 18
nvm use 18

# Verificar instalación
node --version
npm --version
```

**Instalación por Sistema Operativo:**

- **macOS:**
  ```bash
  # Opción 1: Usando Homebrew
  brew install node@18

  # Opción 2: Descargar el instalador PKG desde nodejs.org
  ```

- **Ubuntu/Debian Linux:**
  ```bash
  # Usando el repositorio NodeSource
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  sudo apt-get install -y nodejs

  # Verificar
  node --version
  npm --version
  ```

- **Windows:**
  - Opción 1: Descargar el instalador MSI desde [nodejs.org](https://nodejs.org)
  - Opción 2: Usar el gestor de paquetes Chocolatey:
    ```bash
    choco install nodejs-lts
    ```
  - Después de instalar, reinicia la terminal/PowerShell

**Solución de problemas comunes:**

- **"npm: command not found":** Reinicia tu terminal después de instalar Node.js
- **Errores de permisos en Linux/macOS:** No uses `sudo` con npm. Configura un directorio de usuario:
  ```bash
  mkdir ~/.npm-global
  npm config set prefix '~/.npm-global'
  echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
  source ~/.bashrc
  ```
- **Versión antigua de Node:** Actualiza usando el instalador oficial o un gestor de versiones

### Instalación

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno:**

   Copiar el archivo de entorno de ejemplo:
   ```bash
   cp .env.example .env
   ```

   Editar `.env` y configurar la URL de tu API backend:
   ```env
   VITE_API_URL=http://localhost:3000
   ```

   Para producción:
   ```env
   VITE_API_URL=https://tu-api-produccion.com
   ```

3. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

   La aplicación estará disponible en `http://localhost:5173`

## Scripts Disponibles

- `npm run dev` - Iniciar servidor de desarrollo con hot module replacement
- `npm start` - Alias para `npm run dev`
- `npm run build` - Construir para producción (salida a `dist/`)
- `npm run preview` - Previsualizar build de producción localmente
- `npm run lint` - Ejecutar ESLint para verificar calidad del código

## Estructura del Proyecto

```
src/
├── components/          # Componentes UI reutilizables
│   ├── ProtectedRoute.tsx   # Wrapper de autenticación de rutas
│   ├── Navbar.tsx           # Barra de navegación
│   ├── Sidebar.tsx          # Navegación lateral
│   └── ...
│
├── pages/              # Componentes de página (rutas)
│   ├── Login.tsx           # Página de login
│   ├── Register.tsx        # Página de registro
│   ├── Dashboard.tsx       # Dashboard de paciente
│   ├── MedicalHistory.tsx  # Vista de historia médica
│   └── ...
│
├── contexts/           # Proveedores de Contexto de React
│   └── AuthContext.tsx     # Gestión de estado de autenticación
│
├── services/           # Capa de servicio de API
│   ├── api.ts              # Configuración de instancia Axios
│   ├── authService.ts      # Llamadas a API de autenticación
│   ├── patientService.ts   # Llamadas a API de datos de paciente
│   └── ...
│
├── hooks/              # Hooks personalizados de React
│   ├── useAuth.ts          # Hook de autenticación
│   └── ...
│
├── types/              # Definiciones de tipos TypeScript
│   └── index.ts            # Tipos e interfaces compartidos
│
├── i18n/               # Internacionalización
│   ├── config.ts           # Configuración de i18next
│   └── locales/           # Archivos de traducción
│
├── utils/              # Funciones auxiliares y utilidades
│
├── assets/             # Recursos estáticos (imágenes, fuentes, etc.)
│
├── App.tsx             # Componente principal de la aplicación
├── main.tsx            # Punto de entrada de la aplicación
└── index.css           # Estilos globales
```

## Descripción de Características

### Sistema de Autenticación

- **Registro** - Registro con email y contraseña con validación de formulario
- **Login** - Autenticación segura con tokens JWT
- **Rutas Protegidas** - Redirección automática a login para usuarios no autenticados
- **Gestión de Tokens** - Almacenamiento automático de tokens y manejo de refresh
- **Logout** - Terminación segura de sesión

### Dashboard de Paciente

El dashboard principal proporciona:
- Tarjetas de resumen con estadísticas de salud
- Citas recientes y próximas visitas
- Acceso rápido a registros médicos
- Resumen de alergias
- Lista de medicamentos actuales
- Barra lateral responsive para navegación
- Menú hamburguesa amigable para móviles

### Gestión de Datos

- **Actualizaciones en Tiempo Real** - TanStack Query maneja obtención y caché de datos
- **Manejo de Errores** - Mensajes de error amigables para fallos de API
- **Estados de Carga** - Indicadores de carga suaves durante obtención de datos
- **Actualizaciones Optimistas** - Retroalimentación instantánea en UI para acciones del usuario

## Integración con API

La aplicación se comunica con el backend medical-api a través de una arquitectura de capa de servicio.

### Configuración Base

```typescript
// src/services/api.ts
const API_URL = import.meta.env.VITE_API_URL;
```

### Endpoints Principales Utilizados

- `POST /auth/login` - Autenticación de usuario
- `POST /auth/register` - Registro de nuevo usuario
- `GET /auth/profile` - Obtener perfil de usuario actual
- `GET /patients/me` - Obtener datos de paciente autenticado
- `GET /calendar-events` - Obtener citas
- `GET /clinical-history` - Obtener historia médica

### Flujo de Autenticación

1. Usuario inicia sesión vía formulario de login
2. API retorna token JWT
3. Token almacenado en localStorage
4. Token incluido en todas las peticiones subsecuentes vía interceptor de Axios
5. Logout automático en expiración de token o errores 401

## Seguridad

- **Autenticación JWT** - Autenticación segura basada en tokens
- **Almacenamiento de Tokens** - Tokens almacenados en localStorage
- **Auto Logout** - Terminación automática de sesión en expiración de token
- **Rutas Protegidas** - Guards de ruta previenen acceso no autorizado
- **Manejo de CORS** - Compartición adecuada de recursos de origen cruzado con backend
- **Protección XSS** - Prevención XSS integrada de React
- **Validación de Entrada** - Validación de formularios con Formik

## Internacionalización

La aplicación soporta múltiples idiomas usando i18next:

```typescript
// Cambiar idioma
i18n.changeLanguage('es'); // Español
i18n.changeLanguage('en'); // Inglés
```

La detección de idioma es automática basada en configuración del navegador.

## Estilos

- **CSS Personalizado** - Diseño personalizado con temática médica
- **Diseño Responsive** - Enfoque mobile-first
- **Variables CSS** - Tematización consistente en toda la aplicación
- **Paleta Profesional** - Esquema de colores médico que genera confianza

## Desarrollo

### Ejecutar en Modo Desarrollo

```bash
npm run dev
```

Características:
- Hot module replacement (HMR)
- Fast refresh para componentes React
- Source maps para debugging
- Overlay detallado de errores

### Variables de Entorno

Desarrollo (`.env`):
```env
VITE_API_URL=http://localhost:3000
```

Producción (`.env.production`):
```env
VITE_API_URL=https://api.tuaplicacionmedica.com
```

### Calidad de Código

```bash
npm run lint  # Verificar problemas de código
```

El proyecto usa ESLint con soporte para TypeScript y reglas específicas de React.

## Construir para Producción

### Crear Build de Producción

```bash
npm run build
```

Este comando:
1. Ejecuta el compilador de TypeScript
2. Empaqueta la aplicación con Vite
3. Optimiza recursos y código
4. Genera salida en carpeta `dist/`

### Previsualizar Build de Producción

```bash
npm run preview
```

Prueba el build de producción localmente antes del despliegue.

## Despliegue

### Hosting de Archivos Estáticos

La aplicación construida (carpeta `dist/`) puede desplegarse en cualquier servicio de hosting estático:

- **Netlify**
  ```bash
  # Instalar Netlify CLI
  npm install -g netlify-cli

  # Desplegar
  netlify deploy --prod --dir=dist
  ```

- **Vercel**
  ```bash
  # Instalar Vercel CLI
  npm install -g vercel

  # Desplegar
  vercel --prod
  ```

- **AWS S3 + CloudFront**
  ```bash
  # Subir a S3
  aws s3 sync dist/ s3://nombre-tu-bucket

  # Invalidar caché de CloudFront
  aws cloudfront create-invalidation --distribution-id TU_ID --paths "/*"
  ```

- **Nginx**
  ```nginx
  server {
    listen 80;
    server_name tu-dominio.com;
    root /var/www/medical-app/dist;
    index index.html;

    location / {
      try_files $uri $uri/ /index.html;
    }
  }
  ```

### Archivos a Desplegar

Incluir solo el contenido de la carpeta `dist/`:
- `index.html`
- `assets/` (JS y CSS compilados)
- Cualquier archivo en `public/`

No desplegar:
- Directorio `src/`
- `node_modules/`
- Archivos `.env`
- Archivos de configuración
- Directorio `.git/`

### Configuración de Entorno

Configurar variables de entorno de producción antes de construir:

```bash
# Opción 1: Usar archivo .env.production
echo "VITE_API_URL=https://api.produccion.com" > .env.production
npm run build

# Opción 2: Configurar inline
VITE_API_URL=https://api.produccion.com npm run build
```

## Solución de Problemas

### Problemas de Conexión a API

- Verificar que `VITE_API_URL` en `.env` sea correcto
- Asegurar que la API backend esté ejecutándose y accesible
- Revisar consola del navegador para errores CORS
- Verificar conectividad de red

### Fallos de Build

```bash
# Limpiar node_modules y caché
rm -rf node_modules dist .vite
npm install
npm run build
```

### Puerto Ya en Uso

```bash
# Vite intentará automáticamente el siguiente puerto disponible
# O especificar un puerto personalizado
npm run dev -- --port 3001
```

### Errores de TypeScript

```bash
# Verificar compilación de TypeScript
npx tsc --noEmit
```

## Realizar Cambios

### Agregar una Nueva Página

1. Crear componente en `src/pages/TuPagina.tsx`
2. Agregar ruta en `src/App.tsx`:
   ```typescript
   <Route path="/tu-ruta" element={<TuPagina />} />
   ```
3. Agregar enlace de navegación si es necesario

### Agregar un Nuevo Servicio de API

1. Crear archivo de servicio en `src/services/tuServicio.ts`
2. Importar instancia de API desde `src/services/api.ts`
3. Exportar funciones de servicio:
   ```typescript
   export const obtenerTusDatos = async () => {
     const response = await api.get('/tu-endpoint');
     return response.data;
   };
   ```

### Agregar Rutas Protegidas

Envolver rutas con componente ProtectedRoute:
```typescript
<Route
  path="/protegida"
  element={
    <ProtectedRoute>
      <TuComponente />
    </ProtectedRoute>
  }
/>
```

### Modificar Estilos

- Estilos globales: Editar `src/index.css`
- Estilos de componente: Agregar módulo CSS o estilos inline
- Colores de tema: Actualizar variables CSS en estilos raíz

## Soporte de Navegadores

- Chrome (últimas 2 versiones)
- Firefox (últimas 2 versiones)
- Safari (últimas 2 versiones)
- Edge (últimas 2 versiones)
- Navegadores móviles (iOS Safari, Chrome Mobile)

## Rendimiento

- División de código para tamaño óptimo de bundle
- Carga diferida de rutas
- Optimización de imágenes
- Caché de TanStack Query reduce llamadas a API
- Salida de build optimizada de Vite

## Mejoras Futuras

- Interfaz de portal para doctores/médicos
- Funcionalidad de reserva de citas
- Notificaciones en tiempo real con WebSockets
- Carga y visualización de documentos
- Integración de resultados de laboratorio
- Solicitudes de renovación de recetas
- Característica de consulta por video
- Soporte de modo oscuro
- Accesibilidad mejorada (WCAG 2.1)

## Licencia

Privado - Todos los derechos reservados

## Soporte

Para problemas, preguntas o solicitudes de características, contacta al equipo de desarrollo.
