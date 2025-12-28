import { Renderer, Program, Mesh, Color, Triangle } from "ogl";
import { useEffect, useRef } from "react";
import "./Aurora.css";

const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision highp float;
uniform float uTime;
uniform float uAmplitude;
uniform vec3 uColorStops[3];
uniform vec2 uResolution;
uniform float uBlend;
out vec4 fragColor;

vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
    dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec4 x = 2.0 * fract(p * C.www) - 1.0;
  vec4 h = abs(x) - 0.5;
  vec4 ox = floor(x + 0.5);
  vec4 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 0.0;
  for(int i = 0; i < 5; i++) {
    value += amplitude * snoise(p);
    p *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

vec3 colorRamp(float t) {
  vec3 a = uColorStops[0];
  vec3 b = uColorStops[1];
  vec3 c = uColorStops[2];
  return mix(mix(a, b, t), mix(b, c, t), t);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 p = uv * 2.0 - 1.0;
  p.x *= uResolution.x / uResolution.y;

  float noise = fbm(p + uTime * 0.1);
  float t = (noise + 1.0) * 0.5;

  vec3 color = colorRamp(t);
  color *= uAmplitude;

  fragColor = vec4(color, uBlend);
}
`;

type AuroraProps = {
  colorStops?: string[];
  amplitude?: number;
  blend?: number;
  speed?: number;
  time?: number;
};

export default function Aurora(props: AuroraProps) {
  const {
    colorStops = ["#1d4ed8", "#16a34a", "#1d4ed8"],
    amplitude = 0.9,
    blend = 0.45,
  } = props;

  const propsRef = useRef<AuroraProps>(props);
  propsRef.current = props;

  const ctnDom = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ctn = ctnDom.current;
    if (!ctn) return;

    const renderer = new Renderer({
      alpha: true,
      premultipliedAlpha: true,
      antialias: true,
    });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.canvas.style.backgroundColor = "transparent";

    const geometry = new Triangle(gl);
    type TriangleWithUV = typeof geometry & {
      attributes: Record<string, unknown>;
    };

    const triWithUV = geometry as TriangleWithUV;
    if ("uv" in triWithUV.attributes) {
      delete triWithUV.attributes.uv;
    }

    const toRGB = (hex: string) => {
      const c = new Color(hex);
      return [c.r, c.g, c.b];
    };

    const colorStopsArray = (propsRef.current.colorStops ?? colorStops).map(toRGB);

    const program: Program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uAmplitude: { value: amplitude },
        uColorStops: { value: colorStopsArray },
        uResolution: { value: [ctn.offsetWidth, ctn.offsetHeight] },
        uBlend: { value: blend },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });
    ctn.appendChild(gl.canvas);

    const resize = () => {
      if (!ctn || !program) return;
      const width = ctn.offsetWidth;
      const height = ctn.offsetHeight;
      renderer.setSize(width, height);
      (program.uniforms.uResolution.value as number[]) = [width, height];
    };
    window.addEventListener("resize", resize);
    resize();

    let animateId = 0;
    const update = (t: number) => {
      animateId = requestAnimationFrame(update);
      const { time = t * 0.01, speed = 0.5 } = propsRef.current;
      program!.uniforms.uTime.value = time * speed * 0.1;
      program!.uniforms.uAmplitude.value = propsRef.current.amplitude ?? amplitude;
      program!.uniforms.uBlend.value = propsRef.current.blend ?? blend;
      const stops = propsRef.current.colorStops ?? colorStops;
      program!.uniforms.uColorStops.value = stops.map(toRGB);
      renderer.render({ scene: mesh });
    };
    animateId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animateId);
      window.removeEventListener("resize", resize);
      if (ctn && gl.canvas.parentNode === ctn) {
        ctn.removeChild(gl.canvas);
      }
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [amplitude, blend, colorStops]);

  return <div ref={ctnDom} className="aurora-container" />;
}
