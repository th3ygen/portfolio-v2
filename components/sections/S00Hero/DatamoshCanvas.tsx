'use client';

import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '@/components/motion/useReducedMotion';
import { FRAGMENT_SHADER, MAX_DPR, VERTEX_SHADER, compile } from './datamoshShaders';
import styles from './S00Hero.module.css';

/**
 * The hero's background layer.
 *
 * Every failure path here is silent and non-fatal: no WebGL context, a shader
 * that will not compile, a program that will not link. The canvas is
 * decoration, so a device that cannot draw it simply gets the page without it.
 *
 * Skipped entirely under reduced motion, and paused whenever it scrolls out of
 * view — it is a full-screen fragment shader and has no business running while
 * the reader is five sections further down.
 */
export function DatamoshCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (prefersReducedMotion()) return;

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      premultipliedAlpha: false,
    });
    if (!gl) return;

    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vertex || !fragment) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'p');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const uRes = gl.getUniformLocation(program, 'u_res');
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uMouse = gl.getUniformLocation(program, 'u_mouse');

    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    const resize = () => {
      const width = canvas.clientWidth * dpr;
      const height = canvas.clientHeight * dpr;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };
    resize();

    let mouseX = 0.5;
    let mouseY = 0.5;
    let visible = true;
    let frame = 0;

    const onMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = (event.clientX - rect.left) * dpr;
      mouseY = (rect.height - (event.clientY - rect.top)) * dpr;
    };

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('mousemove', onMove, { passive: true });

    const observer =
      typeof IntersectionObserver === 'function'
        ? new IntersectionObserver((entries) => {
            visible = entries[0]?.isIntersecting ?? true;
          }, { threshold: 0 })
        : null;
    observer?.observe(canvas);

    const start = performance.now();
    const draw = () => {
      frame = window.requestAnimationFrame(draw);
      if (!visible) return;
      resize();
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, (performance.now() - start) / 1000);
      gl.uniform2f(uMouse, mouseX, mouseY);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    draw();

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      observer?.disconnect();
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      gl.deleteBuffer(buffer);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.mosh} data-mosh aria-hidden="true" />;
}
