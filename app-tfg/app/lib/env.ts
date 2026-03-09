// Este archivo se encarga de cargar las variables de entorno desde el archivo .env.local y exportarlas para que puedan ser usadas en toda la aplicación
export const env = {
  dbHost: process.env.DB_HOST!,
  dbPort: Number(process.env.DB_PORT!),
  dbName: process.env.DB_NAME!,
  dbUser: process.env.DB_USER!,
  dbPassword: process.env.DB_PASSWORD!,
};