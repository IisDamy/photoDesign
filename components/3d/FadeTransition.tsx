"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three/webgpu";
import { WebGPURenderer } from "three/webgpu";

// Replace these imports with your shader files
// import vertexShader from "../shaders/vertex.glsl";
// import fragmentShader from "../shaders/fragment.glsl";

const vertexShader = `
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const fragmentShader = `
void main() {
  gl_FragColor = vec4(1.0);
}`;

function ShaderPlane() {
  const meshRef = useRef<THREE.Mesh>(null);

  const getMaterial = () => {
    let material = new THREE.MeshBasicNodeMaterial

    material.colorNode = fn(() => {})
  }

  const material = useMemo(
    () => getMaterial()
      ,
    []
  );

  useFrame(({ clock }) => {
    if (!meshRef.current) return;

    const elapsed = clock.getElapsedTime();
    meshRef.current.rotation.x = 0.2 * elapsed;
    meshRef.current.rotation.y = 0.1 * elapsed;
  });

  return (
    <mesh ref={meshRef} material={material}>
      <planeGeometry args={[1, 1, 128, 128]} />
    </mesh>
  );
}

export default function ThreeScene() {
  return (
    <div className="h-screen fixed w-screen p-5">
      <Canvas
        camera={{
          position: [0, 0, 2],
          fov: 100,
        }}
        className="w-full h-full"
        dpr={[1, 2]}
        gl={async (props: any) => {
          const renderer =
            new WebGPURenderer({
              ...props,
              antialias: true,
              alpha: true,
            });

          await renderer.init();

          renderer.setPixelRatio(
            Math.min(
              window.devicePixelRatio,
              2
            )
          );

          renderer.setClearColor(
            0x000000,
            1
          );

          return renderer;
        }}
      >
        <ambientLight intensity={1} />
        <ShaderPlane />
        
      </Canvas>
    </div>
  );
}
