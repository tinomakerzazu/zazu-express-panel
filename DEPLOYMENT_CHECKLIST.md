# Checklist de Despliegue - Sistema de Comprobantes

## ⚠️ ANTES DE DESPLEGAR - Configuración Requerida

### 1. Variables de Entorno en Netlify

Configurar en: **Site settings > Build & deploy > Environment variables**

#### Variables Requeridas:
```
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-clave-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
SUPABASE_BUCKET=comprobantes
```

#### Cómo obtener las claves:
1. Ve a tu proyecto en Supabase Dashboard
2. Settings > API
3. Copia:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ MANTENER SECRETO)

### 2. Verificar Políticas RLS en Supabase

Asegurar que las tablas tengan Row Level Security habilitado:

```sql
-- Ejemplo para comprobantes_lima
ALTER TABLE comprobantes_lima ENABLE ROW LEVEL SECURITY;

-- Política para que usuarios autenticados puedan leer sus propios datos
CREATE POLICY "Usuarios autenticados pueden leer"
ON comprobantes_lima FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Política para que usuarios autenticados puedan insertar
CREATE POLICY "Usuarios autenticados pueden insertar"
ON comprobantes_lima FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);
```

### 3. Configurar Storage Bucket en Supabase

1. Ve a Storage en Supabase Dashboard
2. Crea un bucket llamado `comprobantes` (o el nombre que configuraste)
3. Configura políticas de acceso:
   - **Public**: No (recomendado para seguridad)
   - **File size limit**: 10MB
   - **Allowed MIME types**: image/jpeg, image/png, image/webp

### 4. Verificar Autenticación

1. Asegurar que el login funciona correctamente
2. Verificar que los tokens se generan y envían correctamente
3. Probar que las funciones rechazan peticiones sin token

## ✅ Verificaciones Post-Despliegue

### Funcionalidad
- [ ] Login funciona correctamente
- [ ] Los comprobantes se guardan en Supabase
- [ ] Las imágenes se suben correctamente
- [ ] Los reportes se generan correctamente
- [ ] La sincronización entre zonas funciona

### Seguridad
- [ ] Las funciones rechazan peticiones sin token (401)
- [ ] Los archivos grandes (>10MB) son rechazados
- [ ] No hay credenciales expuestas en el código del cliente
- [ ] HTTPS está habilitado (Netlify lo hace por defecto)

### Performance
- [ ] Las imágenes se comprimen antes de subir
- [ ] No hay errores en la consola del navegador
- [ ] Los tiempos de carga son aceptables

## 🔧 Troubleshooting

### Error: "No autorizado" en todas las peticiones
- Verificar que `SUPABASE_ANON_KEY` está configurada correctamente
- Verificar que el token se envía en el header `Authorization`
- Revisar que el usuario está autenticado

### Error: "Configuración de Supabase incompleta"
- Verificar que todas las variables de entorno están configuradas
- Verificar que los nombres de las variables son correctos (case-sensitive)

### Archivos no se suben
- Verificar que el bucket existe en Supabase
- Verificar que `SUPABASE_BUCKET` está configurado
- Verificar políticas de acceso del bucket

## 📝 Notas Importantes

1. **NUNCA** commitees las variables de entorno al repositorio
2. **NUNCA** uses el Service Role Key en el cliente
3. Mantén las dependencias actualizadas
4. Realiza backups periódicos de la base de datos
