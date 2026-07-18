/**
 * Script para crear usuario admin usando la API de Supabase Auth
 * Este script usa la API REST para crear el usuario con el hash de contraseña correcto
 */

const SUPABASE_URL = 'https://zchgadeyouofdvyamgpq.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY no está definida');
  console.error('   Ejecuta: $env:SUPABASE_SERVICE_ROLE_KEY="tu_key"');
  process.exit(1);
}

async function createAdminUser() {
  console.log('🔧 Creando usuario admin usando API de Supabase Auth...\n');

  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@dev.app',
        password: '123-123-123',
        email_confirm: true,
        user_metadata: {
          full_name: 'Master Administrador',
          role: 'super_admin'
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Error creando usuario:', data);
      process.exit(1);
    }

    console.log('✅ Usuario creado exitosamente:\n');
    console.log('   ID:', data.id);
    console.log('   Email:', data.email);
    console.log('   Email confirmado:', data.email_confirmed_at);
    console.log('\n📝 El trigger de base de datos creará automáticamente el perfil en public.master_admins...\n');
    console.log('✅ Proceso de creación del Super Administrador completado\n');
    console.log('═══════════════════════════════════════════════════');
    console.log('CREDENCIALES DE DESARROLLO:');
    console.log('═══════════════════════════════════════════════════');
    console.log(`📧 Email:    admin@dev.app`);
    console.log(`🔑 Password: 123-123-123`);
    console.log(`👤 Rol:      super_admin`);
    console.log(`🌐 URL:      http://localhost:3000/master/login`);
    console.log('═══════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createAdminUser();
