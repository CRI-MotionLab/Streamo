////////// NAVIGATION

const initialNavigationState = {
  currentRoute: 'gizmo',
};

const navigationReducer = (state = initialNavigationState, action) => {
  switch (action.type) {
    case 'navigation/setCurrentRoute':
      return { ...state, currentRoute: action.payload };
    default:
      return state;
  }
};

////////// GIZMO

const initialGizmoState = {
  currentStream: 'acc',
};

const gizmoReducer = (state = initialGizmoState, action) => {
  switch (action.type) {
    case 'gizmo/setCurrentStream':
      return { ...state, currentStream: action.payload };
    default:
      return state;
  }
};

////////// PLAYGROUND

const initialPlaygroundState = {
  frozenStreams: { acc: null, filteredAcc: null, gyr: null, mag: null },
};

const playgroundReducer = (state = initialPlaygroundState, action) => {
  switch (action.type) {
    case 'playground/setFrozenStreams':
      return { ...state, frozenStreams: action.payload };
    default:
      return state;
  }
};

////////// TOUCHZONE

const initialTouchzoneState = {
  coords: { normTouchX: 0, normTouchY: 0 },
};

const touchzoneReducer = (state = initialTouchzoneState, action) => {
  switch (action.type) {
    case 'touchzone/setCoords':
      return { ...state, coords: action.payload };
    default:
      return state;
  }
};

////////// OSC

const initialOscState = {
  target: null,
  targetIsValid: false,
  isSending: false,
};

function validateOscTarget(text) {
  if (typeof text !== 'string') return false;

  let ip = text.split('.');

  if (ip.length === 4) {
    const end = ip.splice(3, 1)[0].split(':');
    ip = [ ...ip, end[0] ];

    if (end.length > 1) {
      let port = Number(end[1]);
      if (!(Number.isInteger(port) && port > 0 && port < 65000)) return false;
    }

    for (let i = 0; i < 4; i++) {
      const n = Number(ip[i]);
      if (!(Number.isInteger(n) && n >= 0 && n <= 255) ||
          ip[i].length === 0) { // because Number('') gives 0
        return false;
      }
    }

    return true;
  }

  return false;
}

const oscReducer = (state = initialOscState, action) => {
  switch (action.type) {
    case 'osc/setTarget':
      return {
        ...state,
        target: action.payload,
        targetIsValid: validateOscTarget(action.payload),
      }  
    case 'osc/setIsSending':
      return { ...state, isSending: action.payload };
    default:
      return state;
  }
};

////////// SENSORS

const initialSensorsState = {
  acc: { x: 0, y: 0, z: 0, timeStamp: 0 },
  gyr: { x: 0, y: 0, z: 0, timeStamp: 0 },
  mag: { x: 0, y: 0, z: 0, timeStamp: 0 },  
};

const sensorsReducer = (state = initialSensorsState, action) => {
  let prop = null;

  switch (action.type) {
    case 'sensors/setAccData':
      prop = 'acc';
      break;
    case 'sensors/setGyrData':
      prop = 'gyr';
      break;
    case 'sensors/setMagData':
      prop = 'mag';
      break;
    default:
      break;
  }

  if (prop === null) return state;
  return { ...state, [prop]: action.payload };
};

////////// OPENGL CONTEXTS

const initialContextState = {
  gizmoContextReady: false,
  playgroundContextReady: false,
  contextReady: false,
};

const contextReducer = (state = initialContextState, action) => {
  switch (action.type) {
    case 'context/setGizmoReady':
      return {
        ...state,
        gizmoReady: true,
        contextReady: state.playgroundReady,
      };
    case 'context/setPlaygroundReady':
      return {
        ...state,
        playgroundReady: true,
        contextReady: state.gizmoReady,
      };
    default:
      return state;
  }
};

////////// EXPORT ALL REDUCERS

export default {
  navigation: navigationReducer,
  gizmo: gizmoReducer,
  playground: playgroundReducer,
  touchzone: touchzoneReducer,
  osc: oscReducer,
  sensors: sensorsReducer,
  context: contextReducer,
};