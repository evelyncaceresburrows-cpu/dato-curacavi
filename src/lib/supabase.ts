import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase para Dato Curacaví.
 *
 * Para empezar a operar, define en tu .env:
 *   VITE_SUPABASE_URL=https://xxxxx.supabase.co
 *   VITE_SUPABASE_ANON_KEY=ey...
 *
 * Mientras no haya credenciales, el código cae a mockData.ts
 * para no romper la experiencia de los vecinos.
 */

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = isSupabaseConfigured
  ? createClient(url!, anonKey!)
  : null;

/**
 * SQL de referencia para tus tablas en Supabase
 * (deja esto en /supabase/schema.sql del repo):
 *
 * create type categoria_comercio as enum (
 *   'dulces', 'chicha', 'comida', 'servicio', 'tramite'
 * );
 *
 * create table comercios (
 *   id uuid primary key default gen_random_uuid(),
 *   nombre text not null,
 *   categoria categoria_comercio not null,
 *   descripcion_vecina text,
 *   direccion text,
 *   telefono text,
 *   verificado boolean default false,
 *   es_pro boolean default false,
 *   creado_en timestamptz default now()
 * );
 *
 * create table membresias_pendientes (
 *   id uuid primary key default gen_random_uuid(),
 *   nombre_comercio text not null,
 *   contacto text not null,
 *   plan text default 'presencia',
 *   mensaje text,
 *   status text default 'pendiente',
 *   creado_en timestamptz default now()
 * );
 */
