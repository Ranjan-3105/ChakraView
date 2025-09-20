import React, { useRef, useEffect, useState } from "react";

function NightVision() {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const rafRef = useRef(null);

  // Fixed values
  const gain = 1.0;
  const noise = 0.1;
  const tint = 0.3;

  useEffect(() => {
    startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCamera = async () => {
    if (stream) return;
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      setStream(mediaStream);
      startRenderLoop();
    } catch (err) {
      console.error("getUserMedia error:", err);
      alert("Camera access denied or not available.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
    cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  };

  const startRenderLoop = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const gl = canvas.getContext("webgl2", {
      antialias: false,
      preserveDrawingBuffer: false,
    });
    if (!gl) {
      console.warn("WebGL2 not available, fallback needed.");
      return;
    }

    // ---- SHADERS ----
    const vertexSrc = `#version 300 es
    in vec2 a_pos;
    in vec2 a_uv;
    out vec2 v_uv;
    void main() {
      v_uv = a_uv;
      gl_Position = vec4(a_pos, 0.0, 1.0);
    }`;

    const fragmentSrc = `#version 300 es
    precision highp float;
    in vec2 v_uv;
    out vec4 outColor;
    uniform sampler2D u_tex;
    uniform float u_time;
    uniform float u_gain;
    uniform float u_noise;
    uniform float u_tint;
    uniform vec2 u_res;

    float rand(vec2 co) {
      return fract(sin(dot(co.xy, vec2(12.9898,78.233))) * 43758.5453);
    }

    void main() {
      vec2 uv = v_uv;
      vec3 col = texture(u_tex, uv).rgb;
      float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
      float amplified = pow(lum, 0.45) * u_gain;
      amplified = clamp(amplified, 0.0, 1.4);

      vec3 nv = mix(vec3(amplified * 0.2, amplified * 1.0, amplified * 0.2), vec3(amplified), 1.0 - u_tint);

      float n = rand(gl_FragCoord.xy * u_time);
      nv += (n - 0.5) * u_noise;

      // vec2 centered = (uv - 0.5) * vec2(u_res.x/u_res.y, 1.0);
      // float vig = smoothstep(0.8, 0.2, length(centered));
      // nv *= vig;

      // nv = pow(nv, vec3(0.9));
      nv.g = clamp(nv.g * 1.05, 0.0, 1.6);

      outColor = vec4(nv, 1.0);
    }`;

    // ---- COMPILE HELPERS ----
    function createShader(gl, type, source) {
      const s = gl.createShader(type);
      gl.shaderSource(s, source);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error("Shader error:", gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    }
    function createProgram(gl, vsSrc, fsSrc) {
      const vs = createShader(gl, gl.VERTEX_SHADER, vsSrc);
      const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSrc);
      const p = gl.createProgram();
      gl.attachShader(p, vs);
      gl.attachShader(p, fs);
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
        console.error("Program link error:", gl.getProgramInfoLog(p));
        return null;
      }
      return p;
    }

    const program = createProgram(gl, vertexSrc, fragmentSrc);
    const positions = new Float32Array([
  -1, -1, 0, 1,   // notice uv.y flipped
   1, -1, 1, 1,
  -1,  1, 0, 0,
   1,  1, 1, 0,
]);

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const a_pos = gl.getAttribLocation(program, "a_pos");
    const a_uv = gl.getAttribLocation(program, "a_uv");
    gl.enableVertexAttribArray(a_pos);
    gl.vertexAttribPointer(a_pos, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(a_uv);
    gl.vertexAttribPointer(a_uv, 2, gl.FLOAT, false, 16, 8);

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const u_time = gl.getUniformLocation(program, "u_time");
    const u_gain = gl.getUniformLocation(program, "u_gain");
    const u_noise = gl.getUniformLocation(program, "u_noise");
    const u_tint = gl.getUniformLocation(program, "u_tint");
    const u_res = gl.getUniformLocation(program, "u_res");

    const startTime = performance.now();

    function frame(t) {
      if (!video || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(frame);
        return;
      }

      gl.bindTexture(gl.TEXTURE_2D, tex);
      try {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video);
      } catch (e) {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
      }

      const timeSec = (t - startTime) * 0.001;
      gl.useProgram(program);
      gl.uniform1f(u_time, timeSec + 1.0);
      gl.uniform1f(u_gain, gain);
      gl.uniform1f(u_noise, noise);
      gl.uniform1f(u_tint, tint);
      gl.uniform2f(u_res, canvas.width, canvas.height);

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.bindVertexArray(vao);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
        background: "#0b0b0b",
        color: "#ddd",
        height: "100vh",
        padding: "20px",
      }}
    >
      

      

      <canvas
        ref={canvasRef}
        width={1280}
        height={720}
        style={{
          width: "600px",
          height: "400px",
          background: "#000",
          // borderRadius: "6px",
          transform: "scaleX(1)", // mirror horizontally
        }}
      ></canvas>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{ display: "none" }}
      ></video>

      
    </div>
  );
}

export default NightVision;
