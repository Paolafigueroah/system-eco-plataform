/**
 * Métricas de rendimiento ligeras (duración de operaciones).
 * Si más adelante se integra Sentry u otro APM, centralizar aquí.
 */
export const performanceMetrics = {
  /**
   * @param {string} name
   * @returns {(attrs?: Record<string, unknown>) => void}
   */
  startTimer(name) {
    const start = typeof performance !== 'undefined' ? performance.now() : Date.now();
    return (attrs = {}) => {
      const end = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const ms = Math.round(end - start);
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.debug(`[perf] ${name}`, `${ms}ms`, attrs);
      }
    };
  }
};
