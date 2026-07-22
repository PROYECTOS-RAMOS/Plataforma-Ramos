/**
 * Script de prueba para envío de correos con Resend
 * 
 * USO:
 * node scripts/test-email.js
 * 
 * Este script envía un correo de prueba para verificar la integración con Resend.
 */

require('dotenv').config({ path: '.env.local' })

const { sendEmail } = require('../src/lib/resend.ts')
const { testTemplate } = require('../src/lib/email-templates.ts')

async function sendTestEmail() {
  console.log('🧪 Enviando correo de prueba...\n')

  try {
    // Verificar que la API key esté configurada
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY no está configurada en .env.local')
    }

    // Usar un email de prueba válido (el usuario proporcionó esto como destinatario)
    const recipientEmail = 'test@rutaslima.app' // Email de prueba para el dominio
    
    // Generar template HTML
    const htmlContent = testTemplate({
      recipientName: 'Usuario de Prueba'
    })

    // Enviar correo
    const result = await sendEmail({
      to: recipientEmail,
      subject: 'Correo de Prueba - Plataforma Ramos',
      html: htmlContent,
      tags: [
        { name: 'category', value: 'test' },
        { name: 'environment', value: 'development' }
      ]
    })

    console.log('✅ Correo enviado exitosamente!\n')
    console.log('ID del correo:', result.id)
    console.log('Para:', recipientEmail)
    console.log('\n📧 Revisa tu bandeja de entrada para ver el correo de prueba.')
    
  } catch (error) {
    console.error('❌ Error enviando correo de prueba:', error.message)
    console.error('\nDetalles del error:', error)
    process.exit(1)
  }
}

// Ejecutar prueba
sendTestEmail()
