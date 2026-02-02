import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config({ path: ".env.local" });

console.log("🔍 Verificando variables de entorno...");
console.log(
  "DATABASE_URL:",
  process.env.DATABASE_URL ? "✅ Configurada" : "❌ No encontrada",
);
console.log(
  "TMDB_ACCESS_TOKEN:",
  process.env.TMDB_ACCESS_TOKEN ? "✅ Configurado" : "❌ No encontrado",
);
console.log(
  "JWT_SECRET:",
  process.env.JWT_SECRET ? "✅ Configurado" : "❌ No encontrado",
);

if (process.env.DATABASE_URL) {
  console.log(
    "🔗 URL de base de datos:",
    process.env.DATABASE_URL.substring(0, 50) + "...",
  );
}
