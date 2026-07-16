import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    
    let exchangeSuccess = false
    let lastError: any = null

    // Mecanismo de hasta 3 reintentos para mitigar la inestabilidad de red DNS/TCP en el primer fetch
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
          exchangeSuccess = true
          break
        }
        lastError = error
      } catch (err: any) {
        lastError = err
      }
      
      if (attempt < 3) {
        // Pausa de 200ms entre intentos para dar holgura a la conexión
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    }

    if (exchangeSuccess) {
      return NextResponse.redirect(`${origin}${next}`)
    } else {
      console.error('Error definitivo al intercambiar código por sesión tras 3 intentos:', lastError)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`)
}
