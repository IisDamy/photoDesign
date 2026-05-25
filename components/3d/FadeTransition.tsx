"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { vertex, fragment, fragmentShaderPosition, fragmentShaderVelocity } from "@/shaders";
import { GPUComputationRenderer } from "three/examples/jsm/Addons.js";
import load from "load-asset";
import PoissonDiskSampling from "poisson-disk-sampling";
import pootsieImg from "@/assets/images/pootsie.png";
import angeloImg from "@/assets/images/angelo.png";
import noise from "@/shaders/noise.glsl";

const COUNT = 40;
const TEXTURE_WIDTH = COUNT ** 2;

type GPURefs = {
  velocityUniforms: React.MutableRefObject<
    Record<string, THREE.IUniform> | null
  >;
  target1: React.MutableRefObject<THREE.DataTexture | null>;
  target2: React.MutableRefObject<THREE.DataTexture | null>;
};

type ShaderPlaneProps = {
  modul: number;
  gpuRefs: GPURefs;
};

function ShaderPlane({ modul, gpuRefs }: ShaderPlaneProps) {
  const { gl } = useThree();

  const meshRef = useRef<THREE.Points>(null);
  const geometryRef = useRef<THREE.BufferGeometry>(null);

  const gpuComputeRef = useRef<GPUComputationRenderer | null>(null);

  const positionVariableRef = useRef<any>(null);
  const velocityVariableRef = useRef<any>(null);

  const positionUniformsRef = useRef<
    Record<string, THREE.IUniform> | null
  >(null);

  const velocityUniformsRef = gpuRefs.velocityUniforms;

  const pointsRef = useRef<number[][] | null>(null);
  const points2Ref = useRef<number[][] | null>(null);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      extensions: {
        derivatives: "extension GL_OES_standard_derivatives : enable",
      },
      side: THREE.DoubleSide,
      transparent: true,
      uniforms: {
        time: { value: 0 },
        uPositions: { value: null },
        resolution: { value: new THREE.Vector4() },
      },
      depthTest: false,
      depthWrite: false,
      vertexShader: vertex,
      fragmentShader: fragment,
    });
  }, []);

  useEffect(() => {
    const positions = new Float32Array(TEXTURE_WIDTH * 3);
    const reference = new Float32Array(TEXTURE_WIDTH * 2);

    for (let i = 0; i < TEXTURE_WIDTH; i++) {
      positions[i * 3] = 5 * (Math.random() - 0.5);
      positions[i * 3 + 1] = 5 * (Math.random() - 0.5);
      positions[i * 3 + 2] = 0;

      reference[i * 2] = (i % COUNT) / COUNT;
      reference[i * 2 + 1] = ~~(i / COUNT) / COUNT;
    }

    geometryRef.current?.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    geometryRef.current?.setAttribute(
      "reference",
      new THREE.BufferAttribute(reference, 2)
    );
  }, []);

  const fillVelocityTexture = useCallback((texture: THREE.DataTexture) => {
    const theArray = texture.image.data;

    for (let k = 0, kl = theArray.length; k < kl; k += 4) {
      const x = Math.random() - 0.5;
      const y = Math.random() - 0.5;

      theArray[k + 0] = 0.01 * x;
      theArray[k + 1] = 0.01 * y;
      theArray[k + 2] = 0;
      theArray[k + 3] = 1;
    }
  }, []);

  const fillPositionTextureFromPoints = useCallback(
    (texture: THREE.DataTexture, points: number[][]) => {
      const theArray = texture.image.data;

      for (let k = 0, kl = theArray.length; k < kl; k += 4) {
        const i = k / 4;

        theArray[k + 0] = 2 * (points[i][0] - 0.5);
        theArray[k + 1] = -2 * (points[i][1] - 0.5);
        theArray[k + 2] = 0;
        theArray[k + 3] = points[i][2];
      }
    },
    []
  );

  const getPoints = useCallback(async (url: string) => {
    const image = await load({
      url,
      type: "image",
    });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", {
      willReadFrequently: true,
    });

    if (!ctx) throw new Error("Canvas context not found");

    canvas.width = COUNT;
    canvas.height = COUNT;

    ctx.drawImage(image, 0, 0, COUNT, COUNT);

    const data = ctx.getImageData(0, 0, COUNT, COUNT).data;

    const array = new Array(COUNT)
      .fill(null)
      .map(() => new Array(COUNT).fill(0));

    for (let i = 0; i < COUNT; i++) {
      for (let j = 0; j < COUNT; j++) {
        const position = (i * COUNT + j) * 4;
        const color = data[position] / 255;

        array[i][j] = color;
      }
    }

    const pds = new PoissonDiskSampling({
      shape: [1, 1],
      minDistance: 2 / 400,
      maxDistance: 10 / 400,
      tries: 20,
      distanceFunction: (point: number[]) => {
        const x = Math.floor(point[0] * COUNT);
        const y = Math.floor(point[1] * COUNT);

        return array[y][x];
      },
      bias: 0,
    });

    let points = pds.fill();
  

    points.sort(() => Math.random() - 0.5);

    points = points.slice(0, TEXTURE_WIDTH);

    points = points.map((point) => {
      let indX = Math.floor(point[0] * COUNT);
      let indY = Math.floor(point[1] * COUNT);
      return [point[0], point[1], array[indY][indX]];
    })

    return points;
  }, []);

  const initGPU = useCallback(() => {
    if (!pointsRef.current || !points2Ref.current) return;

    const gpuCompute = new GPUComputationRenderer(COUNT, COUNT, gl);

    const dtPosition = gpuCompute.createTexture();
    const dtVelocity = gpuCompute.createTexture();

    fillPositionTextureFromPoints(dtPosition, pointsRef.current);

    fillVelocityTexture(dtVelocity);

    const target1 = gpuCompute.createTexture();
    const target2 = gpuCompute.createTexture();

    fillPositionTextureFromPoints(target1, pointsRef.current);
    fillPositionTextureFromPoints(target2, points2Ref.current);

    gpuRefs.target1.current = target1;
    gpuRefs.target2.current = target2;

    const velocityVariable = gpuCompute.addVariable(
      "textureVelocity",
      fragmentShaderVelocity,
      dtVelocity
    );

    const positionVariable = gpuCompute.addVariable(
      "texturePosition",
      fragmentShaderPosition,
      dtPosition
    );

    gpuCompute.setVariableDependencies(velocityVariable, [
      positionVariable,
      velocityVariable,
    ]);

    gpuCompute.setVariableDependencies(positionVariable, [
      positionVariable,
      velocityVariable,
    ]);

    positionUniformsRef.current = positionVariable.material.uniforms;

    velocityUniformsRef.current = velocityVariable.material.uniforms;

    positionUniformsRef.current["time"] = {
      value: 0,
    };

    velocityUniformsRef.current["time"] = {
      value: 1,
    };

    velocityUniformsRef.current["uTarget"] = {
      value: target1,
    };

    velocityVariable.wrapS = THREE.RepeatWrapping;
    velocityVariable.wrapT = THREE.RepeatWrapping;

    positionVariable.wrapS = THREE.RepeatWrapping;
    positionVariable.wrapT = THREE.RepeatWrapping;

    const error = gpuCompute.init();

    if (error) {
      console.error(error);
      return;
    }

    gpuComputeRef.current = gpuCompute;

    positionVariableRef.current = positionVariable;
    velocityVariableRef.current = velocityVariable;
  }, [
    fillPositionTextureFromPoints,
    fillVelocityTexture,
    gl,
    gpuRefs.target1,
    gpuRefs.target2,
    velocityUniformsRef,
  ]);

  useEffect(() => {
    (THREE.ShaderChunk as Record<string, string>).noise = noise;

    const init = async () => {
      try {
        const points1 = await getPoints(pootsieImg.src);
        const points2 = await getPoints(angeloImg.src);

        pointsRef.current = points1;
        points2Ref.current = points2;

        initGPU();
      } catch (e) {
        console.error(e);
      }
    };

    init();
  }, [getPoints, initGPU]);

  useEffect(() => {
    if (!velocityUniformsRef.current) return;

    velocityUniformsRef.current["uTarget"].value =
      modul === 0
        ? gpuRefs.target1.current
        : gpuRefs.target2.current;
  }, [gpuRefs.target1, gpuRefs.target2, modul, velocityUniformsRef]);

  let time = 0;

  useFrame(() => {
    if (
      !meshRef.current ||
      !gpuComputeRef.current ||
      !positionVariableRef.current ||
      !positionUniformsRef.current ||
      !velocityUniformsRef.current
    ) {
      return;
    }

    time += 0.05;

    gpuComputeRef.current.compute();

    positionUniformsRef.current["time"].value = time;

    velocityUniformsRef.current["time"].value = time;

    material.uniforms["uPositions"].value =
      gpuComputeRef.current.getCurrentRenderTarget(
        positionVariableRef.current
      ).texture;

    material.uniforms.time.value = time;
  });

  return (
    <points ref={meshRef} material={material}>
      <bufferGeometry ref={geometryRef} />
    </points>
  );
}

export default function ThreeScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  const [dimensions, setDimensions] = useState({
    width: 0,
    heigth: 0,
  });

  const [modul, setModul] = useState(0);

  const gpuRefs = useMemo<GPURefs>(
    () => ({
      velocityUniforms: {
        current: null,
      },
      target1: {
        current: null,
      },
      target2: {
        current: null,
      },
    }),
    []
  );

  useEffect(() => {
    setDimensions({
      width: containerRef.current?.offsetWidth ?? 0,
      heigth: containerRef.current?.offsetHeight ?? 0,
    });
  }, []);

  return (
    <div
      className="h-screen fixed w-screen p-5"
      ref={containerRef}
    >
      <button
        
        onClick={() => {
          console.log('pressed')
          setModul((prev) => (prev === 0 ? 1 : 0));
          console.log(modul, 'www');
          modul === 0? gpuRefs.velocityUniforms.current!["uTarget"]= {value: gpuRefs.target2.current} : gpuRefs.velocityUniforms.current!["uTarget"].value = gpuRefs.target1.current
        }}
        className="p-4 z-[12] cursor-pointer rounded-[15] fixed bottom-[60] left-[50%] bg-red-700"
      >
        switch
      </button>

      <Canvas
        camera={{
          position: [0, 0, 2],
          fov: 70,
        }}
        className="w-full h-full"
      >
        <ambientLight intensity={0.5} />

        <ShaderPlane
          modul={modul}
          gpuRefs={gpuRefs}
        />
      </Canvas>
    </div>
  );
}