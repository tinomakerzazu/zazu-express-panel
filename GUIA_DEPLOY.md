# 🚀 Guía Completa de Deploy

## 📋 Checklist Pre-Deploy

Antes de comenzar, asegúrate de tener:
- [ ] Cuenta de GitHub
- [ ] Cuenta de Netlify
- [ ] Cuenta de Supabase
- [ ] Acceso a tu proyecto en cada plataforma

---

## 1️⃣ Subir Cambios a GitHub

### Paso 1: Verificar el estado de Git

```bash
# Ver qué archivos han cambiado
git status

# Ver los cambios específicos
git diff
```

### Paso 2: Agregar archivos al staging

```bash
# Agregar todos los archivos modificados y nuevos
git add .

# O agregar archivos específicos
git add netlify/functions/
git add sistema-corporacion-v2/js/
git add *.md
```

### Paso 3: Crear commit

```bash
# Crear commit con mensaje descriptivo
git commit -m "feat: Agregar autenticación JWT, sanitización y validaciones de seguridad

- Agregar autenticación JWT a todas las funciones de Netlify
- Implementar sanitización y validación de inputs
- Agregar prevención de XSS
- Mejorar manejo de errores y robustez
- Agregar validación de tamaño de archivos (10MB)
- Corregir vulnerabilidades de seguridad críticas"
```

### Paso 4: Subir a GitHub

```bash
# Si es la primera vez, crear rama y subir
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
git push -u origin main

# Si ya existe el repositorio, solo hacer push
git push origin main
```

### Paso 5: Verificar en GitHub

1. Ve a tu repositorio en GitHub
2. Verifica que todos los archivos estén subidos
3. Revisa que el commit aparezca en el historial

---

## 2️⃣ Configurar Variables de Entorno en Netlify

### Paso 1: Acceder a Netlify Dashboard

1. Ve a [https://app.netlify.com](https://app.netlify.com)
2. Inicia sesión con tu cuenta
3. Selecciona tu sitio (o crea uno nuevo)

### Paso 2: Ir a Site Settings

1. En el menú lateral, haz clic en **"Site settings"**
2. En el menú, busca **"Environment variables"**
3. Haz clic en **"Add a variable"**

### Paso 3: Agregar Variables de Entorno

Agrega las siguientes variables **UNA POR UNA**:

#### Variable 1: SUPABASE_URL
```
Key: SUPABASE_URL
Value: https://gpshetkaotreellwyicp.supabase.co
Scope: All scopes (o Production, Branch deploys, Deploy previews según necesites)
```

#### Variable 2: SUPABASE_ANON_KEY
```
Key: SUPABASE_ANON_KEY
Value: sb_publishable_XSEyzsNLdPu98SB3OiaSLA_NqUNmlVj
Scope: All scopes
```

#### Variable 3: SUPABASE_SERVICE_ROLE_KEY
```
Key: SUPABASE_SERVICE_ROLE_KEY
Value: [TU_SERVICE_ROLE_KEY_AQUI]
Scope: All scopes
```
⚠️ **IMPORTANTE:** Obtén esta clave desde Supabase Dashboard > Settings > API > service_role key

#### Variable 4: SUPABASE_BUCKET
```
Key: SUPABASE_BUCKET
Value: comprobantes
Scope: All scopes
```

### Paso 4: Verificar Variables

1. Asegúrate de que todas las variables estén guardadas
2. Verifica que el scope sea correcto (recomendado: "All scopes")

---

## 3️⃣ Configurar Supabase

### Paso 1: Acceder a Supabase Dashboard

1. Ve a [https://app.supabase.com](https://app.supabase.com)
2. Inicia sesión
3. Selecciona tu proyecto

### Paso 2: Verificar/Crear Storage Bucket

1. En el menú lateral, haz clic en **"Storage"**
2. Verifica que exista un bucket llamado **"comprobantes"**
3. Si no existe:
   - Haz clic en **"New bucket"**
   - Nombre: `comprobantes`
   - **Public bucket:** NO (recomendado para seguridad)
   - **File size limit:** 10MB
   - **Allowed MIME types:** `image/jpeg, image/png, image/webp`
   - Haz clic en **"Create bucket"**

### Paso 3: Configurar Políticas de Storage

1. Haz clic en el bucket **"comprobantes"**
2. Ve a la pestaña **"Policies"**
3. Haz clic en **"New Policy"**

#### Política 1: Permitir lectura a usuarios autenticados
```sql
Policy name: Authenticated users can read
Allowed operation: SELECT
Policy definition:
(uid() IS NOT NULL)
```

#### Política 2: Permitir inserción a usuarios autenticados
```sql
Policy name: Authenticated users can insert
Allowed operation: INSERT
Policy definition:
(uid() IS NOT NULL)
```

#### Política 3: Permitir actualización a usuarios autenticados
```sql
Policy name: Authenticated users can update
Allowed operation: UPDATE
Policy definition:
(uid() IS NOT NULL)
```

#### Política 4: Permitir eliminación a usuarios autenticados
```sql
Policy name: Authenticated users can delete
Allowed operation: DELETE
Policy definition:
(uid() IS NOT NULL)
```

### Paso 4: Verificar Row Level Security (RLS)

1. Ve a **"Table Editor"** en el menú lateral
2. Para cada tabla (`comprobantes_lima`, `comprobantes_provincia`, `comprobantes_caja`):
   - Haz clic en la tabla
   - Ve a la pestaña **"Policies"**
   - Verifica que RLS esté habilitado
   - Si no está habilitado:
     - Haz clic en **"Enable RLS"**
     - Crea políticas similares a las de Storage

### Paso 5: Verificar Autenticación

1. Ve a **"Authentication"** en el menú lateral
2. Verifica que **"Enable Email Signup"** esté activado
3. Verifica la configuración de **"Email Templates"** si es necesario

---

## 4️⃣ Conectar Netlify con GitHub

### Paso 1: En Netlify Dashboard

1. Ve a **"Site settings"**
2. Haz clic en **"Build & deploy"**
3. En **"Continuous Deployment"**, haz clic en **"Link to Git provider"**
4. Selecciona **GitHub**
5. Autoriza Netlify a acceder a tu cuenta de GitHub
6. Selecciona tu repositorio

### Paso 2: Configurar Build Settings

En **"Build & deploy"** > **"Build settings"**:

```
Build command: (dejar vacío - no hay build necesario)
Publish directory: sistema-corporacion-v2
```

### Paso 3: Configurar Functions Directory

En **"Build & deploy"** > **"Functions"**:

```
Functions directory: netlify/functions
```

### Paso 4: Guardar y Deploy

1. Haz clic en **"Save"**
2. Netlify comenzará automáticamente un deploy
3. Espera a que termine (puede tomar 1-2 minutos)

---

## 5️⃣ Verificar el Deploy

### Paso 1: Revisar Logs de Deploy

1. En Netlify Dashboard, ve a **"Deploys"**
2. Haz clic en el deploy más reciente
3. Revisa los logs para verificar que no haya errores

### Paso 2: Probar la Aplicación

1. Haz clic en la URL de tu sitio (ej: `https://zazu-express.netlify.app`)
2. Prueba el login:
   - Debe redirigir si no estás autenticado
   - Debe funcionar con credenciales válidas
3. Prueba subir un comprobante:
   - Debe validar el tamaño del archivo
   - Debe guardar correctamente en Supabase

### Paso 3: Verificar Funciones de Netlify

1. Ve a **"Functions"** en Netlify Dashboard
2. Verifica que todas las funciones estén listadas:
   - `clientes`
   - `cobranzas`
   - `eventos`
   - `pagos`
   - `prestamos`
3. Haz clic en una función para ver sus logs

---

## 6️⃣ Troubleshooting

### Problema: "No autorizado" en todas las peticiones

**Solución:**
1. Verifica que `SUPABASE_ANON_KEY` esté configurada correctamente
2. Verifica que el token se esté enviando en las peticiones (revisa Network tab en DevTools)
3. Verifica que el usuario esté autenticado

### Problema: "Configuración de Supabase incompleta"

**Solución:**
1. Verifica que todas las variables de entorno estén configuradas
2. Verifica que los nombres sean exactos (case-sensitive)
3. Haz un redeploy después de agregar variables

### Problema: Archivos no se suben

**Solución:**
1. Verifica que el bucket `comprobantes` exista en Supabase
2. Verifica que `SUPABASE_BUCKET` esté configurado
3. Verifica las políticas de acceso del bucket

### Problema: Funciones no aparecen

**Solución:**
1. Verifica que el directorio de funciones sea `netlify/functions`
2. Verifica que los archivos tengan la extensión `.js`
3. Verifica que cada función exporte `exports.handler`

---

## 7️⃣ Comandos Rápidos de Git

```bash
# Ver estado
git status

# Agregar todos los cambios
git add .

# Crear commit
git commit -m "tu mensaje"

# Subir cambios
git push origin main

# Ver historial
git log --oneline

# Ver diferencias
git diff
```

---

## 8️⃣ Checklist Final

Antes de considerar el deploy completo:

- [ ] Todos los cambios están en GitHub
- [ ] Variables de entorno configuradas en Netlify
- [ ] Bucket de storage creado en Supabase
- [ ] Políticas de RLS configuradas
- [ ] Deploy completado sin errores
- [ ] Login funciona correctamente
- [ ] Subida de archivos funciona
- [ ] Autenticación funciona en todas las funciones
- [ ] Validaciones funcionan (tamaño de archivo, etc.)

---

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs en Netlify Dashboard
2. Revisa la consola del navegador (F12)
3. Revisa los logs de Supabase
4. Consulta la documentación:
   - `SECURITY_AUDIT.md`
   - `DEPLOYMENT_CHECKLIST.md`

---

**¡Listo! Tu aplicación debería estar funcionando de forma segura en producción.** 🎉
