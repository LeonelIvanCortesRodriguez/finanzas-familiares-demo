<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/brand/hero-dark.png">
  <img src="docs/brand/hero-light.png" width="1280" alt="Finanzas Familiares Demo. Revisa cada línea antes de confiar en los totales. Para quien lleva las cuentas de la casa; datos ficticios, sin carga de archivos y sin conexión bancaria. Una tira de estado de cuenta ficticio: tres filas marcadas como aceptadas, SYN-049 tachada por duplicada, SYN-051 encerrada en un círculo porque le falta categoría, SYN-052 tachada por importe inválido y STATEMENT-02 retenido porque su saldo final declarado de MX$3,796.78 difiere del calculado de MX$3,789.47 por MX$7.31. Abajo: 52 registros de origen, 49 aceptados, 5 excepciones para una persona y 49 filas que alimentan las cifras.">
</picture>

**[Abrir el demo en vivo](https://leonelivancortesrodriguez.github.io/finanzas-familiares-demo/)** · [Ejecutarlo localmente](#ejecutar-y-verificar) · [El papel de Leonel](#el-papel-de-leonel-y-sus-decisiones) · [English](README.md)

Un estado de cuenta bancario familiar ficticio, revisado línea por línea. El demo muestra en qué cifras se puede confiar y mantiene cada duplicado, fila con error y estado de cuenta descuadrado frente a una persona hasta que se resuelve. Solo procesa la muestra incluida: no hay carga de archivos ni conexión con ningún banco.

La interfaz y la documentación técnica están en inglés.

## El problema

Un tablero de finanzas se ve en orden aunque la importación de abajo tenga filas repetidas, un importe mal formado o un estado de cuenta cuyo saldo final no cuadra. Muchas herramientas ocultan esos problemas o los "corrigen" sin avisar, y quien lee los totales no puede saber qué es seguro usar.

## Una revisión de principio a fin

<picture>
  <source media="(prefers-reduced-motion: reduce)" srcset="docs/brand/demo-poster.png">
  <img src="docs/brand/demo.gif" width="960" alt="Cinco cuadros con subtítulos del demo en ejecución: la revisión de importación con un estado de cuenta retenido; la tabla de conciliación con STATEMENT-02 calculado en MX$3,789.47 y declarado en MX$3,796.78; la lista de filas apartadas y la categoría faltante; el libro filtrado en la fila SYN-051, que necesita a una persona; y la sección que explica qué calcula el sistema y qué confirma una persona.">
</picture>

El estado de cuenta retenido va primero, sus dos saldos finales aparecen lado a lado, cada fila apartada conserva su motivo y el pendiente abierto se rastrea hasta su fila de origen. [Versión MP4](docs/brand/demo.mp4).

## Cómo funciona el flujo

`registros de origen → validación y conciliación → excepciones → vista financiera utilizable`

1. **Registros de origen.** 52 filas ficticias en dos estados de cuenta, generadas con la semilla `20261026`, más saldos iniciales y finales declarados y límites de presupuesto. Estos son los *hechos de origen*.
2. **Validación y conciliación.** [`src/engine.mjs`](src/engine.mjs) valida fechas y centavos enteros, normaliza etiquetas, retiene huellas de duplicados exactos, aplica reglas de categoría con nombre y calcula el saldo final de cada estado de cuenta a partir de sus filas aceptadas.
3. **Excepciones.** Dos duplicados y un importe mal formado se apartan con su motivo. Una fila aceptada no coincide con ninguna regla de categoría. El saldo final declarado de un estado de cuenta difiere del calculado por MX$7.31. Son cinco pendientes para una persona.
4. **Vista utilizable.** El flujo de efectivo y la variación contra presupuesto se calculan con las 49 filas aceptadas. Retener un estado de cuenta pone en duda su saldo final, pero sus filas aceptadas siguen contando en las cifras.

El sistema nunca inventa una corrección.

| El sistema calcula | Una persona confirma |
| --- | --- |
| Validación de fechas y centavos enteros | Si una fila excluida de verdad era inválida |
| Huellas de duplicados | Si un duplicado retenido es una repetición real |
| Categoría según reglas de palabras clave | Cualquier categoría que las reglas no pudieron asignar |
| Saldo final calculado del estado de cuenta | Por qué no coincide un saldo final declarado y qué hacer al respecto |
| Flujo de efectivo y variación contra presupuesto con filas aceptadas | Si las cifras sirven para tomar una decisión |

## Resultado y evidencia

| Estado | Qué cubre | Dónde verificarlo |
| --- | --- | --- |
| Implementado y probado | Validación, retención de duplicados, reglas de categoría, conciliación, cola de revisión, exportación de la bitácora de auditoría | `npm test` (Node test runner con defectos sembrados), [`tests/engine.test.mjs`](tests/engine.test.mjs) |
| Probado con mutaciones | Se detecta cada defecto de saldo, duplicado e importe | `npm run test:mutation` |
| Revisado contra desviaciones | La muestra guardada coincide con el generador de semilla fija; los totales son 52, 49, 5 y 1 de 2 | `node scripts/verify.mjs` |
| No se afirma | Uso con datos reales de una familia, asesoría financiera, un clasificador entrenado, preparación para producción | No hay evidencia en este repositorio |

El botón **Export the audit trail** descarga `sourceFacts`, `derived`, `manualReview` y `auditTrail` como campos JSON separados. Registra decisiones y motivos; no guarda cada fila de origen rechazada.

## Vistas del producto

<img src="docs/brand/view-held.png" width="1400" alt="Captura anotada de la sección de pendientes retenidos: la tabla de conciliación con STATEMENT-02 resaltado y marcado como retenido, y tarjetas del estado de cuenta retenido, dos duplicados y una fila inválida tachados con sus motivos, y SYN-051 en un círculo por falta de categoría. Las notas dicen que la diferencia no se corrige, que las filas apartadas conservan su motivo y que la forma y la etiqueta comunican cada estado.">

<img src="docs/brand/view-flow.png" width="1400" alt="Captura anotada del flujo de importación: 52 registros de origen, 49 filas aceptadas con 2 duplicados y 1 importe mal formado apartados, 5 excepciones para una persona en la columna terracota y 49 filas que alimentan la vista utilizable, con los totales calculados debajo.">

<img src="docs/brand/view-mobile.png" width="930" alt="Captura anotada del demo a 390 píxeles de ancho: primero aparecen el encabezado del estado de cuenta retenido, el aviso de datos ficticios y el panel de retención con su acción, y nada se desplaza hacia los lados.">

## El papel de Leonel y sus decisiones

**Problema elegido.** Mostrar que una vista de finanzas familiares puede decir qué cifras calculó y cuáles todavía tiene que confirmar una persona.

**Papel.** Leonel fijó el objetivo del producto y los requisitos de control: trazabilidad del origen al resultado, estados de revisión explícitos y una vista de control que un líder de operaciones pueda leer rápido. Agentes de programación ayudaron a implementar esta demostración pública. Su lógica y sus datos de prueba se escribieron para este repositorio; no se copió la aplicación privada Finanzas Familiares ni sus registros.

**Decisiones que le dan forma**

- *La excepción va primero.* Un estado de cuenta retenido tiene prioridad sobre cualquier total de rutina en la primera pantalla.
- *Apartar, nunca borrar.* Las filas excluidas siguen visibles con su motivo, porque una persona también confirma las exclusiones.
- *Aceptada y categorizada son cosas distintas.* Una fila sin regla de categoría sigue contando en las cifras; su categoría espera revisión.
- *Retener pone en duda un saldo.* Los estados de cuenta retenidos conservan sus filas aceptadas en los totales.
- *Sin corrección automática.* La diferencia de MX$7.31 sigue abierta hasta que alguien revise el origen.

**Restricciones.** Solo datos ficticios; para ejecutarlo no se necesita API de pago, base de datos, inicio de sesión ni instalar paquetes; el servidor escucha en `127.0.0.1`; centavos enteros en todo el cálculo.

**Resultados observados.** Pasan las verificaciones de integridad, pruebas, mutación, contraste y privacidad, y el build empaqueta una versión determinista.

**Tecnologías.** Módulos de JavaScript para navegador, HTML, CSS, el Node.js test runner y Python para empaquetar el ZIP. Playwright Core y FFmpeg solo generan las imágenes del README.

## El proyecto completo y el límite público

Este demo es una ilustración pública e independiente de algunas ideas de control del proyecto privado Finanzas Familiares de Leonel. El trabajo privado incluye la captura de varios bancos, un historial de importaciones por familia con posibilidad de revertirlas y verificación contra la fuente; sus sistemas y registros no se incluyen aquí. Partes del proyecto privado, como la captura histórica de estados de cuenta y la categorización, siguen en revisión, y este demo no afirma que alguna de ellas esté terminada.

## Limitaciones

La muestra de semilla fija y las reglas de palabras clave demuestran el flujo de control. No son asesoría financiera, un clasificador entrenado ni algo listo para producción. Las diferencias de conciliación y la revisión de categorías necesitan a una persona. La interfaz solo procesa la muestra incluida y no permite importar otros archivos.

## Ejecutar y verificar

Requiere Node.js 20+ y Python 3.10+ para empaquetar el ZIP.

```powershell
npm run start      # http://127.0.0.1:4174
npm run verify     # fixture drift, tests, mutation, contrast, privacy
npm run build      # release/finanzas-familiares-demo.zip and CONTENT_INVENTORY.sha256
```

La muestra viene incluida para que la app funcione de inmediato. `npm run generate` recrea su CSV y sus controles a partir de la semilla `20261026`. Para regenerar las imágenes del README, instala la dependencia de desarrollo (`npm install`), deja corriendo `npm run start` y ejecuta `npm run render`; necesita Chrome o Edge y FFmpeg.

## Privacidad, recursos y licencia

Cada registro, fecha, etiqueta e importe es ficticio. No hay conexión con ningún banco, cuenta familiar, empleador, libro de trabajo privado, base de datos de producción ni con la aplicación privada. Consulta [SECURITY.md](SECURITY.md).

Leonel publica esta demostración bajo la [Licencia MIT](LICENSE). Atkinson Hyperlegible Next y Mono se incluyen bajo la SIL Open Font License; consulta los [avisos de terceros](THIRD_PARTY_NOTICES.md).
