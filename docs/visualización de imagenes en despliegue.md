📌 No están las imágenes de la landing!. ¿Por qué ocurre esto?

Vite construye el sitio con rutas absolutas por defecto. Cuando el sitio se sirve en la raíz de un dominio (https://midominio.com/), una ruta como /images/foto.webp funciona perfectamente. Pero en GitHub Pages, el sitio vive en un subdirectorio (https://usuario.github.io/enrutados-venezuela/), por lo que esa misma ruta apunta a https://usuario.github.io/images/foto.webp — que no existe, y devuelve un 404.

import.meta.env.BASE_URL resuelve esto porque Vite la reemplaza en tiempo de build con el valor correcto (/enrutados-venezuela/). Es la forma estándar y recomendada de manejar rutas de assets en Vite.