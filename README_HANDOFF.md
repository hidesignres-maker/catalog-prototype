# National Assortment Catalog - Prototype Handoff

## 1. Arquitectura General (v2)
El prototipo fue refactorizado a una arquitectura modular orientada a datos (`script_robusto_v2.js`), separando estrictamente la capa de vista de la capa de datos.

### Componentes Core:
- **`DataStore`**: Única fuente de verdad. Mantiene la lista cruda de productos (`items`), el estado de los filtros (`filters`), la paginación y la selección actual (checkboxes).
- **`FilterStrategies`**: Patrón funcional y composable. Cada filtro (búsqueda, tabs, selects) es una función pura independiente. Esto permite agregar nuevos filtros sin tocar la lógica existente ni romper otros filtros.
- **`PaginationEngine`**: Calcula y recorta matemáticamente la data visible (`offset` y `limit`) de forma real.
- **`DataAccessor`**: Funciona como un pipeline. Toma el `DataStore`, lo pasa por `FilterStrategies`, luego por el sorting, y finalmente por el `PaginationEngine` para retornar solo la porción de datos exacta que la tabla debe dibujar.
- **`ColumnDefinitions`**: Array de configuración UI-driven. Define el id, label y la función `render(row)` de cada columna. Si mañana se desea agregar "Edición Inline", solo hay que modificar la función `render` de la columna específica para que devuelva un `<input>` en lugar de texto.
- **`UIManager`**: Renderiza la tabla iterando sobre `ColumnDefinitions` y actualiza contadores.
- **`EventHandler`**: Usa "Event Delegation" (listeners en los contenedores padre, no en las filas individuales) para mejorar el rendimiento y manejar dropdowns, tooltips y botones.

## 2. Sistema de Tags (Fase 1 implementada)
Se incluyó un sistema de simulación de "Tag Library" externa.
- Existe el objeto `TagManager` que precarga 15 tags divididos en dos clientes (`Walmart`, `Target`) y dos tipos (`simple`, `refined`).
- El manager inicializa los tags y calcula dinámicamente la propiedad `isDuplicate: true` si detecta que el mismo nombre de tag existe para más de un cliente.
- **Renderizado Inteligente**: La columna `TAGS` está configurada para mostrar un máximo de 2 tags por producto.
  - Tags refinados: Se muestran en color azul claro con ícono de reloj. En `hover`, muestran la fecha de término (`endDate`).
  - Tags duplicados: Se muestran con un ícono naranja de copia.
  - Exceso de tags: Si hay > 2 tags, el resto se agrupa en un chip de texto `+X`. En `hover`, despliega un tooltip con los nombres de los tags ocultos.

## 3. Comportamientos Críticos de UI Implementados
- **Dropdowns ("Kebab menu")**: El menú de acciones de la fila (3 puntitos) utiliza `position: fixed` calculando coordenadas del ratón. Esto soluciona problemas de clipping (cortes) si la tabla tiene poco contenido y permite que el menú no fuerce barras de scroll innecesarias.
- **Scroll del Contenedor**: El scroll horizontal está confinado a la tabla (`table-container { overflow-x: auto }`), mientras que el scroll vertical pertenece a toda la página. Los headers (`th`) utilizan `position: sticky` para permanecer visibles.
- **Auto-redirección**: Cuando el estatus de un producto se cambia a "DISCO" desde el menú Kebab, el prototipo automáticamente cambia la vista principal al tab de "Discontinuations".

## 4. Trabajo Pendiente / Próximos Pasos (Fase 2)
- **Modal de Asignación de Tags**: Construir la interfaz (Modal) que se abre al dar clic al botón "Tag" superior, para permitir al usuario asignar/remover tags de los productos seleccionados. Este modal deberá listar tags por cliente y contar con barra de búsqueda interna.
- **Edición Inline / Drawer Completo**: Actualmente el Drawer derecho (al dar click en la celda Status) tiene placeholders. Se debe expandir el contenido del formulario allí.
- **Botones de Paginación**: La lógica de `PaginationEngine` ya calcula offsets, totals y booleanos de `hasNextPage`, pero falta pintar los botones `<` `>` en el HTML (`index.html`) y enlazarlos al `DataStore.setPagination()`.

### Actualización (Fase 2 - Tags)
- **Modal de Asignación de Tags**: Implementado con éxito. El botón "Tag" en la barra de acciones ahora despliega el modal `TagModalManager`.
- Soporta búsqueda en tiempo real.
- Agrupa visualmente los tags por cliente (Mocked: Walmart -> Amazon, Target -> DoorDash para el demo).
- Detecta nombres de tags duplicados entre canales y activa la advertencia (Warning Banner) si coinciden.
- La aplicación de tags actualiza el estado de los productos seleccionados e inyecta los visuales instantáneamente a través del `UIManager`.

## 5. Notas de Estado Actual y Deuda Técnica

### Filtros
- **More filters — campos duplicados**: El popover de "More filters" permite agregar condiciones con los mismos campos que ya están disponibles como quick filters (Customer, Status, Brand, Vendor Code). Antes de producción, se debe definir si "More filters" reemplaza o complementa los quick filters, y evitar que el usuario pueda crear condiciones redundantes.
- **Alineación del multi-select**: El panel desplegable de los quick filters (especialmente al abrir Brand o Vendor Code) debe alinearse al botón de "Tag" en la barra de acciones como referencia visual. Actualmente se abre alineado a su propio trigger, lo que en pantallas angostas puede quedar fuera del área visual esperada.

### Botones sin función definida
- **Botón "Dismiss"**: El botón "Dismiss" en la barra de acciones no tiene comportamiento implementado. Falta definir su función: ¿descarta la selección actual? ¿cierra un estado de error? ¿oculta una notificación? Requiere decisión de producto antes de implementar.

### Mock Data
- **Data de un solo cliente real**: El mock data actual (`data.js`) genera ~100 registros programáticamente pero todos corresponden a productos de Amazon como retailer principal. Si se quiere demostrar el prototipo con múltiples clientes de forma realista (Walmart, Kroger, Target, etc.), se necesitaría expandir la base de productos o conectar a una fuente de datos real.
- **Datos generados, no reales**: Los valores de RSV, costos y precios son aproximaciones para fines de demo. No reflejan datos de catálogo reales de PepsiCo.
