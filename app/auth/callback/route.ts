import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    console.log("[Auth Callback] Starting callback processing...")
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get("code")

    if (!code) {
      console.error("[Auth Callback] No code provided")
      return NextResponse.redirect(new URL("/auth/login", requestUrl.origin))
    }

    console.log("[Auth Callback] Creating Supabase client...")
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    console.log("[Auth Callback] Exchanging code for session...")
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error("[Auth Callback] Session exchange error:", error)
      return NextResponse.redirect(new URL("/auth/login", requestUrl.origin))
    }

    console.log("[Auth Callback] Session exchange successful")
    return NextResponse.redirect(new URL("/dashboard", requestUrl.origin))
  } catch (error) {
    console.error("[Auth Callback] Unexpected error:", error)
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }
}