import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * useAuth — sesión Supabase + magic-link email.
 *
 * Pensado para Socios (dueños de comercios) que quieran editar su ficha.
 * Vecino común no necesita login para leer ni para enviar solicitudes.
 *
 * Modo demo (sin Supabase): user/session siempre null, signIn/signOut no-op.
 */

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: isSupabaseConfigured,
  });

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setState({ user: null, session: null, loading: false });
      return;
    }
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setState({
        user: data.session?.user ?? null,
        session: data.session,
        loading: false,
      });
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setState({ user: session?.user ?? null, session, loading: false });
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function signInMagicLink(email: string) {
    if (!isSupabaseConfigured || !supabase) {
      return { ok: false, error: "Supabase no configurado", modo: "demo" as const };
    }
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + "/socio" },
    });
    if (error) return { ok: false, error: error.message, modo: "supabase" as const };
    return { ok: true, modo: "supabase" as const };
  }

  async function signOut() {
    if (!isSupabaseConfigured || !supabase) return;
    await supabase.auth.signOut();
  }

  return { ...state, signInMagicLink, signOut };
}
