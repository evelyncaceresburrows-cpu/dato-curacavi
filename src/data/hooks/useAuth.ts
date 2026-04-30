import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * useAuth — sesión Supabase + magic-link email + rol del profile.
 *
 * Pensado para:
 *   - Admin (panel /admin): rol='admin' permite editar comercios/eventos/solicitudes.
 *   - Socios (dueños de comercios) en futuro.
 *   - Vecino común no necesita login para leer ni para enviar solicitudes.
 *
 * Modo demo (sin Supabase): user/session/rol siempre null, signIn/signOut no-op.
 */

export type Rol = "admin" | "editor" | "socio" | null;

interface AuthState {
  user: User | null;
  session: Session | null;
  rol: Rol;
  loading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    rol: null,
    loading: isSupabaseConfigured,
  });

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setState({ user: null, session: null, rol: null, loading: false });
      return;
    }
    let mounted = true;

    async function loadRol(userId: string): Promise<Rol> {
      if (!supabase) return null;
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("rol")
          .eq("id", userId)
          .maybeSingle();
        if (error || !data) return null;
        return (data.rol as Rol) ?? "socio";
      } catch (err) {
        console.warn("[useAuth] loadRol falló:", err);
        return null;
      }
    }

    // getSession puede fallar si hay sesión corrupta en localStorage
    // (típico: error "non ISO-8859-1 code point" cuando algún metadata trae
    // caracteres con acento). Si revienta, limpiamos y arrancamos sin sesión.
    (async () => {
      if (!supabase) return;
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        const u = data.session?.user ?? null;
        const rol = u ? await loadRol(u.id) : null;
        if (mounted) setState({ user: u, session: data.session, rol, loading: false });
      } catch (err) {
        console.warn("[useAuth] getSession falló — limpio storage y sigo sin sesión:", err);
        try {
          // Limpia keys de Supabase para que el próximo login arranque limpio.
          Object.keys(localStorage)
            .filter((k) => k.startsWith("sb-"))
            .forEach((k) => localStorage.removeItem(k));
        } catch {
          /* ignorar */
        }
        if (mounted) setState({ user: null, session: null, rol: null, loading: false });
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        const u = session?.user ?? null;
        const rol = u ? await loadRol(u.id) : null;
        if (mounted) setState({ user: u, session, rol, loading: false });
      } catch (err) {
        console.warn("[useAuth] onAuthStateChange falló:", err);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function signInMagicLink(email: string, redirectPath = "/admin") {
    if (!isSupabaseConfigured || !supabase) {
      return { ok: false, error: "Supabase no configurado", modo: "demo" as const };
    }
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + redirectPath },
    });
    if (error) return { ok: false, error: error.message, modo: "supabase" as const };
    return { ok: true, modo: "supabase" as const };
  }

  async function signOut() {
    if (!isSupabaseConfigured || !supabase) return;
    await supabase.auth.signOut();
  }

  return {
    ...state,
    isAuth: !!state.user,
    isAdmin: state.rol === "admin",
    signInMagicLink,
    signOut,
  };
}
