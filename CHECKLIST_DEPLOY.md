# ✅ Checklist Rápido de Deploy

## 📦 1. GitHub (5 minutos)

- [ ] Abrir terminal en la carpeta del proyecto
- [ ] Ejecutar: `git status` (ver cambios)
- [ ] Ejecutar: `git add .` (agregar cambios)
- [ ] Ejecutar: `git commit -m "feat: Seguridad completa - JWT, sanitización, validaciones"`
- [ ] Ejecutar: `git push origin main` (subir a GitHub)
- [ ] Verificar en GitHub que los archivos estén subidos

---

## 🔧 2. Netlify - Variables de Entorno (10 minutos)

### Ir a: Site settings > Environment variables

Agregar estas 4 variables:

- [ ] **SUPABASE_URL** = `https://gpshetkaotreellwyicp.supabase.co`
- [ ] **SUPABASE_ANON_KEY** = `sb_publishable_XSEyzsNLdPu98SB3OiaSLA_NqUNmlVj`
- [ ] **SUPABASE_SERVICE_ROLE_KEY** = `[Obtener de Supabase Dashboard > Settings > API]`
- [ ] **SUPABASE_BUCKET** = `comprobantes`

### Configurar Build Settings:

- [ ] **Publish directory:** `sistema-corporacion-v2`
- [ ] **Functions directory:** `netlify/functions`
- [ ] **Build command:** (dejar vacío)

### Conectar con GitHub:

- [ ] Ir a: Site settings > Build & deploy
- [ ] Clic en "Link to Git provider"
- [ ] Seleccionar GitHub y autorizar
- [ ] Seleccionar tu repositorio
- [ ] Guardar cambios

---

## 🗄️ 3. Supabase (15 minutos)

### Storage:

- [ ] Ir a: Storage en Supabase Dashboard
- [ ] Verificar que existe bucket `comprobantes`
- [ ] Si no existe, crear con:
  - Nombre: `comprobantes`
  - Public: NO
  - File size limit: 10MB
  - MIME types: `image/jpeg, image/png, image/webp`

### Políticas de Storage:

- [ ] Crear política: "Authenticated users can read" (SELECT)
- [ ] Crear política: "Authenticated users can insert" (INSERT)
- [ ] Crear política: "Authenticated users can update" (UPDATE)
- [ ] Crear política: "Authenticated users can delete" (DELETE)

### Row Level Security (RLS):

- [ ] Ir a: Table Editor
- [ ] Para cada tabla (`comprobantes_lima`, `comprobantes_provincia`, `comprobantes_caja`):
  - [ ] Verificar que RLS esté habilitado
  - [ ] Si no, habilitar y crear políticas similares a Storage

### Autenticación:

- [ ] Ir a: Authentication
- [ ] Verificar que "Enable Email Signup" esté activado

---

## 🚀 4. Verificar Deploy (5 minutos)

- [ ] Ir a Netlify Dashboard > Deploys
- [ ] Esperar a que el deploy termine (verde)
- [ ] Revisar logs por errores
- [ ] Abrir la URL del sitio
- [ ] Probar login
- [ ] Probar subir un comprobante
- [ ] Verificar que las funciones aparecen en Netlify > Functions

---

## ⚠️ Si algo falla:

1. **"No autorizado"**: Verificar variables de entorno en Netlify
2. **Archivos no suben**: Verificar bucket y políticas en Supabase
3. **Funciones no aparecen**: Verificar directorio de funciones
4. **Errores en deploy**: Revisar logs en Netlify

---

## 📞 Archivos de Ayuda:

- `GUIA_DEPLOY.md` - Guía completa y detallada
- `COMANDOS_DEPLOY.md` - Comandos de Git
- `DEPLOYMENT_CHECKLIST.md` - Checklist técnico detallado

---

**Tiempo total estimado: 35 minutos** ⏱️
