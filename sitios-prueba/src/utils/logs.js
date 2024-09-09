export function sendMicroMeasuresLogs(token) {
  window.microMetricLogger.stopLogging();
  console.log('logging finished');
  if (!token) {
    return;
  }
  const body = {
    id: window.microMetricLogger.id,
    widget_logs: window.microMetricLogger.getAllMicroMetricsAsList(),
    errors: [],
    finished: true,
    time: window.microMetricLogger.time,
  };

  fetch(
    `${import.meta.env.VITE_UX_ANALYZER_API}/version/${token}/user_session/new`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );
}
