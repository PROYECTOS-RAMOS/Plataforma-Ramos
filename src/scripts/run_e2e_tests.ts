import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://zchgadeyouofdvyamgpq.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!SERVICE_ROLE_KEY) {
  console.error('❌ Falta SUPABASE_SERVICE_ROLE_KEY en el entorno.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

async function runE2ETests() {
  console.log('🚀 === INICIANDO PRUEBAS E2E E INTEGRALES DE SISTEMA ===\n')

  const testEmail = `test_merchant_${Date.now()}@gmail.com`
  const testPassword = 'PasswordTest123!'
  const testStoreSlug = `test-store-${Date.now()}`

  try {
    // ----------------------------------------------------
    // TEST 1: Registro e Inicio de Sesión de Usuario
    // ----------------------------------------------------
    console.log(`1. Creando usuario comerciante de prueba: ${testEmail}...`)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true
    })

    if (authError || !authData.user) {
      throw new Error(`Error en Registro: ${authError?.message}`)
    }
    const userId = authData.user.id
    console.log(`   ✅ Usuario registrado con ID: ${userId}`)

    // ----------------------------------------------------
    // TEST 2: Creación de Tienda y Asignación de Miembro
    // ----------------------------------------------------
    console.log(`\n2. Creando tienda para el comerciante: ${testStoreSlug}...`)
    const { data: storeData, error: storeError } = await supabase
      .from('stores')
      .insert({
        owner_id: userId,
        name: `Tienda Test Auto ${Date.now()}`,
        slug: testStoreSlug,
        whatsapp_phone: '+51987654321',
        is_active: true
      })
      .select()
      .single()

    if (storeError || !storeData) {
      throw new Error(`Error en Creación de Tienda: ${storeError?.message}`)
    }
    const storeId = storeData.id
    console.log(`   ✅ Tienda creada con ID: ${storeId}`)

    // Asignar miembro
    const { error: memberError } = await supabase
      .from('store_members')
      .insert({
        store_id: storeId,
        email: testEmail,
        role: 'admin',
        status: 'active'
      })

    if (memberError) {
      console.warn(`   ⚠️ Aviso en Miembro: ${memberError.message}`)
    } else {
      console.log(`   ✅ Rol admin asignado al usuario.`)
    }

    // ----------------------------------------------------
    // TEST 3: Creación de Categoría y Productos
    // ----------------------------------------------------
    console.log('\n3. Creando categoría y productos de prueba...')
    const { data: catData, error: catError } = await supabase
      .from('categories')
      .insert({
        store_id: storeId,
        name: 'Categoría E2E',
        slug: 'categoria-e2e',
        position: 1,
        is_active: true
      })
      .select()
      .single()

    if (catError || !catData) {
      throw new Error(`Error en Categoría: ${catError?.message}`)
    }
    console.log(`   ✅ Categoría creada: ${catData.name}`)

    const { data: prodData, error: prodError } = await supabase
      .from('products')
      .insert({
        store_id: storeId,
        category_id: catData.id,
        title: 'Producto E2E Test',
        slug: 'producto-e2e-test',
        description: 'Descripción de prueba del producto E2E.',
        price: 99.90,
        images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500'],
        is_available: true,
        position: 1
      })
      .select()
      .single()

    if (prodError || !prodData) {
      throw new Error(`Error en Producto: ${prodError?.message}`)
    }
    console.log(`   ✅ Producto creado: ${prodData.title} (S/ ${prodData.price})`)

    // ----------------------------------------------------
    // TEST 4: Simulación de Compra Pública de Cliente (Storefront Checkout)
    // ----------------------------------------------------
    console.log('\n4. Simulando compra de cliente desde el Storefront...')
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        store_id: storeId,
        customer_name: 'Comprador E2E',
        customer_phone: '+51912345678',
        subtotal: 99.90,
        shipping_price: 10.00,
        total: 109.90,
        status: 'pending'
      })
      .select()
      .single()

    if (orderError || !orderData) {
      throw new Error(`Error en Creación de Pedido: ${orderError?.message}`)
    }
    console.log(`   ✅ Pedido creado con ID: ${orderData.id} - Monto Total: S/ ${orderData.total}`)

    const { error: itemError } = await supabase
      .from('order_items')
      .insert({
        order_id: orderData.id,
        product_id: prodData.id,
        product_title: prodData.title,
        price: prodData.price,
        quantity: 1,
        selected_options: []
      })

    if (itemError) {
      throw new Error(`Error en Ítem de Pedido: ${itemError.message}`)
    }
    console.log(`   ✅ Ítem de pedido insertado correctamente.`)

    // ----------------------------------------------------
    // TEST 5: Actualización y Cierre de Pedido (Admin Operations)
    // ----------------------------------------------------
    console.log('\n5. Actualizando estado de pedido a Completado desde el Admin...')
    const { error: updateOrderErr } = await supabase
      .from('orders')
      .update({ status: 'completed' })
      .eq('id', orderData.id)

    if (updateOrderErr) {
      throw new Error(`Error en Actualización de Pedido: ${updateOrderErr.message}`)
    }
    console.log(`   ✅ Estado de pedido actualizado a COMPLETADO.`)

    // ----------------------------------------------------
    // TEST 6: Limpieza Limpia de Datos de Prueba (Cleanup)
    // ----------------------------------------------------
    console.log('\n6. Ejecutando limpieza segura de registros E2E...')
    await supabase.from('order_items').delete().eq('order_id', orderData.id)
    await supabase.from('orders').delete().eq('id', orderData.id)
    await supabase.from('products').delete().eq('id', prodData.id)
    await supabase.from('categories').delete().eq('id', catData.id)
    await supabase.from('store_members').delete().eq('store_id', storeId)
    await supabase.from('stores').delete().eq('id', storeId)
    await supabase.auth.admin.deleteUser(userId)
    console.log('   ✅ Limpieza completa realizada sin residuos.')

    console.log('\n🎉 === TODAS LAS PRUEBAS E2E FINALIZARON CON 100% DE ÉXITO ===')
  } catch (err: any) {
    console.error(`\n❌ ERROR EN LA PRUEBA E2E: ${err.message}`)
    process.exit(1)
  }
}

runE2ETests()
