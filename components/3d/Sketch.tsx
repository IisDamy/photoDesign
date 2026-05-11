"use client";

import { Canvas } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import {
  useMemo,
  useRef,
  useEffect,
} from "react";

import * as THREE from "three";
import { range } from "three/tsl";
import getMaterial from "@/utils/getMaterial";
import { WebGPURenderer } from "three/webgpu";
import { createASCIITexture } from "@/utils/ASCIITextureProvider";

function ShaderPlane() {
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
  const backgroundObjRef = useRef(null)
  const geometryRef = useRef<any>(null);

//  const texture = useMemo(() => {
//   const video = document.createElement("video");

//   video.src = "/videos/clip.mp4"; // transparent video
//   video.loop = true;
//   video.muted = true;
//   video.playsInline = true;
//   video.autoplay = true;

//   video.play();

//   const videoTexture = new THREE.VideoTexture(video);

//   return videoTexture;
// }, []);
  const tempMatrix = useMemo(
    () => new THREE.Matrix4(),
    []
  );

const texture = useTexture('./images/pootsie.png')

  const dict =
    `$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^\`'. `;

  useMemo(
    () => createASCIITexture(dict),
    []
  );

  const material = useMemo(
    () =>
      getMaterial({
        uTexture: texture,
        asciiTexture:
          createASCIITexture(dict),
        length: dict.length,
      }),
    [texture]
  );

  const rows = 50;
  const columns = 50;
  const count = rows * columns;
  const size = 0.1;

  const mouse = useRef({
    x: 999,
    y: 999,
    moving: false,
  });

  const offsets = useRef<
    {
      x: number;
      y: number;
      vx: number;
      vy: number;
    }[]
  >([]);

  useEffect(() => {
    if (
      !instancedMeshRef.current ||
      !geometryRef.current
    )
      return;

    const uv = new Float32Array(
      count * 2
    );

    const random = new Float32Array(
      count
    );

    offsets.current = new Array(count)
      .fill(0)
      .map(() => ({
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
      }));

    let index = 0;

    for (let i = 0; i < rows; i++) {
      for (
        let j = 0;
        j < columns;
        j++
      ) {
        const x =
          i * size -
          (size * (rows - 1)) / 2;

        const y =
          j * size -
          (size * (columns - 1)) / 2;

        uv[index * 2] =
          i / (rows - 1);

        uv[index * 2 + 1] =
          j / (columns - 1);

        random[index] = Math.pow(
          Math.random(),
          4
        );

        tempMatrix.makeTranslation(
          x,
          y,
          0
        );

        instancedMeshRef.current.setMatrixAt(
          index,
          tempMatrix
        );

        index++;
      }
    }

    instancedMeshRef.current.instanceMatrix.needsUpdate =
      true;

    geometryRef.current.setAttribute(
      "aPixelUV",
      new THREE.InstancedBufferAttribute(
        uv,
        2
      )
    );

    geometryRef.current.setAttribute(
      "aRandom",
      new THREE.InstancedBufferAttribute(
        random,
        1
      )
    );

    const onMove = (
      e: MouseEvent
    ) => {
      const x =
        (e.clientX /
          window.innerWidth) *
          2 -
        1;

      const y =
        -(
          e.clientY /
          window.innerHeight
        ) *
          2 +
        1;

      mouse.current.x =
        x * (rows * size * 0.5);

      mouse.current.y =
        y *
        (columns * size * 0.5);

      mouse.current.moving = true;

      clearTimeout(
        (window as any).__asciiIdle
      );

      (window as any).__asciiIdle =
        setTimeout(() => {
          mouse.current.moving = false;
        }, 100);
    };

    window.addEventListener(
      "mousemove",
      onMove
    );

    const pushRadius = 0.5;
    const pushForce = 0.02;
    const spring = 0.05;
    const damping = 0.9;

    const update = () => {
      if (!instancedMeshRef.current)
        return;

      let index = 0;

      for (
        let i = 0;
        i < rows;
        i++
      ) {
        for (
          let j = 0;
          j < columns;
          j++
        ) {
          const physics =
            offsets.current[index];

          const baseX =
            i * size -
            (size * (rows - 1)) /
              2;

          const baseY =
            j * size -
            (size *
              (columns - 1)) /
              2;

          if (
            mouse.current.moving
          ) {
            const dx =
              baseX +
              physics.x -
              mouse.current.x;

            const dy =
              baseY +
              physics.y -
              mouse.current.y;

            const dist =
              Math.sqrt(
                dx * dx + dy * dy
              );

            if (
              dist < pushRadius &&
              dist > 0.0001
            ) {
              const force =
                (1 -
                  dist /
                    pushRadius) *
                pushForce;

              physics.vx +=
                (dx / dist) *
                force;

              physics.vy +=
                (dy / dist) *
                force;
            }
          }

          physics.vx +=
            -physics.x * spring;

          physics.vy +=
            -physics.y * spring;

          physics.vx *= damping;
          physics.vy *= damping;

          physics.x += physics.vx;
          physics.y += physics.vy;

          tempMatrix.makeTranslation(
            baseX + physics.x,
            baseY + physics.y,
            0
          );

          instancedMeshRef.current.setMatrixAt(
            index,
            tempMatrix
          );

          index++;
        }
      }

      instancedMeshRef.current.instanceMatrix.needsUpdate =
        true;

      frame = requestAnimationFrame(update);
    };

    let frame = requestAnimationFrame(update);

    return () => {
      window.removeEventListener(
        "mousemove",
        onMove
      );

      cancelAnimationFrame(frame);
    };
  }, [
    rows,
    columns,
    count,
    size,
    tempMatrix,
  ]);

  // const backgroundActivity = () => {
  //   let num = 10
  //   for (let i = 0; i < num; i++){
  //     let size = range(0.1, 0.4)
  //     let mesh = new THREE.Mesh(
  //       new THREE.BoxGeometry(size, size, size),
  //       new THREE.MeshPhysicalMaterial({color:0xffffff})
  //     )
  //     mesh.position.set(range(-1,1), range(-1,1), range(-1,1))
  //     mesh.rotation.set(range(0, Math.PI),range(0,Math.PI),range(0,Math.PI))
    
  //   }
  // }

  return (
    <instancedMesh
      ref={instancedMeshRef}
      material={material}
      args={[
        undefined,
        undefined,
        count,
      ]}
    >
      
      <boxGeometry ref={backgroundObjRef}/>
      <planeGeometry
        ref={geometryRef}
        args={[size, size, 1, 1]}
      />
    </instancedMesh>
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