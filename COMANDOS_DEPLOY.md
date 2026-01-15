# 🚀 Comandos Rápidos para Deploy

## Git - Subir Cambios a GitHub

```bash
# 1. Ver qué ha cambiado
git status

# 2. Agregar todos los cambios
git add .

# 3. Crear commit con mensaje descriptivo
git commit -m "feat: Agregar seguridad completa - autenticación JWT, sanitización y validaciones"

# 4. Subir a GitHub
git push origin main
```

## Si es la primera vez configurando Git:

```bash
# Configurar usuario (si no lo has hecho)
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"

# Inicializar repositorio (si no existe)
git init

# Agregar remote (reemplaza con tu URL)
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git

# Crear rama main y subir
git branch -M main
git push -u origin main
```

## Verificar cambios antes de subir:

```bash
# Ver archivos modificados
git status

# Ver diferencias específicas
git diff

# Ver historial de commits
git log --oneline
```

## Si necesitas deshacer cambios:

```bash
# Descartar cambios en un archivo específico
git checkout -- nombre-archivo.js

# Descartar todos los cambios no commiteados
git reset --hard HEAD

# Deshacer último commit (mantener cambios)
git reset --soft HEAD~1
```
