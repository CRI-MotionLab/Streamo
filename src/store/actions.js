export const setCurrentRoute = route => ({
  type: 'navigation/setCurrentRoute',
  payload: route,
});

export const setGizmoCurrentStream = stream => ({
  type: 'gizmo/setCurrentStream',
  payload: stream,
});

export const setPlaygroundFrozenStreams = streams => ({
  type: 'playground/setFrozenStreams',
  payload: streams,
});

export const setTouchZoneCoords = coords => ({
  type: 'touchzone/setCoords',
  payload: coords,
});

////////// OSC

export const setOscTarget = ip => ({
  type: 'osc/setTarget',
  payload: ip,
});

export const setOscIsSending = ip => ({
  type: 'osc/setIsSending',
  payload: ip,
});

////////// SENSORS

export const setSensorsAccData = data => ({
  type: 'sensors/setAccData',
  payload: data,
});

export const setSensorsGyrData = data => ({
  type: 'sensors/setGyrData',
  payload: data,
});

export const setSensorsMagData = data => ({
  type: 'sensors/setMagData',
  payload: data,
});

////////// CONTEXT (OPENGL)

export const setContextGizmoReady = ready => ({
  type: 'context/setGizmoReady',
  payload: ready,
});

export const setContextPlaygroundReady = ready => ({
  type: 'context/setPlaygroundReady',
  payload: ready,
});