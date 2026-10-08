(() => {
  const canvas = document.querySelector('[data-fluid-canvas]');
  const hero = document.querySelector('.hero');
  if (!canvas || !hero) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const gl = canvas.getContext('webgl2', {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false
  });

  const readColor = name => {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    const hex = value.match(/^#([\da-f]{6})$/i)?.[1];
    if (!hex) return [0.08, 0.08, 0.08];
    return [0, 2, 4].map(index => parseInt(hex.slice(index, index + 2), 16) / 255);
  };

  const ink = readColor('--ink');
  const muted = readColor('--muted');

  if (!gl || !gl.getExtension('EXT_color_buffer_float')) {
    const context = canvas.getContext('2d');
    if (!context) return;
    const drawFallback = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      canvas.width = Math.round(innerWidth * dpr);
      canvas.height = Math.round(innerHeight * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, innerWidth, innerHeight);
      context.filter = 'blur(42px)';
      context.globalAlpha = .075;
      context.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--ink');
      context.lineWidth = Math.max(90, innerWidth * .11);
      context.lineCap = 'round';
      context.beginPath();
      context.moveTo(-80, innerHeight * .68);
      context.bezierCurveTo(innerWidth * .24, innerHeight * .35, innerWidth * .56, innerHeight * .86, innerWidth + 100, innerHeight * .3);
      context.stroke();
      context.filter = 'none';
    };
    drawFallback();
    window.addEventListener('resize', drawFallback, { passive: true });
    return;
  }

  const supportsLinearFloat = Boolean(gl.getExtension('OES_texture_float_linear'));

  const vertexSource = `#version 300 es
    in vec2 aPosition;
    out vec2 vUv;
    void main() {
      vUv = aPosition * .5 + .5;
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }
  `;

  const shaders = {
    advection: `#version 300 es
      precision highp float;
      in vec2 vUv;
      out vec4 fragColor;
      uniform sampler2D uVelocity;
      uniform sampler2D uSource;
      uniform float uDt;
      uniform float uDissipation;
      void main() {
        vec2 velocity = texture(uVelocity, vUv).xy;
        fragColor = texture(uSource, vUv - velocity * uDt) * uDissipation;
      }
    `,
    splat: `#version 300 es
      precision highp float;
      in vec2 vUv;
      out vec4 fragColor;
      uniform sampler2D uTarget;
      uniform vec2 uPoint;
      uniform vec4 uValue;
      uniform float uRadius;
      uniform float uAspect;
      void main() {
        vec2 offset = vUv - uPoint;
        offset.x *= uAspect;
        float influence = exp(-dot(offset, offset) / uRadius);
        fragColor = texture(uTarget, vUv) + uValue * influence;
      }
    `,
    divergence: `#version 300 es
      precision highp float;
      in vec2 vUv;
      out vec4 fragColor;
      uniform sampler2D uVelocity;
      uniform vec2 uTexel;
      void main() {
        float left = texture(uVelocity, vUv - vec2(uTexel.x, 0.0)).x;
        float right = texture(uVelocity, vUv + vec2(uTexel.x, 0.0)).x;
        float bottom = texture(uVelocity, vUv - vec2(0.0, uTexel.y)).y;
        float top = texture(uVelocity, vUv + vec2(0.0, uTexel.y)).y;
        fragColor = vec4(.5 * (right - left + top - bottom), 0.0, 0.0, 1.0);
      }
    `,
    pressure: `#version 300 es
      precision highp float;
      in vec2 vUv;
      out vec4 fragColor;
      uniform sampler2D uPressure;
      uniform sampler2D uDivergence;
      uniform vec2 uTexel;
      void main() {
        float left = texture(uPressure, vUv - vec2(uTexel.x, 0.0)).x;
        float right = texture(uPressure, vUv + vec2(uTexel.x, 0.0)).x;
        float bottom = texture(uPressure, vUv - vec2(0.0, uTexel.y)).x;
        float top = texture(uPressure, vUv + vec2(0.0, uTexel.y)).x;
        float divergence = texture(uDivergence, vUv).x;
        fragColor = vec4((left + right + bottom + top - divergence) * .25, 0.0, 0.0, 1.0);
      }
    `,
    gradient: `#version 300 es
      precision highp float;
      in vec2 vUv;
      out vec4 fragColor;
      uniform sampler2D uPressure;
      uniform sampler2D uVelocity;
      uniform vec2 uTexel;
      void main() {
        float left = texture(uPressure, vUv - vec2(uTexel.x, 0.0)).x;
        float right = texture(uPressure, vUv + vec2(uTexel.x, 0.0)).x;
        float bottom = texture(uPressure, vUv - vec2(0.0, uTexel.y)).x;
        float top = texture(uPressure, vUv + vec2(0.0, uTexel.y)).x;
        vec2 velocity = texture(uVelocity, vUv).xy - vec2(right - left, top - bottom) * .5;
        fragColor = vec4(velocity, 0.0, 1.0);
      }
    `,
    display: `#version 300 es
      precision highp float;
      in vec2 vUv;
      out vec4 fragColor;
      uniform sampler2D uDye;
      uniform vec2 uTexel;
      void main() {
        vec4 dye = texture(uDye, vUv) * .42;
        dye += texture(uDye, vUv + vec2(uTexel.x, 0.0)) * .145;
        dye += texture(uDye, vUv - vec2(uTexel.x, 0.0)) * .145;
        dye += texture(uDye, vUv + vec2(0.0, uTexel.y)) * .145;
        dye += texture(uDye, vUv - vec2(0.0, uTexel.y)) * .145;
        vec3 base = vec3(1.0, .988, .973);
        vec3 tint = dye.rgb / max(dye.a, .001);
        float amount = clamp(dye.a * .46, 0.0, .22);
        fragColor = vec4(mix(base, tint, amount), 1.0);
      }
    `
  };

  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
    return shader;
  };

  const createProgram = fragmentSource => {
    const program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
    return program;
  };

  const programs = Object.fromEntries(Object.entries(shaders).map(([name, source]) => [name, createProgram(source)]));
  const uniforms = program => new Proxy({}, {
    get: (_, name) => gl.getUniformLocation(program, `u${String(name)[0].toUpperCase()}${String(name).slice(1)}`)
  });
  const locations = Object.fromEntries(Object.entries(programs).map(([name, program]) => [name, uniforms(program)]));

  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
  Object.values(programs).forEach(program => {
    const position = gl.getAttribLocation(program, 'aPosition');
    gl.useProgram(program);
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  });

  let simWidth = 0;
  let simHeight = 0;
  let velocity;
  let dye;
  let pressure;
  let divergence;

  const createTarget = () => {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    const filter = supportsLinearFloat ? gl.LINEAR : gl.NEAREST;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, simWidth, simHeight, 0, gl.RGBA, gl.HALF_FLOAT, null);
    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return { texture, framebuffer };
  };

  const createDoubleTarget = () => {
    const target = { read: createTarget(), write: createTarget() };
    target.swap = () => { const temporary = target.read; target.read = target.write; target.write = temporary; };
    return target;
  };

  const destroyTargets = () => {
    [velocity, dye, pressure].filter(Boolean).forEach(pair => {
      [pair.read, pair.write].forEach(target => {
        gl.deleteTexture(target.texture);
        gl.deleteFramebuffer(target.framebuffer);
      });
    });
    if (divergence) {
      gl.deleteTexture(divergence.texture);
      gl.deleteFramebuffer(divergence.framebuffer);
    }
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, innerWidth < 700 ? 1 : 1.5);
    const width = Math.max(1, Math.round(innerWidth * dpr));
    const height = Math.max(1, Math.round(innerHeight * dpr));
    if (canvas.width === width && canvas.height === height && velocity) return;
    canvas.width = width;
    canvas.height = height;
    const longest = reducedMotion.matches ? 112 : innerWidth < 700 ? 190 : 300;
    const aspect = width / height;
    simWidth = aspect >= 1 ? longest : Math.round(longest * aspect);
    simHeight = aspect >= 1 ? Math.round(longest / aspect) : longest;
    destroyTargets();
    velocity = createDoubleTarget();
    dye = createDoubleTarget();
    pressure = createDoubleTarget();
    divergence = createTarget();
  };

  const bindTexture = (texture, unit, location) => {
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(location, unit);
  };

  const drawTo = (program, target, width = simWidth, height = simHeight) => {
    gl.useProgram(program);
    gl.bindFramebuffer(gl.FRAMEBUFFER, target?.framebuffer || null);
    gl.viewport(0, 0, width, height);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  };

  const splatTarget = (pair, point, value, radius) => {
    gl.useProgram(programs.splat);
    bindTexture(pair.read.texture, 0, locations.splat.target);
    gl.uniform2f(locations.splat.point, point.x, point.y);
    gl.uniform4f(locations.splat.value, value[0], value[1], value[2], value[3]);
    gl.uniform1f(locations.splat.radius, radius);
    gl.uniform1f(locations.splat.aspect, simWidth / simHeight);
    drawTo(programs.splat, pair.write);
    pair.swap();
  };

  let colorIndex = 0;
  const addInk = (x, y, dx, dy, strength = 1) => {
    const speed = Math.min(.02, Math.hypot(dx, dy));
    if (speed < .00008 && strength >= 1) return;
    splatTarget(velocity, { x, y }, [dx * 3.8 * strength, dy * 3.8 * strength, 0, 1], .0028);
    const source = colorIndex++ % 3 === 0 ? muted : ink;
    splatTarget(dye, { x, y }, [source[0] * .08, source[1] * .08, source[2] * .08, .105], .0036 + speed * .035);
  };

  const step = dt => {
    const texelX = 1 / simWidth;
    const texelY = 1 / simHeight;

    gl.useProgram(programs.advection);
    bindTexture(velocity.read.texture, 0, locations.advection.velocity);
    bindTexture(velocity.read.texture, 1, locations.advection.source);
    gl.uniform1f(locations.advection.dt, dt);
    gl.uniform1f(locations.advection.dissipation, .986);
    drawTo(programs.advection, velocity.write);
    velocity.swap();

    gl.useProgram(programs.divergence);
    bindTexture(velocity.read.texture, 0, locations.divergence.velocity);
    gl.uniform2f(locations.divergence.texel, texelX, texelY);
    drawTo(programs.divergence, divergence);

    for (let index = 0; index < 12; index += 1) {
      gl.useProgram(programs.pressure);
      bindTexture(pressure.read.texture, 0, locations.pressure.pressure);
      bindTexture(divergence.texture, 1, locations.pressure.divergence);
      gl.uniform2f(locations.pressure.texel, texelX, texelY);
      drawTo(programs.pressure, pressure.write);
      pressure.swap();
    }

    gl.useProgram(programs.gradient);
    bindTexture(pressure.read.texture, 0, locations.gradient.pressure);
    bindTexture(velocity.read.texture, 1, locations.gradient.velocity);
    gl.uniform2f(locations.gradient.texel, texelX, texelY);
    drawTo(programs.gradient, velocity.write);
    velocity.swap();

    gl.useProgram(programs.advection);
    bindTexture(velocity.read.texture, 0, locations.advection.velocity);
    bindTexture(dye.read.texture, 1, locations.advection.source);
    gl.uniform1f(locations.advection.dt, dt);
    gl.uniform1f(locations.advection.dissipation, .99);
    drawTo(programs.advection, dye.write);
    dye.swap();
  };

  const render = () => {
    gl.useProgram(programs.display);
    bindTexture(dye.read.texture, 0, locations.display.dye);
    gl.uniform2f(locations.display.texel, 1 / simWidth, 1 / simHeight);
    drawTo(programs.display, null, canvas.width, canvas.height);
  };

  resize();
  let previewStart = performance.now();
  let lastPreview = 0;
  let lastTime = performance.now();
  let frame = 0;
  let active = true;
  let pointer = null;

  const preview = now => {
    const elapsed = now - previewStart;
    if (elapsed > 2700 || elapsed - lastPreview < 58) return;
    lastPreview = elapsed;
    const t = elapsed / 2700;
    const x = -.06 + t * 1.12;
    const y = .64 + Math.sin(t * Math.PI * 2.15) * .13;
    const dx = .0065;
    const dy = Math.cos(t * Math.PI * 2.15) * .0036;
    addInk(x, y, dx, dy, .72);
  };

  const animate = now => {
    if (!active) return;
    const dt = Math.min(.022, Math.max(.008, (now - lastTime) / 1000));
    lastTime = now;
    preview(now);
    step(dt);
    render();
    frame = requestAnimationFrame(animate);
  };

  const positionFromEvent = (clientX, clientY) => ({ x: clientX / innerWidth, y: 1 - clientY / innerHeight });
  const move = (clientX, clientY) => {
    if (performance.now() - previewStart < 2700 || !active) return;
    const next = positionFromEvent(clientX, clientY);
    if (pointer) addInk(next.x, next.y, next.x - pointer.x, next.y - pointer.y);
    pointer = next;
  };
  const onPointerMove = event => move(event.clientX, event.clientY);
  const onTouchMove = event => {
    const touch = event.touches[0];
    if (touch) move(touch.clientX, touch.clientY);
  };
  const clearPointer = () => { pointer = null; };
  const onResize = () => { resize(); pointer = null; };

  window.addEventListener('resize', onResize, { passive: true });
  if (!reducedMotion.matches) {
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', clearPointer);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    frame = requestAnimationFrame(animate);
  } else {
    addInk(.22, .62, .002, .001, .45);
    addInk(.52, .48, .002, -.001, .4);
    addInk(.78, .66, -.001, .001, .35);
    for (let index = 0; index < 18; index += 1) step(.016);
    render();
    active = false;
  }

  const destroy = () => {
    active = false;
    cancelAnimationFrame(frame);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerleave', clearPointer);
    window.removeEventListener('touchmove', onTouchMove);
    destroyTargets();
  };
  window.addEventListener('pagehide', destroy, { once: true });
})();
