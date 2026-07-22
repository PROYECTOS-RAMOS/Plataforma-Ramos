/**
 * Templates de correo electrónico para Plataforma Ramos
 * Contiene plantillas HTML reutilizables para diferentes casos de uso
 */

export interface EmailTemplateParams {
  recipientName: string
  storeName?: string
  [key: string]: any
}

/**
 * Template base para correos con branding de Plataforma Ramos
 */
export function baseTemplate(content: string, subject: string) {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f4f4f4;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          color: #ffffff;
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }
        .content {
          padding: 30px;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #667eea;
          color: #ffffff;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 500;
          margin: 20px 0;
        }
        .footer {
          background-color: #f8f9fa;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        .footer a {
          color: #667eea;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Plataforma Ramos</h1>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>© 2026 Plataforma Ramos. Todos los derechos reservados.</p>
          <p>
            <a href="https://rutaslima.app">Visitar sitio web</a> | 
            <a href="mailto:soporte@rutaslima.app">Contactar soporte</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * Template de bienvenida para nuevos usuarios
 */
export function welcomeTemplate(params: EmailTemplateParams) {
  const content = `
    <h2>¡Bienvenido a Plataforma Ramos! 🎉</h2>
    <p>Hola <strong>${params.recipientName}</strong>,</p>
    <p>Gracias por unirte a nuestra plataforma. Estamos emocionados de ayudarte a digitalizar tu negocio y comenzar a recibir pedidos por WhatsApp en menos de 30 segundos.</p>
    <p>Con Plataforma Ramos podrás:</p>
    <ul>
      <li>Crear tu catálogo de productos</li>
      <li>Recibir pedidos por WhatsApp</li>
      <li>Gestionar tus clientes</li>
      <li>Analizar tus ventas</li>
    </ul>
    <a href="https://rutaslima.app/dashboard" class="button">Comenzar ahora</a>
    <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
    <p>¡Bienvenido a la familia!</p>
  `
  return baseTemplate(content, '¡Bienvenido a Plataforma Ramos!')
}

/**
 * Template de confirmación de pedido
 */
export function orderConfirmationTemplate(params: EmailTemplateParams & {
  orderId: string
  total: string
  items: Array<{ name: string; quantity: number; price: string }>
}) {
  const itemsList = params.items.map(item => 
    `<li>${item.name} x${item.quantity} - ${item.price}</li>`
  ).join('')

  const content = `
    <h2>¡Pedido Confirmado! ✅</h2>
    <p>Hola <strong>${params.recipientName}</strong>,</p>
    <p>Tu pedido <strong>#${params.orderId}</strong> ha sido confirmado exitosamente.</p>
    <p><strong>Resumen del pedido:</strong></p>
    <ul>
      ${itemsList}
    </ul>
    <p><strong>Total: ${params.total}</strong></p>
    <p>Te notificaremos cuando tu pedido esté en camino.</p>
    <p>¡Gracias por tu compra!</p>
  `
  return baseTemplate(content, `Pedido #${params.orderId} Confirmado`)
}

/**
 * Template de recuperación de contraseña
 */
export function passwordResetTemplate(params: EmailTemplateParams & {
  resetLink: string
}) {
  const content = `
    <h2>Restablecer tu contraseña 🔐</h2>
    <p>Hola <strong>${params.recipientName}</strong>,</p>
    <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
    <p>Para continuar, haz clic en el siguiente enlace:</p>
    <a href="${params.resetLink}" class="button">Restablecer contraseña</a>
    <p>Este enlace expirará en 1 hora por seguridad.</p>
    <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
  `
  return baseTemplate(content, 'Restablecer tu contraseña')
}

/**
 * Template de notificación de nuevo pedido para el dueño de tienda
 */
export function newOrderNotificationTemplate(params: EmailTemplateParams & {
  orderId: string
  customerName: string
  total: string
  storeName: string
}) {
  const content = `
    <h2>¡Nuevo Pedido Recibido! 🛒</h2>
    <p>Hola <strong>${params.recipientName}</strong>,</p>
    <p>Tienes un nuevo pedido en tu tienda <strong>${params.storeName}</strong>.</p>
    <p><strong>Detalles del pedido:</strong></p>
    <ul>
      <li>Pedido #${params.orderId}</li>
      <li>Cliente: ${params.customerName}</li>
      <li>Total: ${params.total}</li>
    </ul>
    <a href="https://rutaslima.app/dashboard/orders" class="button">Ver pedido</a>
    <p>¡No olvides contactar al cliente por WhatsApp!</p>
  `
  return baseTemplate(content, `Nuevo Pedido #${params.orderId}`)
}

/**
 * Template de prueba simple
 */
export function testTemplate(params: EmailTemplateParams) {
  const content = `
    <h2>Correo de Prueba 🧪</h2>
    <p>Hola <strong>${params.recipientName}</strong>,</p>
    <p>Este es un correo de prueba para verificar que la integración con Resend está funcionando correctamente.</p>
    <p><strong>Detalles de la prueba:</strong></p>
    <ul>
      <li>Fecha: ${new Date().toLocaleString('es-PE')}</li>
      <li>Servicio: Resend API</li>
      <li>Estado: ✅ Funcionando</li>
    </ul>
    <p>Si recibes este correo, la integración está lista para producción.</p>
    <p>¡Saludos desde Plataforma Ramos!</p>
  `
  return baseTemplate(content, 'Correo de Prueba - Plataforma Ramos')
}
