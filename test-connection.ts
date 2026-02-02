import dotenv from "dotenv";

// Cargar variables de entorno PRIMERO
dotenv.config({ path: ".env.local" });

import { prisma } from "./src/lib/prisma";

async function testConnection() {
  try {
    console.log("🔄 Probando conexión con el nuevo esquema...");

    // Verificar que podemos conectarnos
    const userCount = await prisma.user.count();
    console.log(`✅ Conexión exitosa! Usuarios encontrados: ${userCount}`);

    // Verificar que podemos leer del nuevo esquema
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true },
      take: 3,
    });
    console.log("📋 Usuarios en el nuevo esquema:", users);

    // Verificar que podemos acceder a las tablas relacionadas
    const watchlistCount = await prisma.watchlistItem.count();
    console.log(`📽️ Elementos en watchlist: ${watchlistCount}`);

    console.log("🎉 ¡Todo funciona correctamente con el nuevo esquema!");
  } catch (error) {
    console.error("❌ Error al conectar con la base de datos:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
