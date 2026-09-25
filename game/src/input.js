export function createInput(canvas) {
  const keys = new Set();
  const state = {
    yawDelta: 0, pitchDelta: 0, fire: false, ads: false, sprint: false,
    moveX: 0, moveY: 0, enabled: false, reloadPressed: false, jumpPressed: false,
  };
  const stick = document.getElementById('stick');
  const knob = stick.querySelector('i');
  const look = document.getElementById('look');
  const fire = document.getElementById('fire');
  const ads = document.getElementById('ads');
  const reload = document.getElementById('reload');
  const jump = document.getElementById('jump');
  let stickPointer = null;
  let lookPointer = null;
  let lookLastX = 0;
  let lookLastY = 0;

  const updateStick = (event) => {
    const rect = stick.getBoundingClientRect();
    const radius = rect.width * 0.36;
    let x = (event.clientX - (rect.left + rect.width / 2)) / radius;
    let y = (event.clientY - (rect.top + rect.height / 2)) / radius;
    const length = Math.hypot(x, y);
    if (length > 1) { x /= length; y /= length; }
    state.moveX = x;
    state.moveY = -y;
    knob.style.transform = `translate(${x * radius}px, ${y * radius}px)`;
  };
  const resetStick = () => {
    stickPointer = null;
    state.moveX = 0;
    state.moveY = 0;
    knob.style.transform = '';
  };
  const clearActions = () => {
    keys.clear();
    state.fire = false;
    state.touchSprint=false;
    state.yawDelta=0;state.pitchDelta=0;
    state.ads = false;
    state.reloadPressed = false;
    state.jumpPressed = false;
    resetStick();
  };

  addEventListener('keydown', (event) => {
    if (!state.enabled) return;
    keys.add(event.code);
    if (event.code === 'KeyR' && !event.repeat) state.reloadPressed = true;
    if (event.code === 'Space' && !event.repeat) state.jumpPressed = true;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) event.preventDefault();
  });
  addEventListener('keyup', (event) => keys.delete(event.code));
  addEventListener('blur', clearActions);
  addEventListener('mousemove', (event) => {
    if (!state.enabled || document.pointerLockElement !== canvas) return;
    state.yawDelta += event.movementX;
    state.pitchDelta += event.movementY;
  });
  addEventListener('mousedown', (event) => {
    if (!state.enabled || event.target !== canvas) return;
    if (event.button === 0) state.fire = true;
    if (event.button === 2) state.ads = true;
  });
  addEventListener('mouseup', (event) => {
    if (event.button === 0) state.fire = false;
    if (event.button === 2) state.ads = false;
  });
  addEventListener('contextmenu', (event) => event.preventDefault());

  stick.addEventListener('pointerdown', (event) => {
    if (!state.enabled || stickPointer !== null) return;
    stickPointer = event.pointerId;
    stick.setPointerCapture(event.pointerId);
    updateStick(event);
    event.preventDefault();
  });
  stick.addEventListener('pointermove', (event) => { if (event.pointerId === stickPointer) updateStick(event); });
  stick.addEventListener('pointerup', (event) => { if (event.pointerId === stickPointer) resetStick(); });
  stick.addEventListener('pointercancel', resetStick);

  look.addEventListener('pointerdown', (event) => {
    if (!state.enabled || lookPointer !== null) return;
    lookPointer = event.pointerId;
    lookLastX = event.clientX;
    lookLastY = event.clientY;
    look.setPointerCapture(event.pointerId);
  });
  look.addEventListener('pointermove', (event) => {
    if (event.pointerId !== lookPointer) return;
    state.yawDelta += (event.clientX - lookLastX) * 1.25;
    state.pitchDelta += (event.clientY - lookLastY) * 1.25;
    lookLastX = event.clientX;
    lookLastY = event.clientY;
  });
  const endLook = (event) => { if (event.pointerId === lookPointer) lookPointer = null; };
  look.addEventListener('pointerup', endLook);
  look.addEventListener('pointercancel', endLook);

  const bindHold = (element, key) => {
    element.addEventListener('pointerdown', (event) => {
      if (!state.enabled) return;
      element.setPointerCapture(event.pointerId);
      state[key] = true;
      event.preventDefault();
    });
    const end = () => { state[key] = false; };
    element.addEventListener('pointerup', end);
    element.addEventListener('pointercancel', end);
  };
  bindHold(fire, 'fire');
  bindHold(ads, 'ads');
  reload.addEventListener('pointerdown', (event) => {
    if (state.enabled) state.reloadPressed = true;
    event.preventDefault();
  });
  jump.addEventListener('pointerdown', (event) => {
    if (state.enabled) state.jumpPressed = true;
    event.preventDefault();
  });

  return {
    state,
    setEnabled(enabled) {
      state.enabled = enabled;
      if (!enabled) clearActions();
    },
    requestPointerLock() {
      if (matchMedia('(hover: hover) and (pointer: fine)').matches) canvas.requestPointerLock?.().catch(() => {});
    },
    movement() {
      const x = Number(keys.has('KeyD') || keys.has('ArrowRight')) - Number(keys.has('KeyA') || keys.has('ArrowLeft')) + state.moveX;
      const y = Number(keys.has('KeyW') || keys.has('ArrowUp')) - Number(keys.has('KeyS') || keys.has('ArrowDown')) + state.moveY;
      state.sprint = keys.has('ShiftLeft') || keys.has('ShiftRight') || Boolean(state.touchSprint);
      const length = Math.hypot(x, y);
      return length > 1 ? { x: x / length, y: y / length } : { x, y };
    },
    consumeLook() {
      const value = { x: state.yawDelta, y: state.pitchDelta };
      state.yawDelta = 0;
      state.pitchDelta = 0;
      return value;
    },
    consumeReload() {
      const value = state.reloadPressed;
      state.reloadPressed = false;
      return value;
    },
    consumeJump() {
      const value = state.jumpPressed;
      state.jumpPressed = false;
      return value;
    },
  };
}
