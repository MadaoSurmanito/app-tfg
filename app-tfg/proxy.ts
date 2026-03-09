// Este archivo se encarga de redirigir las peticiones a las rutas de autenticación, es decir, todas las peticiones que empiecen por /profesionales/ serán redirigidas a la API de autenticación para que se encargue de manejarlas, esto es necesario para proteger las rutas de profesionales y evitar que usuarios no autenticados puedan acceder a ellas
export { auth as proxy } from "@/auth";

export const config = {
  matcher: ["/profesionales/:path*"],
};