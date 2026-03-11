# Chusen

> **La suerte decide, nosotros la mostramos.**

Una aplicación web de sorteos en tiempo real. Importa tu lista de participantes desde un archivo Excel, define el premio y deja que Chusen elija al ganador con una animación cinematográfica.

## ✨ Características

- 📂 **Carga de participantes vía Excel** — Soporta `.xlsx` / `.xls`, previsualiza los datos antes del sorteo.
- 🏆 **Definición de premio** — Especifica el nombre del premio para cada sorteo.
- 🎰 **Animación de sorteo** — Revelación dramática del ganador con efectos visuales.
- ⚡ **Desplegado en Cloudflare Workers** — Rendimiento edge a nivel global.
- 🎨 **Diseño oscuro y moderno** — Construido con Tailwind CSS v4.

## 🗂️ Estructura del proyecto

```text
/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── ExcelUploader.tsx   # Carga y previsualización de participantes
│   │   ├── PrizeInput.tsx      # Input del nombre del premio
│   │   ├── SorteoApp.tsx       # Lógica principal del sorteo
│   │   └── WinnerDisplay.tsx   # Pantalla de revelación del ganador
│   ├── layouts/
│   │   └── Layout.astro
│   ├── pages/
│   │   └── index.astro
│   └── styles/
│       └── global.css
├── wrangler.jsonc
└── package.json
```

## 🧞 Comandos

Todos los comandos se ejecutan desde la raíz del proyecto:

| Comando                | Acción                                               |
| :--------------------- | :--------------------------------------------------- |
| `bun install`          | Instala las dependencias                             |
| `bun dev`              | Inicia el servidor de desarrollo en `localhost:4321` |
| `bun build`            | Genera el build de producción en `./dist/`           |
| `bun preview`          | Previsualiza el build localmente                     |
| `bun generate-types`   | Genera los tipos de Cloudflare Workers con Wrangler  |

## 🛠️ Stack tecnológico

| Tecnología | Uso |
| :--------- | :-- |
| [Astro](https://astro.build) | Framework principal (SSR) |
| [React](https://react.dev) | Componentes interactivos |
| [Tailwind CSS v4](https://tailwindcss.com) | Estilos |
| [Cloudflare Workers](https://workers.cloudflare.com) | Hosting / Runtime |
| [xlsx](https://sheetjs.com) | Parseo de archivos Excel |
| [Bun](https://bun.sh) | Package manager y runtime |

## 📄 Licencia

Distribuido bajo la licencia MIT. Consulta el archivo [LICENSE](./LICENSE) para más información.

© 2026 [InflvxDev](https://github.com/InflvxDev)