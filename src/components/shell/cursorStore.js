const listeners = new Set();

const state = {
  x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
  y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0,
  mode: 'default', // 'default' | 'spine' | 'btn' | 'open'
  visible: false,
  hasPointer: false,
};

export function setCursorTarget(x, y) {
  state.x = x;
  state.y = y;
  state.hasPointer = true;
}

export function setCursorMode(mode) {
  if (state.mode !== mode) {
    state.mode = mode;
    listeners.forEach((fn) => fn(state));
  }
}

export function setCursorActive(visible) {
  state.visible = visible;
  listeners.forEach((fn) => fn(state));
}

export function getCursorState() {
  return state;
}

export function subscribeCursor(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
