/**
 * lib/mockData.ts
 *
 * ⚠️ SHIM de compatibilidad. La fuente de verdad única es `@/data/seed`.
 * Re-exporta bajo los nombres legacy que aún consumen algunos componentes
 * del concierge (PicadasSkill, DatoDeLaSemana, NumerosDelVecino).
 *
 * TODO (Etapa 2): migrar esos componentes y eliminar este archivo.
 */

export {
  COMERCIOS_SEMILLA,
  DATO_DE_LA_SEMANA,
  NUMEROS_DEL_VECINO,
} from "@/data/seed";
