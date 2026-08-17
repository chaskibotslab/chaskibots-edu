// ============================================================
// SEED: Curso completo de Linux para ChaskiBots Academy
// Ejecutar: node scripts/seed-linux-course.js
// Requiere: SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local
// ============================================================
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Cargar .env.local
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  envContent.split('\n').forEach(line => {
    const [key, ...vals] = line.split('=')
    if (key && vals.length) {
      process.env[key.trim()] = vals.join('=').trim()
    }
  })
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// ============================================================
// COURSE DATA
// ============================================================
const COURSE = {
  slug: 'linux',
  title: 'Linux Terminal & Ciberseguridad',
  description: 'Domina la terminal de Linux, comandos esenciales, administración de sistemas y fundamentos de hacking ético.',
  icon: '🐧',
  color: '#22c55e',
  is_active: true,
  sort_order: 2,
}

const MODULES = [
  {
    slug: 'navegacion-basica',
    title: 'Navegación Básica',
    description: 'Aprende a moverte por el sistema de archivos de Linux como un profesional.',
    icon: '📂',
    sort_order: 1,
    lessons: [
      {
        slug: 'tu-primera-terminal',
        title: 'Tu Primera Terminal',
        description: 'Conoce la terminal de Linux, el prompt y cómo interactuar con el sistema.',
        difficulty: 'easy',
        estimated_minutes: 10,
        sort_order: 1,
        theory: `# Tu Primera Terminal

## ¿Qué es la Terminal?

La **terminal** (también llamada consola o shell) es una interfaz de texto que te permite comunicarte directamente con el sistema operativo.

## El Prompt

Cuando abres una terminal, ves algo así:

\`\`\`
hacker@chaskibots:~$
\`\`\`

Esto se llama **prompt** y tiene partes importantes:
- **hacker** → tu nombre de usuario
- **chaskibots** → nombre del equipo
- **~** → directorio actual (~ = tu carpeta personal)
- **$** → indica usuario normal (# = root/administrador)

## ¿Por qué usar la Terminal?

- Es **más rápida** que la interfaz gráfica
- Permite **automatizar** tareas repetitivas
- Es **esencial** para ciberseguridad y administración de servidores
- Los hackers éticos la usan todos los días

## Tu primer comando

Escribe \`whoami\` y presiona Enter. Este comando te dice quién eres en el sistema.`,
        examples: [
          { title: 'Ver tu usuario', code: 'whoami', explanation: 'Muestra el nombre del usuario actual en el sistema' },
          { title: 'Ver fecha y hora', code: 'date', explanation: 'Muestra la fecha y hora actual del sistema' },
          { title: 'Ver información del sistema', code: 'uname -a', explanation: 'Muestra información completa del sistema operativo' },
          { title: 'Tiempo encendido', code: 'uptime', explanation: 'Muestra cuánto tiempo lleva encendido el servidor' },
        ],
        challenges: [
          {
            title: '¿Quién soy?',
            description: 'Ejecuta el comando para ver tu nombre de usuario en el sistema.',
            starter_code: 'whoami',
            expected_output: 'hacker',
            hints: ['El comando es muy simple: whoami', 'No necesita argumentos adicionales'],
          },
          {
            title: 'Información del sistema',
            description: 'Averigua qué versión de Linux estamos usando con todos los detalles.',
            starter_code: 'uname -a',
            expected_output: 'Linux',
            hints: ['Usa el comando uname', 'La flag -a muestra toda la información'],
          },
        ],
      },
      {
        slug: 'listando-archivos',
        title: 'Listando Archivos con ls',
        description: 'Aprende a ver qué hay en las carpetas del sistema con el poderoso comando ls.',
        difficulty: 'easy',
        estimated_minutes: 12,
        sort_order: 2,
        theory: `# Listando Archivos con ls

## El comando ls

\`ls\` (list) es uno de los comandos más usados en Linux. Muestra el contenido de un directorio.

## Opciones más usadas

- \`ls\` → lista simple
- \`ls -l\` → lista detallada (permisos, tamaño, fecha)
- \`ls -a\` → muestra archivos ocultos (empiezan con .)
- \`ls -la\` → combina ambas opciones

## Entendiendo ls -l

\`\`\`
drwxr-xr-x 1 hacker hacker 4096 Jun 15 10:00 documentos/
-rw-r--r-- 1 hacker hacker  256 Jun 15 10:00 notas.txt
\`\`\`

- **d** → es directorio (- = archivo)
- **rwx** → permisos del dueño (read, write, execute)
- **r-x** → permisos del grupo
- **r-x** → permisos de otros
- **hacker hacker** → usuario y grupo dueño
- **4096** → tamaño en bytes

## Archivos ocultos

En Linux, los archivos que empiezan con punto (.) están ocultos:
- \`.ssh\` → carpeta de claves SSH
- \`.bashrc\` → configuración de la terminal
- \`.config\` → configuraciones de apps`,
        examples: [
          { title: 'Lista simple', code: 'ls', explanation: 'Muestra archivos y carpetas del directorio actual' },
          { title: 'Lista detallada', code: 'ls -l', explanation: 'Muestra permisos, dueño, tamaño y fecha de cada archivo' },
          { title: 'Mostrar ocultos', code: 'ls -la', explanation: 'Lista detallada incluyendo archivos ocultos (los que empiezan con .)' },
          { title: 'Listar otro directorio', code: 'ls /etc', explanation: 'Puedes ver el contenido de cualquier carpeta sin moverte a ella' },
        ],
        challenges: [
          {
            title: 'Explora tu carpeta',
            description: 'Lista todos los archivos de tu carpeta personal, incluyendo los ocultos, con detalles.',
            starter_code: 'ls -la',
            expected_output: '.ssh',
            hints: ['Combina las flags -l y -a', 'Deberías ver carpetas como .ssh y documentos'],
          },
          {
            title: 'Investiga /etc',
            description: 'El directorio /etc contiene configuraciones del sistema. ¿Qué hay ahí?',
            starter_code: 'ls /etc',
            expected_output: 'passwd',
            hints: ['Usa ls seguido de la ruta /etc', 'Deberías ver archivos como passwd y hosts'],
          },
        ],
      },
      {
        slug: 'moviéndote-entre-carpetas',
        title: 'Moviéndote entre Carpetas',
        description: 'Domina cd y pwd para navegar por el sistema de archivos como un experto.',
        difficulty: 'easy',
        estimated_minutes: 10,
        sort_order: 3,
        theory: `# Moviéndote entre Carpetas

## cd — Change Directory

El comando \`cd\` te mueve entre carpetas:

- \`cd carpeta\` → entrar a una subcarpeta
- \`cd ..\` → subir un nivel (carpeta padre)
- \`cd ~\` o \`cd\` → ir a tu carpeta personal
- \`cd /\` → ir a la raíz del sistema

## pwd — Print Working Directory

\`pwd\` te dice exactamente dónde estás:

\`\`\`
hacker@chaskibots:~/documentos$ pwd
/home/hacker/documentos
\`\`\`

## Rutas absolutas vs relativas

- **Absoluta**: empieza desde la raíz \`/home/hacker/documentos\`
- **Relativa**: desde donde estás \`documentos/proyecto.py\`

## Atajos útiles

- \`~\` → carpeta personal (/home/hacker)
- \`..\` → carpeta padre
- \`.\` → carpeta actual
- \`-\` → carpeta anterior (cd -)`,
        examples: [
          { title: '¿Dónde estoy?', code: 'pwd', explanation: 'Muestra la ruta completa del directorio actual' },
          { title: 'Ir a documentos', code: 'cd documentos', explanation: 'Entra a la subcarpeta documentos' },
          { title: 'Subir un nivel', code: 'cd ..', explanation: 'Vuelve a la carpeta padre' },
          { title: 'Ir al home', code: 'cd ~', explanation: 'Vuelve a tu carpeta personal desde cualquier lugar' },
        ],
        challenges: [
          {
            title: 'Navega al directorio raíz',
            description: 'Muévete hasta la raíz del sistema y luego muestra dónde estás.',
            starter_code: 'cd /',
            expected_output: '/',
            hints: ['Usa cd / para ir a la raíz', 'Luego usa pwd para confirmar'],
          },
        ],
      },
      {
        slug: 'leyendo-archivos',
        title: 'Leyendo Archivos',
        description: 'Aprende a ver el contenido de archivos con cat, head y tail.',
        difficulty: 'easy',
        estimated_minutes: 12,
        sort_order: 4,
        theory: `# Leyendo Archivos

## cat — Concatenar y mostrar

\`cat\` muestra todo el contenido de un archivo:

\`\`\`
cat notas.txt
\`\`\`

## head — Ver el inicio

\`head\` muestra las primeras líneas (por defecto 10):

\`\`\`
head /var/log/syslog
\`\`\`

## tail — Ver el final

\`tail\` muestra las últimas líneas. Muy útil para **logs**:

\`\`\`
tail /var/log/auth.log
\`\`\`

## ¿Cuándo usar cada uno?

- **cat** → archivos pequeños completos
- **head** → revisar el inicio de un archivo grande
- **tail** → ver los últimos eventos en un log (muy usado en ciberseguridad)

## Tip de seguridad

Los archivos de log (\`/var/log/\`) son fundamentales para detectar intrusiones. Un hacker ético revisa auth.log para ver intentos de acceso.`,
        examples: [
          { title: 'Ver notas', code: 'cat notas.txt', explanation: 'Muestra el contenido completo del archivo notas.txt' },
          { title: 'Archivo de contraseñas', code: 'cat /etc/passwd', explanation: 'Muestra los usuarios del sistema (no contiene contraseñas reales)' },
          { title: 'Inicio de un log', code: 'head /var/log/syslog', explanation: 'Muestra las primeras 5 líneas del log del sistema' },
          { title: 'Últimos accesos', code: 'tail /var/log/auth.log', explanation: 'Muestra los últimos intentos de login — esencial en ciberseguridad' },
        ],
        challenges: [
          {
            title: 'Lee el archivo secreto',
            description: 'Hay un archivo encriptado en tu carpeta personal. ¿Qué contiene?',
            starter_code: 'cat secreto.enc',
            expected_output: 'ENCRYPTED',
            hints: ['El archivo se llama secreto.enc', 'Usa cat para leerlo'],
          },
          {
            title: 'Detecta intrusos',
            description: 'Revisa el log de autenticación para ver si alguien intentó acceder sin permiso.',
            starter_code: 'cat /var/log/auth.log',
            expected_output: 'Failed password',
            hints: ['Los logs de autenticación están en /var/log/auth.log', 'Busca líneas con "Failed"'],
          },
        ],
      },
    ],
  },
  {
    slug: 'busqueda-filtros',
    title: 'Búsqueda y Filtros',
    description: 'Encuentra archivos y filtra información como un detective digital.',
    icon: '🔍',
    sort_order: 2,
    lessons: [
      {
        slug: 'buscando-con-find',
        title: 'Buscando Archivos con find',
        description: 'El comando find te permite buscar archivos en todo el sistema por nombre, tipo o tamaño.',
        difficulty: 'easy',
        estimated_minutes: 10,
        sort_order: 1,
        theory: `# Buscando Archivos con find

## ¿Por qué buscar?

En un servidor real, hay miles de archivos. \`find\` te permite localizar exactamente lo que necesitas.

## Sintaxis básica

\`\`\`
find <directorio> <criterio>
\`\`\`

## Búsquedas comunes

- \`find . -name "*.txt"\` → archivos .txt desde aquí
- \`find / -name "config"\` → buscar "config" en todo el sistema
- \`find /home -type d\` → solo directorios
- \`find /var/log -type f\` → solo archivos

## En ciberseguridad

Los pentesters usan \`find\` para:
- Encontrar archivos de configuración expuestos
- Buscar archivos con permisos débiles
- Localizar backups olvidados
- Descubrir scripts sospechosos`,
        examples: [
          { title: 'Buscar archivos .txt', code: 'find .txt', explanation: 'Busca todos los archivos con extensión .txt desde el directorio actual' },
          { title: 'Buscar en /etc', code: 'find ssh', explanation: 'Busca archivos relacionados con SSH en el sistema' },
          { title: 'Buscar scripts', code: 'find .sh', explanation: 'Encuentra todos los scripts de shell (.sh) en el sistema' },
        ],
        challenges: [
          {
            title: 'Encuentra el script de escaneo',
            description: 'Hay un script de escaneo de red oculto en alguna carpeta. Encuéntralo.',
            starter_code: 'find scan',
            expected_output: 'scan.sh',
            hints: ['Busca archivos que contengan "scan" en su nombre', 'El script tiene extensión .sh'],
          },
        ],
      },
      {
        slug: 'filtrando-con-grep',
        title: 'Filtrando con grep',
        description: 'grep es la herramienta más poderosa para buscar texto dentro de archivos.',
        difficulty: 'medium',
        estimated_minutes: 15,
        sort_order: 2,
        theory: `# Filtrando con grep

## ¿Qué es grep?

\`grep\` (Global Regular Expression Print) busca patrones de texto dentro de archivos. Es una de las herramientas más poderosas de Linux.

## Sintaxis

\`\`\`
grep <patrón> <archivo>
\`\`\`

## Ejemplos prácticos

- \`grep "error" /var/log/syslog\` → buscar errores en logs
- \`grep "root" /etc/passwd\` → encontrar líneas con "root"
- \`grep "Failed" /var/log/auth.log\` → detectar accesos fallidos

## En ciberseguridad

\`grep\` es esencial para:
- **Análisis de logs** → detectar patrones de ataque
- **Búsqueda de credenciales** → encontrar contraseñas expuestas
- **Análisis de tráfico** → filtrar paquetes sospechosos
- **Respuesta a incidentes** → correlacionar eventos

## Combinaciones poderosas

Puedes combinar grep con otros comandos usando \`|\` (pipe):
\`\`\`
cat /var/log/auth.log | grep "Failed"
\`\`\``,
        examples: [
          { title: 'Buscar errores en logs', code: 'grep error /var/log/error.log', explanation: 'Filtra líneas que contengan "error" en el log de errores' },
          { title: 'Detectar ataques', code: 'grep Failed /var/log/auth.log', explanation: 'Encuentra intentos de login fallidos — señal de posible ataque de fuerza bruta' },
          { title: 'Buscar usuario root', code: 'grep root /etc/passwd', explanation: 'Encuentra la línea del usuario root en el archivo de contraseñas' },
          { title: 'Buscar SQL Injection', code: 'grep SQL /var/log/error.log', explanation: 'Detecta intentos de inyección SQL en los logs del servidor web' },
        ],
        challenges: [
          {
            title: 'Detecta el ataque',
            description: 'Alguien intentó acceder al sistema sin autorización. Usa grep para encontrar los intentos fallidos.',
            starter_code: 'grep Failed /var/log/auth.log',
            expected_output: 'Failed password',
            hints: ['Busca "Failed" en /var/log/auth.log', 'Las IP sospechosas aparecerán en los resultados'],
          },
          {
            title: 'Encuentra la vulnerabilidad',
            description: 'Los logs del servidor web muestran intentos de ataques. ¿Qué tipo de ataques detectó el WAF?',
            starter_code: 'grep Attack /var/log/error.log',
            expected_output: 'Attack Detected',
            hints: ['Busca "Attack" en /var/log/error.log', 'ModSecurity es un WAF (Web Application Firewall)'],
          },
        ],
      },
    ],
  },
  {
    slug: 'redes-conexiones',
    title: 'Redes y Conexiones',
    description: 'Explora redes, escanea puertos y analiza conexiones como un hacker ético.',
    icon: '🌐',
    sort_order: 3,
    lessons: [
      {
        slug: 'diagnostico-red',
        title: 'Diagnóstico de Red con ping',
        description: 'Aprende a verificar si un servidor está activo y medir la latencia de la conexión.',
        difficulty: 'easy',
        estimated_minutes: 8,
        sort_order: 1,
        theory: `# Diagnóstico de Red

## El comando ping

\`ping\` envía paquetes ICMP a un servidor para verificar si está activo y medir el tiempo de respuesta.

## ¿Qué muestra?

\`\`\`
64 bytes desde 93.184.216.34: icmp_seq=1 ttl=56 time=23.4ms
\`\`\`

- **64 bytes** → tamaño del paquete
- **icmp_seq** → número de secuencia
- **ttl** → Time To Live (saltos de red restantes)
- **time** → latencia (tiempo de ida y vuelta)

## En ciberseguridad

- **Reconocimiento** → verificar si un host está activo
- **Diagnóstico** → detectar problemas de red
- **Medición** → evaluar calidad de conexión

## ifconfig / ip

Estos comandos muestran la configuración de red de tu máquina:
- Dirección IP
- Máscara de red
- Dirección MAC`,
        examples: [
          { title: 'Ping a Google', code: 'ping google.com', explanation: 'Verifica la conexión a Google y mide la latencia' },
          { title: 'Ping al router', code: 'ping 192.168.1.1', explanation: 'Verifica la conexión al router local' },
          { title: 'Tu configuración de red', code: 'ifconfig', explanation: 'Muestra las interfaces de red y sus direcciones IP' },
          { title: 'Conexiones activas', code: 'netstat', explanation: 'Muestra todas las conexiones de red activas en el sistema' },
        ],
        challenges: [
          {
            title: 'Verifica el servidor',
            description: 'El servidor de base de datos tiene la IP 10.0.0.5. ¿Está activo?',
            starter_code: 'ping 10.0.0.5',
            expected_output: 'paquetes transmitidos',
            hints: ['Usa ping seguido de la IP', 'Si recibes respuesta, el servidor está activo'],
          },
        ],
      },
      {
        slug: 'escaneo-puertos',
        title: 'Escaneo de Puertos con nmap',
        description: 'Descubre qué servicios están corriendo en un servidor usando nmap.',
        difficulty: 'medium',
        estimated_minutes: 15,
        sort_order: 2,
        theory: `# Escaneo de Puertos con nmap

## ¿Qué es nmap?

\`nmap\` (Network Mapper) es la herramienta más famosa de escaneo de redes. Es usada por profesionales de ciberseguridad en todo el mundo.

## ¿Qué son los puertos?

Un servidor puede tener hasta 65,535 puertos. Cada servicio usa un puerto específico:

- **22** → SSH (acceso remoto seguro)
- **80** → HTTP (web sin encriptar)
- **443** → HTTPS (web encriptada)
- **3306** → MySQL (base de datos)
- **8080** → HTTP alternativo

## Estados de puertos

- **open** → el servicio está activo y aceptando conexiones
- **closed** → el puerto no tiene servicio
- **filtered** → un firewall está bloqueando el acceso

## Ética

**IMPORTANTE**: Solo debes escanear redes y sistemas que tienes autorización para probar. Escanear sin permiso es ilegal en la mayoría de países.`,
        examples: [
          { title: 'Escanear servidor local', code: 'nmap 192.168.1.1', explanation: 'Escanea los puertos del router para ver qué servicios tiene activos' },
          { title: 'Escanear servidor web', code: 'nmap 10.0.0.10', explanation: 'Descubre qué servicios están corriendo en el servidor web interno' },
        ],
        challenges: [
          {
            title: 'Descubre los servicios',
            description: 'El equipo de seguridad necesita saber qué puertos tiene abiertos el router. Escanéalo.',
            starter_code: 'nmap 192.168.1.1',
            expected_output: 'open',
            hints: ['Usa nmap seguido de la IP del router', 'Los puertos "open" son los que tienen servicios activos'],
          },
        ],
      },
      {
        slug: 'conexiones-ssh',
        title: 'Conexiones Seguras con SSH',
        description: 'Aprende a conectarte remotamente a servidores de forma segura con SSH.',
        difficulty: 'medium',
        estimated_minutes: 12,
        sort_order: 3,
        theory: `# Conexiones Seguras con SSH

## ¿Qué es SSH?

SSH (Secure Shell) permite conectarte a otro computador de forma **encriptada**. Es el método estándar para administrar servidores.

## Sintaxis

\`\`\`
ssh usuario@servidor
\`\`\`

## Autenticación

Hay dos formas de autenticarse:
- **Contraseña** → simple pero menos segura
- **Clave pública/privada** → más segura y automatizable

## Claves SSH

Las claves SSH se guardan en \`~/.ssh/\`:
- \`id_rsa\` → clave privada (NUNCA compartir)
- \`id_rsa.pub\` → clave pública (se comparte con servidores)
- \`known_hosts\` → servidores conocidos
- \`config\` → configuración de conexiones

## Seguridad

- Siempre usa claves SSH en lugar de contraseñas
- Configura \`PermitRootLogin no\` en el servidor
- Limita los intentos de login con \`MaxAuthTries\``,
        examples: [
          { title: 'Conectar a servidor', code: 'ssh admin@10.0.0.5', explanation: 'Intenta conectarse al servidor como usuario admin' },
          { title: 'Ver clave pública', code: 'cat /home/hacker/.ssh/id_rsa.pub', explanation: 'Muestra tu clave pública SSH' },
          { title: 'Ver configuración SSH', code: 'cat /etc/ssh/sshd_config', explanation: 'Muestra la configuración del servidor SSH' },
          { title: 'Hosts conocidos', code: 'cat /home/hacker/.ssh/known_hosts', explanation: 'Lista los servidores a los que te has conectado antes' },
        ],
        challenges: [
          {
            title: 'Revisa la seguridad SSH',
            description: 'Revisa la configuración del servidor SSH. ¿Está permitido el login como root?',
            starter_code: 'cat /etc/ssh/sshd_config',
            expected_output: 'PermitRootLogin',
            hints: ['La configuración SSH está en /etc/ssh/sshd_config', 'Busca la línea PermitRootLogin'],
          },
        ],
      },
    ],
  },
  {
    slug: 'seguridad-permisos',
    title: 'Seguridad y Permisos',
    description: 'Comprende el sistema de permisos de Linux y aprende a proteger archivos.',
    icon: '🔐',
    sort_order: 4,
    lessons: [
      {
        slug: 'permisos-linux',
        title: 'Sistema de Permisos',
        description: 'Entiende cómo Linux controla quién puede leer, escribir y ejecutar cada archivo.',
        difficulty: 'medium',
        estimated_minutes: 15,
        sort_order: 1,
        theory: `# Sistema de Permisos de Linux

## Los tres permisos

Cada archivo tiene tres tipos de permisos:
- **r** (read) → leer el contenido
- **w** (write) → modificar el contenido
- **x** (execute) → ejecutar como programa

## Los tres niveles

Los permisos se aplican a tres niveles:
- **u** (user) → el dueño del archivo
- **g** (group) → el grupo al que pertenece
- **o** (others) → todos los demás

## Notación numérica

Cada permiso tiene un valor:
- **r = 4**, **w = 2**, **x = 1**
- Se suman: rwx = 7, rw- = 6, r-x = 5, r-- = 4

Ejemplo: \`chmod 755 script.sh\`
- 7 (rwx) → dueño puede todo
- 5 (r-x) → grupo puede leer y ejecutar
- 5 (r-x) → otros pueden leer y ejecutar

## sudo — Super User Do

\`sudo\` te permite ejecutar comandos como administrador (root). Es como la "llave maestra" del sistema.

**Úsalo con responsabilidad** — un error con sudo puede dañar todo el sistema.`,
        examples: [
          { title: 'Ver permisos', code: 'ls -la', explanation: 'Muestra los permisos detallados de todos los archivos' },
          { title: 'Hacer script ejecutable', code: 'chmod 755 scripts/scan.sh', explanation: 'Da permisos de ejecución al script de escaneo' },
          { title: 'Ver como root', code: 'sudo ls /root', explanation: 'Lista el directorio de root usando permisos de administrador' },
          { title: '¿Quién eres?', code: 'id', explanation: 'Muestra tu usuario, grupo y los grupos a los que perteneces' },
        ],
        challenges: [
          {
            title: 'Accede a /root',
            description: 'El directorio /root está protegido. Necesitas usar sudo para ver su contenido. ¿Qué hay dentro?',
            starter_code: 'sudo ls /root',
            expected_output: 'flag.txt',
            hints: ['Necesitas permisos de administrador', 'Usa sudo antes del comando ls'],
          },
          {
            title: 'Encuentra la FLAG',
            description: 'Hay una flag oculta en el sistema. Solo root puede verla. ¡Encuéntrala!',
            starter_code: 'sudo cat /root/flag.txt',
            expected_output: 'FLAG',
            hints: ['La flag está en /root/flag.txt', 'Necesitas sudo para leerla'],
          },
        ],
      },
      {
        slug: 'usuarios-sistema',
        title: 'Usuarios del Sistema',
        description: 'Aprende cómo Linux gestiona los usuarios y cómo investigar quién tiene acceso.',
        difficulty: 'medium',
        estimated_minutes: 12,
        sort_order: 2,
        theory: `# Usuarios del Sistema

## /etc/passwd

Este archivo contiene información de todos los usuarios:

\`\`\`
root:x:0:0:root:/root:/bin/bash
hacker:x:1000:1000:Hacker Ético:/home/hacker:/bin/bash
\`\`\`

Campos separados por \`:\`:
1. **Nombre** de usuario
2. **x** → contraseña en /etc/shadow
3. **UID** → ID de usuario (0 = root)
4. **GID** → ID de grupo
5. **Descripción** del usuario
6. **Home** → directorio personal
7. **Shell** → programa de terminal

## /etc/shadow

Contiene las contraseñas encriptadas. Solo root puede leerlo.

## Investigación de usuarios

- \`whoami\` → tu usuario actual
- \`id\` → tu UID, GID y grupos
- \`cat /etc/passwd\` → todos los usuarios
- \`sudo cat /etc/shadow\` → contraseñas (solo root)`,
        examples: [
          { title: 'Tu identidad', code: 'whoami', explanation: 'Muestra tu nombre de usuario actual' },
          { title: 'Tu identificación completa', code: 'id', explanation: 'Muestra tu UID, GID y todos los grupos' },
          { title: 'Todos los usuarios', code: 'cat /etc/passwd', explanation: 'Lista todos los usuarios registrados en el sistema' },
          { title: 'Intenta ver shadow', code: 'cat /etc/shadow', explanation: 'Intenta ver las contraseñas — ¡necesitas ser root!' },
        ],
        challenges: [
          {
            title: 'Investiga los usuarios',
            description: '¿Cuántos usuarios tiene el sistema? Revisa /etc/passwd y cuenta las líneas.',
            starter_code: 'cat /etc/passwd',
            expected_output: 'hacker',
            hints: ['Usa cat /etc/passwd', 'Cada línea es un usuario diferente'],
          },
        ],
      },
    ],
  },
  {
    slug: 'criptografia-basica',
    title: 'Criptografía Básica',
    description: 'Aprende los fundamentos de encriptación, hashing y protección de datos.',
    icon: '🔑',
    sort_order: 5,
    lessons: [
      {
        slug: 'cifrado-cesar',
        title: 'Cifrado César',
        description: 'Aprende el cifrado más antiguo de la historia y encripta/desencripta mensajes.',
        difficulty: 'easy',
        estimated_minutes: 10,
        sort_order: 1,
        theory: `# Cifrado César

## Historia

El **Cifrado César** fue usado por Julio César para enviar mensajes secretos a sus generales. Es uno de los cifrados más simples pero fundamentales para entender criptografía.

## ¿Cómo funciona?

Cada letra se desplaza un número fijo de posiciones en el alfabeto:

Con shift=3:
- A → D
- B → E
- H → K
- HOLA → KROD

## En nuestra terminal

Tenemos dos comandos especiales:
- \`encrypt <texto> <shift>\` → encripta
- \`decrypt <texto> <shift>\` → desencripta

## Seguridad moderna

El cifrado César es fácil de romper (solo 26 posibilidades). La criptografía moderna usa:
- **AES** → cifrado simétrico estándar
- **RSA** → cifrado asimétrico (claves pública/privada)
- **SHA-256** → funciones hash (no reversibles)`,
        examples: [
          { title: 'Encriptar "hola"', code: 'encrypt hola 3', explanation: 'Encripta la palabra "hola" con un desplazamiento de 3 posiciones' },
          { title: 'Desencriptar "krod"', code: 'decrypt krod 3', explanation: 'Desencripta "krod" con shift 3 — debería devolver "hola"' },
          { title: 'Encriptar con shift 7', code: 'encrypt secreto 7', explanation: 'Usa un desplazamiento mayor para más "seguridad"' },
          { title: 'Generar hash', code: 'hash chaskibots', explanation: 'Genera un hash simulado de la palabra — los hashes son irreversibles' },
        ],
        challenges: [
          {
            title: 'Descifra el mensaje',
            description: 'El archivo secreto.enc contiene un mensaje cifrado con César (shift=4). El texto cifrado es "Xli wigvix mw: glesomfxw". ¿Cuál es el mensaje original?',
            starter_code: 'decrypt glesomfxw 4',
            expected_output: 'Desencriptado',
            hints: ['Usa el comando decrypt', 'El shift es 4', 'Prueba primero con una palabra del mensaje'],
          },
        ],
      },
      {
        slug: 'hashing',
        title: 'Funciones Hash',
        description: 'Entiende qué es un hash, por qué es importante y cómo se usa en seguridad.',
        difficulty: 'medium',
        estimated_minutes: 12,
        sort_order: 2,
        theory: `# Funciones Hash

## ¿Qué es un hash?

Un **hash** es una función que convierte cualquier dato en una cadena de tamaño fijo. Es como una "huella digital" del dato.

## Propiedades fundamentales

1. **Determinista** → el mismo input siempre da el mismo hash
2. **Rápida** → se calcula rápidamente
3. **Irreversible** → no puedes obtener el input desde el hash
4. **Única** → dos inputs diferentes dan hashes diferentes (idealmente)

## Tipos comunes

- **MD5** → 128 bits (32 caracteres hex) — ya NO es seguro
- **SHA-256** → 256 bits (64 caracteres hex) — estándar actual
- **bcrypt** → diseñado para contraseñas (lento a propósito)

## Usos en seguridad

- **Almacenar contraseñas** → nunca se guarda la contraseña, solo su hash
- **Verificar integridad** → comprobar que un archivo no fue modificado
- **Firmas digitales** → verificar autenticidad de documentos
- **Blockchain** → cada bloque contiene el hash del anterior`,
        examples: [
          { title: 'Hash de "password"', code: 'hash password', explanation: 'Genera el hash de la palabra "password" — ¿ves por qué es una mala contraseña?' },
          { title: 'Hash de "chaskibots"', code: 'hash chaskibots', explanation: 'Cada palabra genera un hash completamente diferente' },
          { title: 'Hash de "ChaskiBots"', code: 'hash ChaskiBots', explanation: 'Cambia una sola letra y todo el hash cambia — esto es el "efecto avalancha"' },
        ],
        challenges: [
          {
            title: 'Efecto avalancha',
            description: 'Genera el hash de "hola" y luego de "hola1". Compara los resultados. ¿Son parecidos?',
            starter_code: 'hash hola',
            expected_output: 'MD5',
            hints: ['Primero ejecuta: hash hola', 'Luego ejecuta: hash hola1', 'Aunque la diferencia es mínima, los hashes son completamente distintos'],
          },
        ],
      },
    ],
  },
  {
    slug: 'administracion-sistema',
    title: 'Administración del Sistema',
    description: 'Monitorea procesos, recursos y aprende a gestionar un servidor Linux.',
    icon: '🛠️',
    sort_order: 6,
    lessons: [
      {
        slug: 'procesos-sistema',
        title: 'Procesos del Sistema',
        description: 'Aprende a ver qué programas están corriendo y cómo gestionar procesos.',
        difficulty: 'medium',
        estimated_minutes: 12,
        sort_order: 1,
        theory: `# Procesos del Sistema

## ¿Qué es un proceso?

Cada programa que corre en Linux es un **proceso** con un identificador único (PID).

## Comandos para ver procesos

- \`ps\` → lista tus procesos actuales
- \`top\` → monitor en tiempo real (como el Administrador de Tareas)
- \`ps aux\` → todos los procesos del sistema

## Entendiendo top

\`\`\`
PID USER      %CPU %MEM    COMMAND
5678 www-data  15.2  4.5    nginx
3456 mysql      8.7  12.3   mysqld
\`\`\`

- **PID** → ID del proceso
- **USER** → usuario que lo ejecuta
- **%CPU** → uso del procesador
- **%MEM** → uso de memoria
- **COMMAND** → nombre del programa

## Recursos del sistema

- \`df\` → espacio en disco
- \`free\` → memoria RAM disponible
- \`uptime\` → tiempo encendido y carga del sistema

## En ciberseguridad

Revisar procesos ayuda a detectar:
- **Malware** ejecutándose en segundo plano
- **Procesos sospechosos** de usuarios desconocidos
- **Consumo anormal** de recursos`,
        examples: [
          { title: 'Procesos actuales', code: 'ps', explanation: 'Muestra los procesos que están corriendo en tu terminal' },
          { title: 'Monitor del sistema', code: 'top', explanation: 'Vista detallada de procesos con uso de CPU y memoria en tiempo real' },
          { title: 'Espacio en disco', code: 'df', explanation: 'Muestra cuánto espacio hay disponible en cada disco' },
          { title: 'Memoria RAM', code: 'free', explanation: 'Muestra el uso de memoria RAM y swap' },
        ],
        challenges: [
          {
            title: 'Investiga el servidor',
            description: 'Revisa qué procesos están corriendo. ¿Hay algún servidor web activo? ¿Qué proceso usa más CPU?',
            starter_code: 'top',
            expected_output: 'nginx',
            hints: ['Usa top o ps para ver los procesos', 'Busca procesos como nginx, mysqld, sshd'],
          },
        ],
      },
      {
        slug: 'configuracion-red',
        title: 'Hosts y Configuración de Red',
        description: 'Aprende cómo Linux resuelve nombres de dominio y configura la red.',
        difficulty: 'hard',
        estimated_minutes: 15,
        sort_order: 2,
        theory: `# Hosts y Configuración de Red

## /etc/hosts

Este archivo mapea nombres a direcciones IP **localmente**, sin necesidad de DNS:

\`\`\`
127.0.0.1   localhost
192.168.1.1 router.local
10.0.0.5    db.internal
\`\`\`

## ¿Para qué sirve?

- **Desarrollo** → apuntar dominios a tu máquina local
- **Bloqueo** → bloquear sitios no deseados (redirigir a 127.0.0.1)
- **Pruebas** → simular servidores sin configurar DNS

## /etc/network/interfaces

Configura cómo se conecta cada interfaz de red:

- **eth0** → cable Ethernet
- **wlan0** → WiFi
- **lo** → loopback (localhost)

## En ciberseguridad

Los atacantes a veces modifican /etc/hosts para:
- **DNS Spoofing local** → redirigir sitios legítimos a servidores maliciosos
- **C2 Beaconing** → conectar malware a servidores de comando y control

Por eso, verificar /etc/hosts es parte de la respuesta a incidentes.`,
        examples: [
          { title: 'Ver hosts', code: 'cat /etc/hosts', explanation: 'Muestra las resoluciones DNS locales configuradas en el sistema' },
          { title: 'Configuración de red', code: 'cat /etc/network/interfaces', explanation: 'Muestra cómo están configuradas las interfaces de red' },
          { title: 'Configuración del servidor', code: 'cat /opt/chaskibots/config.yml', explanation: 'Revisa la configuración de la aplicación ChaskiBots' },
        ],
        challenges: [
          {
            title: 'Analiza la red',
            description: 'Revisa el archivo /etc/hosts. ¿Qué IP tiene asignada el servidor de base de datos (db.internal)?',
            starter_code: 'cat /etc/hosts',
            expected_output: 'db.internal',
            hints: ['Usa cat /etc/hosts', 'Busca la línea que menciona "db.internal"'],
          },
        ],
      },
    ],
  },
]

// ============================================================
// SEED FUNCTION
// ============================================================
async function seed() {
  console.log('🐧 Seeding Linux course...\n')

  // 1. Check if course already exists
  const { data: existing } = await supabase
    .from('simulator_courses')
    .select('id')
    .eq('slug', 'linux')
    .single()

  let courseId

  if (existing) {
    console.log('⚠️  Curso "linux" ya existe. Actualizando...')
    const { data, error } = await supabase
      .from('simulator_courses')
      .update(COURSE)
      .eq('id', existing.id)
      .select()
      .single()
    if (error) throw error
    courseId = data.id

    // Delete old modules/lessons to re-seed
    const { data: oldModules } = await supabase
      .from('simulator_modules')
      .select('id')
      .eq('course_id', courseId)
    
    if (oldModules?.length) {
      const moduleIds = oldModules.map(m => m.id)
      await supabase.from('simulator_lessons').delete().in('module_id', moduleIds)
      await supabase.from('simulator_modules').delete().eq('course_id', courseId)
      console.log(`   Eliminados ${oldModules.length} módulos anteriores`)
    }
  } else {
    const { data, error } = await supabase
      .from('simulator_courses')
      .insert(COURSE)
      .select()
      .single()
    if (error) throw error
    courseId = data.id
    console.log(`✅ Curso creado: ${data.title} (${courseId})`)
  }

  // 2. Insert modules and lessons
  let totalLessons = 0
  for (const mod of MODULES) {
    const { lessons, ...moduleData } = mod
    const { data: moduleRow, error: modError } = await supabase
      .from('simulator_modules')
      .insert({ ...moduleData, course_id: courseId, is_active: true })
      .select()
      .single()

    if (modError) {
      console.error(`❌ Error insertando módulo "${mod.title}":`, modError.message)
      continue
    }

    console.log(`  📦 Módulo: ${moduleRow.title} (${lessons.length} lecciones)`)

    for (const lesson of lessons) {
      const { error: lessonError } = await supabase
        .from('simulator_lessons')
        .insert({
          ...lesson,
          module_id: moduleRow.id,
          is_active: true,
          examples: JSON.stringify(lesson.examples),
          challenges: JSON.stringify(lesson.challenges),
        })

      if (lessonError) {
        console.error(`    ❌ Error en lección "${lesson.title}":`, lessonError.message)
      } else {
        console.log(`    📄 ${lesson.title}`)
        totalLessons++
      }
    }
  }

  console.log(`\n🎉 ¡Seed completado! ${MODULES.length} módulos, ${totalLessons} lecciones creadas.`)
  console.log('   El curso aparecerá automáticamente en el simulador Linux Terminal.')
}

seed().catch(err => {
  console.error('❌ Error fatal:', err)
  process.exit(1)
})
