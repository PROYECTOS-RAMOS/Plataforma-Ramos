import React from 'react'
import Link from 'next/link'
import { 
  ShoppingBag, 
  MessageSquare, 
  Sparkles, 
  ArrowRight, 
  Phone, 
  Video, 
  MoreVertical, 
  Smile, 
  Paperclip, 
  Camera, 
  Send, 
  CheckCheck,
  Zap,
  Percent,
  Globe,
  Smartphone,
  LineChart,
  CheckCircle2,
  Users,
  ShieldCheck,
  Store,
  Share2,
  FolderTree,
  Utensils,
  Shirt,
  Cake,
  Laptop,
  Check
} from 'lucide-react'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Plataforma Ramos - Tu Propia Página Web y Catálogos Digitales en WhatsApp',
  description: 'Obtén tu propia página web profesional. Crea catálogos y categorías adaptadas a tu giro de negocio, comparte enlaces directos por WhatsApp y recibe ventas sin comisiones.',
}

interface HomePageProps {
  searchParams: Promise<{ code?: string; error?: string }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  await new Promise((resolve) => setTimeout(resolve, 500))
  const resolvedParams = await searchParams
  
  // Redirección de emergencia para OAuth de Supabase
  if (resolvedParams.code) {
    redirect(`/api/auth/callback?code=${resolvedParams.code}`)
  }

  const girosDeNegocio = [
    {
      icon: <Utensils className="w-6 h-6 text-amber-500" />,
      badge: 'Gastronomía',
      title: 'Restaurantes y Comida',
      desc: 'Organiza tu menú por categorías (Entradas, Platos de Fondo, Postres, Bebidas) con opciones de personalización.',
      demoUrl: 'mi-restaurante.rutaslima.app',
      exampleProduct: 'Burguer Doble Carne + Papas'
    },
    {
      icon: <Shirt className="w-6 h-6 text-purple-500" />,
      badge: 'Moda & Estilo',
      title: 'Ropa, Calzado y Accesorios',
      desc: 'Catálogos por colecciones (Verano, Invierno, Calzado) con filtro de tallas, colores y fotos en alta resolución.',
      demoUrl: 'boutique-chic.rutaslima.app',
      exampleProduct: 'Casaca Denim Oversize'
    },
    {
      icon: <Cake className="w-6 h-6 text-pink-500" />,
      badge: 'Pastelería',
      title: 'Repostería y Eventos',
      desc: 'Exhibe tus creaciones para cumpleaños, bodas o postres diarios con recepción de pedidos anticipados.',
      demoUrl: 'dulce-sabor.rutaslima.app',
      exampleProduct: 'Torta Selva Negra 15 Porciones'
    },
    {
      icon: <Laptop className="w-6 h-6 text-blue-500" />,
      badge: 'Tecnología',
      title: 'Gadgets y Servicios',
      desc: 'Catálogos con especificaciones técnicas detalladas, garantía y accesorios adicionales recomendados.',
      demoUrl: 'tech-store.rutaslima.app',
      exampleProduct: 'Auriculares Inalámbricos Pro'
    }
  ]

  const features = [
    {
      icon: <Globe className="w-5 h-5 text-blue-600" />,
      title: 'Tu Propia Página Web',
      desc: 'Obtén tu dirección web profesional al instante (ej. tu-negocio.rutaslima.app) o conecta tu propio dominio .com personalizado.'
    },
    {
      icon: <FolderTree className="w-5 h-5 text-indigo-600" />,
      title: 'Catálogos y Categorías Ilimitadas',
      desc: 'Agrupa tus productos de acuerdo al giro de tu negocio. Crea categorías específicas para que tus clientes encuentren todo en segundos.'
    },
    {
      icon: <Share2 className="w-5 h-5 text-emerald-600" />,
      title: 'Enlaces Compartibles en WhatsApp',
      desc: 'Envía el link directo de un catálogo completo o de un producto específico por WhatsApp, Instagram, TikTok o Facebook.'
    },
    {
      icon: <MessageSquare className="w-5 h-5 text-green-600" />,
      title: 'Pedidos Directos al Chat',
      desc: 'Tus clientes arman el carrito en tu web y con 1 clic recibes el pedido detallado en tu WhatsApp con el desglose exacto.'
    },
    {
      icon: <Percent className="w-5 h-5 text-red-600" />,
      title: '0% Comisiones por Venta',
      desc: 'El 100% de tus ventas es totalmente tuyo. Cobra directo por Yape, Plin, transferencia bancaria o en efectivo sin intermediarios.'
    },
    {
      icon: <Smartphone className="w-5 h-5 text-purple-600" />,
      title: 'Experiencia Móvil Ultra Rápida',
      desc: 'Tu sitio web carga inmediatamente en smartphones y computadoras con un diseño ultra moderno pensado en la conversión.'
    }
  ]

  const steps = [
    {
      num: '01',
      title: 'Crea tu Página Web',
      desc: 'Regístrate en segundos y define el nombre y enlace web de tu negocio.'
    },
    {
      num: '02',
      title: 'Organiza Catálogos y Categorías',
      desc: 'Sube tus productos, agrega fotos, descripciones, precios y ordénalos según el giro de tu marca.'
    },
    {
      num: '03',
      title: 'Comparte Links por WhatsApp',
      desc: 'Publica el enlace de tu web o de productos individuales en tus redes. ¡Recibe pedidos estructurados al instante!'
    }
  ]

  return (
    <main className="flex-grow bg-white text-slate-900 overflow-x-hidden w-full">
      
      {/* 1. HERO SECTION */}
      <section className="relative w-full max-w-7xl mx-auto px-6 py-12 sm:py-20 lg:py-24 flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
        
        {/* Glows y Luces de Fondo (Azul y Verde) */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-blue-500/10 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 translate-x-1/2 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-emerald-500/10 rounded-full blur-[90px] sm:blur-[120px] pointer-events-none" />

        {/* Textos del Hero */}
        <div className="flex-grow flex-shrink-0 space-y-6 lg:max-w-2xl text-center lg:text-left z-10 w-full lg:w-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-50/80 border border-blue-100 rounded-full text-blue-600 text-[10px] sm:text-xs font-extrabold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-blue-500 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Tu Tienda Web Lista en 30 Segundos</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-[58px] font-black tracking-tight leading-[1.1] sm:leading-[1.05] text-slate-900">
            Tu propia página web con catálogos y ventas por{' '}
            <span className="text-[#25D366] block sm:inline">
              WhatsApp
            </span>
          </h1>

          <p className="text-xs sm:text-base text-slate-600 font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">
            Digitaliza tu negocio con una página web profesional. Crea catálogos y categorías adaptadas a tu giro de negocio, comparte enlaces directos de tus productos en WhatsApp y redes sociales, y recibe pedidos ordenados sin pagar comisiones.
          </p>

          <div className="flex flex-col sm:flex-row gap-3.5 sm:gap-4 justify-center lg:justify-start pt-2 w-full max-w-sm sm:max-w-none mx-auto lg:mx-0">
            <Link 
              href="/login?mode=signup" 
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black tracking-wider uppercase shadow-xl shadow-blue-600/15 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 group min-h-[44px]"
            >
              <span className="text-white font-black">Crear Mi Página Web Gratis</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform flex-shrink-0" />
            </Link>
            <Link 
              href="/como-funciona" 
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold tracking-wider uppercase flex items-center justify-center transition-all hover:scale-[1.02] active:scale-95 min-h-[44px]"
            >
              ¿Cómo funciona?
            </Link>
          </div>

          {/* Destacados rápidos */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-8 border-t border-slate-200 max-w-sm sm:max-w-md mx-auto lg:mx-0 text-center lg:text-left">
            <div>
              <div className="text-lg sm:text-2xl font-black text-slate-900">100%</div>
              <div className="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5 leading-tight">Página Web Propia</div>
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-black text-slate-900">0%</div>
              <div className="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5 leading-tight">Comisiones</div>
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-black text-slate-900">En 1 Clic</div>
              <div className="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5 leading-tight">Enlace a WhatsApp</div>
            </div>
          </div>
        </div>

        {/* Mockup del Teléfono con Simulación de WhatsApp y Enlaces */}
        <div className="flex-grow flex-shrink-0 w-full max-w-sm relative flex justify-center z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-[60px]" />
          
          <div className="relative w-full max-w-[310px] sm:max-w-[325px] aspect-[9/18.5] rounded-[44px] border-[9px] border-slate-900 bg-[#E5DDD5] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col group transition-all duration-500 hover:scale-[1.02] hover:rotate-1">
            
            {/* Isla superior */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-slate-900 rounded-full z-30 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-slate-800 ml-auto mr-4" />
            </div>

            {/* HEADER DE WHATSAPP */}
            <div className="pt-7 pb-2.5 px-3.5 bg-[#075E54] text-white flex items-center gap-2 shadow-md relative z-10 flex-shrink-0">
              <div className="w-1.5 h-3 border-l-2 border-b-2 border-white transform -rotate-45 cursor-pointer opacity-80 hover:opacity-100" />
              
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs border border-white/20 shadow-inner flex-shrink-0 select-none">
                TR
              </div>
              
              <div className="flex-grow min-w-0">
                <div className="text-[11px] font-extrabold truncate">
                  Tienda Ramos (Tu Negocio)
                </div>
                <div className="text-[8px] text-emerald-300 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>En línea • Página Web Activa</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-white/90">
                <Video className="w-3.5 h-3.5 cursor-pointer hover:text-white" />
                <Phone className="w-3 h-3 cursor-pointer hover:text-white" />
                <MoreVertical className="w-3.5 h-3.5 cursor-pointer hover:text-white" />
              </div>
            </div>

            {/* CUERPO DEL CHAT */}
            <div className="flex-grow p-3 space-y-4 overflow-y-auto no-scrollbar bg-[#efeae2] relative text-[10px] leading-relaxed">
              
              {/* Globo 1: Compartir Enlace de Catálogo/Producto */}
              <div className="max-w-[88%] bg-[#d9fdd3] rounded-2xl rounded-tr-none p-3 shadow-[0_1px_0.5px_rgba(0,0,0,0.1)] ml-auto space-y-2 relative border border-emerald-200/10">
                <p className="font-semibold text-slate-800 text-[10px]">
                  ¡Hola! 👋 Mira nuestros nuevos productos y categorías en nuestra página web:
                </p>
                
                <div className="bg-white/90 border border-emerald-200 rounded-xl overflow-hidden flex flex-col cursor-pointer hover:bg-white transition-colors p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-extrabold text-blue-600 uppercase tracking-wide bg-blue-50 px-1.5 py-0.5 rounded">Catálogo Oficial</span>
                    <Share2 className="w-3 h-3 text-slate-400" />
                  </div>
                  <div className="font-bold text-slate-900 text-[9.5px]">mi-negocio.rutaslima.app</div>
                  <div className="text-[8px] text-slate-500 truncate">Categorías: Platos, Bebidas, Promociones</div>
                </div>
                
                <div className="flex items-center justify-end gap-1 text-[7px] text-slate-500 font-bold">
                  <span>10:30 AM</span>
                  <CheckCheck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                </div>
              </div>

              {/* Globo 2: Pedido Recibido desde la Web */}
              <div className="max-w-[90%] bg-white rounded-2xl rounded-tl-none p-3 shadow-[0_1px_0.5px_rgba(0,0,0,0.1)] space-y-2 relative border border-slate-200/20">
                <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[9px] border-b border-slate-100 pb-1">
                  <ShoppingBag className="w-3 h-3" />
                  <span>NUEVO PEDIDO DESDE TU WEB</span>
                </div>
                <p className="font-medium text-slate-800 text-[8.5px] leading-relaxed whitespace-pre-line font-mono">
                  • 1x Combo Familiar (S/ 45.00)
                  {"\n"}• 2x Postre Artesanal (S/ 12.00)
                  {"\n"}----------------------------
                  {"\n"}*Total a Cobrar:* S/ 57.00
                  {"\n"}
                  {"\n"}*Cliente:* Martín Maldonado
                  {"\n"}*Pago:* Yape / Efectivo
                </p>
                
                <span className="text-[7px] text-slate-400 font-bold block text-right">10:32 AM</span>
              </div>

            </div>

            {/* INPUT DE WHATSAPP INFERIOR */}
            <div className="p-2 bg-[#f0f2f5] flex items-center gap-1.5 border-t border-slate-200/30 flex-shrink-0 relative z-10">
              <div className="flex-grow bg-white rounded-full px-3 py-2 flex items-center gap-2 border border-slate-200/50 shadow-sm min-w-0">
                <Smile className="w-4 h-4 text-slate-400 cursor-pointer flex-shrink-0" />
                <span className="text-slate-400 text-[10px] font-medium flex-grow truncate select-none">
                  Responder al cliente...
                </span>
                <Paperclip className="w-3.5 h-3.5 text-slate-400 cursor-pointer transform -rotate-45 flex-shrink-0" />
                <Camera className="w-4 h-4 text-slate-400 cursor-pointer flex-shrink-0" />
              </div>
              
              <div className="w-9 h-9 rounded-full bg-[#128C7E] text-white flex items-center justify-center shadow cursor-pointer hover:bg-[#075E54] active:scale-95 transition-all flex-shrink-0">
                <Send className="w-3.5 h-3.5 text-white ml-0.5" />
              </div>
            </div>
            
          </div>

          {/* Alertas flotantes decorativas (oculta desbordamiento en móviles muy angostos) */}
          <div className="hidden sm:flex absolute top-28 -right-4 md:-right-12 bg-white border border-slate-100 p-3.5 rounded-2xl shadow-2xl items-center gap-3 backdrop-blur max-w-[220px] hover:scale-105 transition-transform duration-300 z-20">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold">
              <Globe className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-extrabold text-slate-900">Página Web Activa</div>
              <div className="text-[9px] text-blue-600 font-mono font-bold truncate">tu-tienda.rutaslima.app</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SHOWCASE POR GIROS DE NEGOCIO */}
      <section className="w-full bg-slate-50/70 border-t border-b border-slate-200/60 py-20 sm:py-28 relative">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3.5">
            <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-100">
              Adaptado a Cualquier Comercio
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Una página web configurada según el giro de tu negocio
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
              Crea categorías personalizadas, organiza tus productos por colecciones y ofrece una navegación intuitiva a tus clientes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {girosDeNegocio.map((giro, idx) => (
              <div 
                key={idx} 
                className="bg-white border border-slate-200/70 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                      {giro.icon}
                    </div>
                    <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider bg-slate-100 px-2.5 py-1 rounded-full">
                      {giro.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                    {giro.title}
                  </h3>

                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    {giro.desc}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 space-y-2">
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Tu Enlace Web:</div>
                  <div className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50/70 p-2 rounded-xl border border-blue-100 truncate">
                    {giro.demoUrl}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. EL PODER DE COMPARTIR EN CADA CANAL */}
      <section className="w-full py-20 sm:py-28 bg-white relative">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6 text-center lg:text-left">
              <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-100">
                Difusión Directa en Redes Sociales
              </span>
              
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                Comparte enlaces directos de tus productos y catálogos por WhatsApp
              </h2>

              <p className="text-xs sm:text-base text-slate-600 font-medium leading-relaxed">
                Cada producto y catálogo que publicas genera una URL única. Cópiala y compártela en tus chats de WhatsApp, historias de Instagram, videos de TikTok o campañas de Facebook Ads.
              </p>

              <div className="space-y-3 pt-2 max-w-md mx-auto lg:mx-0 text-left">
                <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Enlace a Catálogos Completos</div>
                    <div className="text-[11px] text-slate-500">Muestra todas tus categorías de temporada en un solo clic.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Enlaces a Productos Individuales</div>
                    <div className="text-[11px] text-slate-500">Promociona ofertas específicas directo al carrito de compra.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Simulación Interactiva de Enlace Compartible */}
            <div className="bg-slate-900 text-white rounded-[32px] p-8 space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]" />
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className="text-[10px] font-mono text-slate-400">Vista de Enlace Compartido</span>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-base">
                    🛍️
                  </div>
                  <div className="min-w-0">
                    <div className="font-extrabold text-sm text-white">Catálogo Primavera - Verano</div>
                    <div className="text-xs text-emerald-400 font-mono truncate">tu-tienda.rutaslima.app/c/primavera</div>
                  </div>
                </div>

                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-700 text-xs text-slate-300 space-y-2">
                  <div className="flex justify-between items-center text-[11px] font-bold">
                    <span>Acceso directo desde WhatsApp</span>
                    <span className="text-emerald-400">Sin instalar apps</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    El cliente toca el link, explora tus categorías, agrega productos al carrito y te envía la lista lista a tu chat.
                  </p>
                </div>
              </div>

              <div className="pt-2 text-center">
                <Link 
                  href="/login?mode=signup" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-colors shadow-lg shadow-emerald-500/20"
                >
                  <span>Probar Enlaces de WhatsApp</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. CARACTERÍSTICAS Grid Section */}
      <section className="w-full bg-slate-50/55 border-t border-b border-slate-100 py-20 sm:py-28 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3.5">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-100">
              Características Clave
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Todo lo que necesitas para tu presencia web
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
              Combina la seriedad de una plataforma e-commerce con la agilidad de los pedidos por WhatsApp.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, idx) => (
              <div 
                key={idx} 
                className="bg-white border border-slate-200/50 p-6.5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.01)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.03)] hover:border-slate-200 transition-all duration-300 group hover:-translate-y-1"
              >
                <div className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  {feat.icon}
                </div>
                <h3 className="text-sm font-bold text-slate-950 mb-2 group-hover:text-blue-600 transition-colors">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CÓMO FUNCIONA Section */}
      <section className="w-full py-20 sm:py-28 bg-white relative">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3.5">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-100">
              Proceso Simple
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              ¿Cómo lanzar tu tienda web hoy mismo?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
              Configura tu espacio web en tres sencillos pasos sin necesidad de saber programar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            
            {/* Conectores decorativos de escritorio */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-blue-500/30 via-emerald-500/30 to-blue-500/30 -z-10" />

            {steps.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-slate-50 border-2 border-slate-200/60 shadow flex items-center justify-center font-black text-2xl text-blue-600 relative select-none">
                  {step.num}
                  <span className="absolute -bottom-1 w-6 h-1 bg-blue-500 rounded-full" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 pt-2">{step.title}</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xs">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION FINAL */}
      <section className="w-full bg-blue-600 py-16 sm:py-24 relative overflow-hidden text-white text-center">
        
        {/* Glows decorativos del CTA */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-6 relative z-10 space-y-6 sm:space-y-8">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Crea tu página web y empieza a recibir pedidos hoy
          </h2>
          
          <p className="text-xs sm:text-base text-blue-100 font-medium max-w-xl mx-auto leading-relaxed">
            Publica tus catálogos, organiza tus categorías por giro de negocio y comparte tus enlaces directos a WhatsApp sin pagar comisiones.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Link 
              href="/login?mode=signup" 
              className="px-8 py-4 bg-white hover:bg-slate-50 text-blue-600 rounded-xl text-xs font-black tracking-wider uppercase shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              Crear Mi Página Web Gratis
            </Link>
            <Link 
              href="/precios" 
              className="px-8 py-4 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold tracking-wider uppercase border border-blue-500/50 hover:scale-105 active:scale-95 transition-all"
            >
              Ver Planes de Precios
            </Link>
          </div>
        </div>
      </section>

    </main>
  )
}
