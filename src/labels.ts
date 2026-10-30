import type { CallStatus, ServiceId } from './types'

/** Spanish UI copy. Identifiers in code stay in English. */
export const SERVICE_LABELS: Record<ServiceId, string> = {
  inventory: 'Inventario',
  orders: 'Pedidos',
  payments: 'Pagos',
}

export const STATUS_LABELS: Record<CallStatus, string> = {
  SUCCESS: 'Éxito',
  ERROR: 'Error',
}

export const ERROR_RATE_THRESHOLD = 15

export const text = {
  appName: 'Monitoreo de microservicios',
  appTagline: 'Proxy de auditoría y logging en tiempo real',
  live: 'En vivo',
  updatedAt: 'Actualizado',
  simulate: 'Simular carga',
  simulating: 'Simulando…',
  simulated: (requested: number, failed: number) =>
    `${requested} llamadas generadas, ${failed} con error`,
  simulateFailed: 'No se pudo simular la carga',
  totalCalls: 'Llamadas totales',
  successRate: 'Tasa de éxito',
  avgTime: 'Tiempo promedio',
  healthy: 'Estable',
  unhealthy: 'Con problemas',
  noCalls: 'Sin llamadas',
  chartTitle: 'Tiempo de respuesta',
  chartSubtitle: 'Últimas 20 llamadas por servicio',
  chartX: 'Llamada',
  chartEmpty: 'Aún no hay llamadas para graficar.',
  logsTitle: 'Registro de llamadas',
  filterService: 'Servicio',
  filterStatus: 'Estado',
  filterFrom: 'Desde',
  filterTo: 'Hasta',
  filterAll: 'Todos',
  clearFilters: 'Limpiar filtros',
  colRequest: 'ID de solicitud',
  colService: 'Servicio',
  colOperation: 'Operación',
  colDuration: 'Duración',
  colStatus: 'Estado',
  colTime: 'Hora',
  expand: 'Ver detalles',
  collapse: 'Ocultar detalles',
  paramsTitle: 'Parámetros de entrada',
  responseTitle: 'Respuesta',
  errorTitle: 'Error',
  noParams: 'Sin parámetros',
  logsEmpty: 'Aún no hay registros.',
  logsEmptyHint: 'Pulsa «Simular carga» para generar llamadas de ejemplo.',
  logsNoMatch: 'Ningún registro coincide con los filtros.',
  logsNoMatchHint: 'Prueba con otro servicio, estado o rango de fechas.',
  previous: 'Anterior',
  next: 'Siguiente',
  pageOf: (page: number, total: number) => `Página ${page} de ${total}`,
  records: (count: number) => `${count} registros`,
  loadError: 'No se pudo conectar con el backend. Se reintentará automáticamente.',
  loadErrorStale: 'Mostrando los últimos datos recibidos.',
  retry: 'Reintentar',
  loading: 'Cargando datos…',
  ms: 'ms',
}
