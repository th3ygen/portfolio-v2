/** Full-screen triangle. */
export const VERTEX_SHADER = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

/**
 * Row-displacement "datamosh" over a sparse blinking cell grid, lit by a
 * pointer-following glow. Ported verbatim from the design prototype — the
 * constants are tuned values, not arbitrary.
 */
export const FRAGMENT_SHADER = [
  'precision highp float;',
  'uniform vec2 u_res;uniform float u_time;uniform vec2 u_mouse;',
  'float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
  'void main(){',
  '  vec2 uv=gl_FragCoord.xy/u_res;',
  '  vec2 asp=vec2(u_res.x/u_res.y,1.0);',
  '  float t=u_time;',
  '  float row=floor(uv.y*64.0);',
  '  float rs=hash(vec2(row,floor(t*2.5)));',
  '  float mosh=step(0.94,rs)*(rs-0.94)*3.2;',
  '  vec2 duv=uv;duv.x+=mosh*sin(t*0.7+row);',
  '  vec2 cell=floor(vec2(duv.x*asp.x,duv.y)*26.0);',
  '  float r=hash(cell);',
  '  float blink=step(0.972,hash(cell+floor(t*1.7)));',
  '  float blocks=blink*(0.35+0.65*r);',
  '  float band=smoothstep(0.5,1.0,sin((duv.y*140.0)+t*1.1))*0.05;',
  '  vec2 m=u_mouse/u_res;',
  '  float d=distance(vec2(duv.x*asp.x,duv.y),vec2(m.x*asp.x,m.y));',
  '  float glow=smoothstep(0.42,0.0,d);',
  '  float lum=blocks*(0.10+glow*0.5)+band*(0.25+glow*0.9)+mosh*1.4*glow;',
  '  vec3 col=mix(vec3(0.45,0.62,0.30),vec3(0.78,0.95,0.10),glow);',
  '  float a=clamp(lum,0.0,0.30);',
  '  gl_FragColor=vec4(col*a,a);',
  '}',
].join('\n');

/** Cap DPR — this shader is fill-rate bound and gains nothing above 1.5x. */
export const MAX_DPR = 1.5;

export function compile(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}
