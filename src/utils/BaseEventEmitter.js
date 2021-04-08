class BaseEventEmitter {
  constructor() {
    this._listeners = {};
  }

  addListener(event, listener) {
    if (!this._listeners[event]) {
      this._listeners[event] = new Set();
    }

    this._listeners[event].add(listener);
    
    return () => {
      if (this._listeners[event]) {
        this._listeners[event].delete(listener);
      }
    };
  }

  removeListeners(event = null) {
    if (event === null) {
      this._listeners = {};
    } else if (typeof event === 'string' && this._listeners[event]) {
      this._listeners[event] = null;
      delete this._listeners[event];
    }    
  }

  emit(event, data) {
    if (this._listeners[event]) {
      Array.from(this._listeners[event]).forEach(l => { l(data); });
    }
  }
};

export default BaseEventEmitter;