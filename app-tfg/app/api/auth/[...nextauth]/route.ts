// Esta Api Route es la encargada de manejar las peticiones de autenticación, se encarga de redirigir las peticiones a los handlers correspondientes dependiendo del método HTTP (GET, POST, etc) y de la ruta (/api/auth/[...nextauth])
import { handlers } from "@/auth";

export const { GET, POST } = handlers;