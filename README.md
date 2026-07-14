# Plataforma Ramos - Comercio Ligero 🚀

Una plataforma SaaS Multi-tenant moderna y premium diseñada para que cualquier comercio digitalice su inventario y comience a vender y recibir pedidos por WhatsApp en menos de 30 segundos.

## 🛠️ Stack Tecnológico
*   **Frontend & Routing:** Next.js 15 (App Router, Server Components y Middleware para multi-tenancy).
*   **Estilos:** TailwindCSS + Vanilla CSS para un diseño responsivo, fluido y de alta gama.
*   **Base de Datos & Auth:** Supabase (PostgreSQL con políticas RLS de aislamiento multi-inquilino).
*   **Almacenamiento (Storage):** Cloudflare R2 (Bucket único master con estructura virtual de subcarpetas).
*   **Optimización de Imágenes:** Cloudinary Fetch API (conversión al vuelo de imágenes de R2 a formatos responsivos como WebP y AVIF).
*   **Notificaciones:** Resend API para correos transaccionales.

## ⚙️ Arquitectura Multi-tenant
El proyecto cuenta con un Middleware dinámico (`src/middleware.ts`) que analiza el host entrante:
*   **Landing Page de Marketing:** Responde ante el dominio raíz (ej: `rutaslima.app` o `localhost:3000`).
*   **Storefronts de Vendedores:** Carga de forma aislada el catálogo web de cada comercio al acceder mediante su subdominio (ej: `blamashop.rutaslima.app`).

## 🚀 Despliegue en Producción
Este proyecto está conectado de forma continua con Vercel. Cada cambio o `push` en la rama `main` de GitHub provoca un despliegue automático del servidor.

### Variables de Entorno Requeridas en Vercel
*   `NEXT_PUBLIC_SUPABASE_URL`
*   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
*   `SUPABASE_SERVICE_ROLE_KEY`
*   `CLOUDFLARE_R2_ACCESS_KEY_ID`
*   `CLOUDFLARE_R2_SECRET_ACCESS_KEY`
*   `CLOUDFLARE_R2_BUCKET_NAME`
*   `CLOUDFLARE_R2_ENDPOINT`
*   `NEXT_PUBLIC_R2_PUBLIC_URL`
*   `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
*   `CLOUDINARY_API_KEY`
*   `CLOUDINARY_API_SECRET`
*   `RESEND_API_KEY`
*   `NEXT_PUBLIC_ROOT_DOMAIN` (debe ser `rutaslima.app` en producción).
