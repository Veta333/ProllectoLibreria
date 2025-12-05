Descripción del proyecto

Este proyecto consiste en el desarrollo de una página web de comercio electrónico para una librería local. La plataforma permite gestionar un catálogo de libros, mostrar futuros lanzamientos y ofrecer herramientas para organizar actividades y talleres presenciales.
El sitio está diseñado para facilitar la compra a clientes locales y ampliar el alcance hacia compradores externos.

Funcionalidades principales

Registro e inicio de sesión mediante Firebase Authentication.

Roles de usuario: comprador y administrador.

Catálogo de libros cargado dinámicamente desde Firestore.

Vista detallada de cada libro.

Sistema de carrito con actualización automática de stock.

Lista de deseos vinculada al usuario.

Filtros por género literario y buscador en tiempo real.

Calendario para mostrar y gestionar eventos.

Panel de administración para modificar libros, libros futuros y eventos.

Control de acceso según el rol del usuario.

Diseño responsive para distintos tamaños de pantalla.

Tecnologías utilizadas

HTML5, CSS3 y JavaScript.

Firebase Authentication y Firestore Database.

Firebase Hosting y Vercel para despliegue.

GitHub para control de versiones.

Estructura del proyecto

El proyecto se organiza en carpetas separadas para HTML, CSS, JS e imágenes.
Algunos archivos principales son:

index.html

HTML/Libros.html

HTML/DetalleLibro.html

HTML/Librosfuturos.html

HTML/Admin.html

JS/Header.js

JS/Libros.js

JS/Detalle.js

Instalación y uso

Descargar o clonar el repositorio.

Configurar Firebase con las claves del proyecto en los archivos JavaScript correspondientes.

Abrir el proyecto con un servidor local (por ejemplo, Live Server).

Acceder a index.html para iniciar la navegación.

Control de acceso

Los usuarios administradores pueden acceder al panel de gestión y visualizar un botón adicional en la página principal.
Los usuarios no autenticados no pueden usar el carrito ni la lista de deseos.

Objetivo

El proyecto busca mejorar la visibilidad de la librería, facilitar las compras y permitir la gestión de actividades locales desde un entorno web accesible.