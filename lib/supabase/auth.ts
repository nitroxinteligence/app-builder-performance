import { createClient } from "./client"
import type { Provider } from "@supabase/supabase-js"

export type OAuthProvider = "google" | "apple"

export interface AuthResult {
  success: boolean
  error?: string
}

export interface SignUpMetadata {
  full_name?: string
  avatar_url?: string
  [key: string]: unknown
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Sign in failed:", error)
    return {
      success: false,
      error: "Failed to sign in. Please try again.",
    }
  }
}

export async function signUpWithEmail(
  email: string,
  password: string,
  metadata?: SignUpMetadata
): Promise<AuthResult> {
  try {
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Sign up failed:", error)
    return {
      success: false,
      error: "Failed to create account. Please try again.",
    }
  }
}

export async function signOut(): Promise<AuthResult> {
  try {
    const supabase = createClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Sign out failed:", error)
    return {
      success: false,
      error: "Failed to sign out. Please try again.",
    }
  }
}

export async function resetPassword(email: string): Promise<AuthResult> {
  try {
    const supabase = createClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Password reset failed:", error)
    return {
      success: false,
      error: "Failed to send reset email. Please try again.",
    }
  }
}

export async function updatePassword(password: string): Promise<AuthResult> {
  try {
    const supabase = createClient()

    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Password update failed:", error)
    return {
      success: false,
      error: "Failed to update password. Please try again.",
    }
  }
}

export async function signInWithOAuth(
  provider: OAuthProvider
): Promise<AuthResult> {
  try {
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider as Provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return { success: true }
  } catch (error) {
    console.error("OAuth sign in failed:", error)
    return {
      success: false,
      error: "Failed to sign in with provider. Please try again.",
    }
  }
}
