"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { WebGPURenderer } from "three/webgpu";
import {vertex, fragment, fragmentShaderPosition, fragmentShaderVelocity} from "@/shaders"
// Replace these imports with your shader files
import { GPUComputationRenderer } from "three/examples/jsm/Addons.js";
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import gsap from "gsap";
import load from "load-asset";
import PoissonDiskSampling  from "poisson-disk-sampling";
// import angelo from "next/angelo.png";
// import pootsie from "next/pootsie.png";
import { array } from "three/tsl";
import { image } from "@/constants";
import pootsieImg from "@/assets/images/pootsie.png";
import angeloImg from "@/assets/images/angelo.png";
import noise from "@/shaders/noise.glsl";


function ShaderPlane() {
  
const {gl} = useThree()

let COUNT = 32;
let TEXTURE_WIDTH = COUNT ** 2;

  const meshRef = useRef<THREE.Mesh>(null);
  const geometryRef = useRef<THREE.BufferGeometry>(null);
  const gpuComputeRef = useRef<GPUComputationRenderer | null>(null);
const positionVariableRef = useRef<any>(null);
const velocityVariableRef = useRef<any>(null);
const positionUniformsRef = useRef<Record<string, THREE.IUniform> | null>(null);
const velocityUniformsRef = useRef<Record<string, THREE.IUniform> | null>(null);
const lastRef = useRef(performance.now());
const pointsRef = useRef<number[][] | null>(null);
const points2Ref = useRef<number[][] | null>(null);


const mouseRef = useRef({
  x: 10000,
  y: 10000,
});



const material = useMemo(() => {
  const newMaterial = new THREE.ShaderMaterial({
  extensions: {
    derivatives: "extension GL_OES_standard_derivatives : enable"
  },
  side: THREE.DoubleSide,
  uniforms: {
    time: {value: 0},
    uPositions: {value: null},
    resolution: {value: new THREE.Vector4()}
  },
  transparent:true,
  vertexShader:vertex,
  fragmentShader:fragment
})
return newMaterial
},[])


// Add objects
let count = TEXTURE_WIDTH
 let positions = new Float32Array(count * 3)
 let reference = new Float32Array(count * 2)



useEffect(()=>{
  console.log(load)
  for (let i = 0; i < count; i++){
    positions[i * 3] = 5 * (Math.random() - .5);
    positions[i * 3 + 1] = 5 * (Math.random() - .5);
    positions[i *3 + 2] = 0;
    reference[i * 2] = (  i % COUNT) / COUNT;
    reference[i * 2 + 1] = ~ ~ (i / COUNT) / COUNT;
  }

  let positionAttribute = new THREE.BufferAttribute(positions, 3)
  geometryRef.current?.setAttribute('position', positionAttribute)
  geometryRef.current?.setAttribute('reference', new THREE.BufferAttribute(reference, 2))

},[])


function fillPositionTexture( texture ) {

				const theArray = texture.image.data;

				for ( let k = 0, kl = theArray.length; k < kl; k += 4 ) {


          // add bounds to the position of the particles, so they don't start in the middle of the screen
					// const x = Math.random() * COUNT - BOUNDS_HALF;
					// const y = Math.random() * COUNT - BOUNDS_HALF;
					// const z = Math.random() * COUNT - BOUNDS_HALF;

					theArray[ k + 0 ] = 2 * (Math.random() - 0.5);
					theArray[ k + 1 ] = 2 * (Math.random() - 0.5);
					theArray[ k + 2 ] = 0;
					theArray[ k + 3 ] = 1;

				}

			}

function fillVelocityTexture( texture ) {

				const theArray = texture.image.data;

				for ( let k = 0, kl = theArray.length; k < kl; k += 4 ) {

					const x = Math.random() - 0.5;
					const y = Math.random() - 0.5;
					// const z = Math.random() - 0.5;

					theArray[ k + 0 ] = 0.01 * x;
					theArray[ k + 1 ] = 0.01 * y;
					theArray[ k + 2 ] = 0;
					theArray[ k + 3 ] = 1;

				}

			}

function fillPositionTextureFromPoints( texture, points ) {

				const theArray = texture.image.data;

				for ( let k = 0, kl = theArray.length; k < kl; k += 4 ) {

          let i = k / 4;

					theArray[ k + 0 ] = 2*(points[i][0] - 0.5);
					theArray[ k + 1 ] = 2*(points[i][1] - 0.5);
					theArray[ k + 2 ] = 0;
					theArray[ k + 3 ] = 1;

				}

			}


    
const initGPU =  () => {

  let gpuCompute = new GPUComputationRenderer( COUNT, COUNT, gl );

				const dtPosition = gpuCompute.createTexture();
        const dtPosition2 = gpuCompute.createTexture();
				const dtVelocity = gpuCompute.createTexture();
				fillPositionTextureFromPoints( dtPosition, pointsRef.current! );
				fillPositionTextureFromPoints( dtPosition2, points2Ref.current! );
				fillVelocityTexture( dtVelocity );

        const target1 = gpuCompute.createTexture();
        const target2 = gpuCompute.createTexture();
        fillPositionTextureFromPoints(target1, pointsRef.current! );
				fillPositionTextureFromPoints(target2, points2Ref.current! );

				let velocityVariable = gpuCompute.addVariable( 'textureVelocity', fragmentShaderVelocity, dtVelocity );
				let positionVariable = gpuCompute.addVariable( 'texturePosition', fragmentShaderPosition, dtPosition );

				gpuCompute.setVariableDependencies( velocityVariable, [ positionVariable, velocityVariable ] );
				gpuCompute.setVariableDependencies( positionVariable, [ positionVariable, velocityVariable ] );
                                                                                     
				positionUniformsRef.current = positionVariable.material.uniforms;
				velocityUniformsRef.current = velocityVariable.material.uniforms;

				positionUniformsRef.current[ 'time' ] = { value: 0.0 };
				// positionUniforms[ 'delta' ] = { value: 0.0 };
				velocityUniformsRef.current[ 'time' ] = { value: 1.0 };
				velocityUniformsRef.current[ 'uTarget' ] = { value: target1};
				// velocityUniforms[ 'testing' ] = { value: 1.0 };
				// velocityUniforms[ 'separationDistance' ] = { value: 1.0 };
				// velocityUniforms[ 'alignmentDistance' ] = { value: 1.0 };
				// velocityUniforms[ 'cohesionDistance' ] = { value: 1.0 };
				// velocityUniforms[ 'freedomFactor' ] = { value: 1.0 };
				// velocityUniforms[ 'predator' ] = { value: new THREE.Vector3() };
				// velocityVariable.material.defines.BOUNDS = BOUNDS.toFixed( 2 );

				velocityVariable.wrapS = THREE.RepeatWrapping;
				velocityVariable.wrapT = THREE.RepeatWrapping;
				positionVariable.wrapS = THREE.RepeatWrapping;
				positionVariable.wrapT = THREE.RepeatWrapping;

         const error = gpuCompute.init();
          if (error) {console.error(error);
            return;}

				gpuComputeRef.current = gpuCompute;
        positionVariableRef.current = positionVariable;
        velocityVariableRef.current = velocityVariable;

				// if ( error !== null ) {

				// 	console.error( error );

				// }
}



useEffect(() => {
  const init = async () => {
    try{
          const points1 = await getPoints(pootsieImg.src);
    console.log(points1)
    const points2 = await getPoints(angeloImg.src);

    pointsRef.current = points1;
    points2Ref.current = points2;

    initGPU(); 

    }
    catch(e){
      console.error(e)
    }

  };
  

 (THREE.ShaderChunk as Record<
    string,
    string
  >
).noise = noise;

  init();
}, [gl]);
let time = 0

  useFrame(() => {
    if (
    !meshRef.current ||
    !gpuComputeRef.current ||
    !positionVariableRef.current ||
    !positionUniformsRef.current ||
    !velocityUniformsRef.current
    ) return;
    time += 0.05

    gpuComputeRef.current.compute();

    positionUniformsRef.current["time"].value =
    time;

    velocityUniformsRef.current["time"].value =
    time;

    material.uniforms[
    "uPositions"
  ].value =
    gpuComputeRef.current.getCurrentRenderTarget(
      positionVariableRef.current
    ).texture;

  material.uniforms.time.value =
    time  
  });



  const getPoints = async (url) => {
    const image  = await load({url, type:"image"});
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", {willReadFrequently: true});
    canvas.width = COUNT;
    canvas.height = COUNT;
    ctx.drawImage(image, 0, 0, COUNT, COUNT);
    const data = ctx.getImageData(0, 0, COUNT, COUNT).data;

    let array = new Array(COUNT).fill().map(() => new Array(COUNT).fill(0));
    for (let i = 0; i < COUNT; i ++) {
      for (let j = 0; j < COUNT; j++) {
        let position = (i * COUNT + j) * 4;
        let color = data[position] / 255
        array[i][j] = color;
      }
  }
    

  const pds = new PoissonDiskSampling({
  shape:[1,1],
  minDistance: 4/400,
  maxDistance: 20/400,
  tries: 4,
  distanceFunction: (point) => {
    const x = Math.floor(point[0] * COUNT);
    const y = Math.floor(point[1] * COUNT);
    return array[y][x];
  },
  bias:0
})

  let points = pds.fill();
  points.sort(() => Math.random() - 0.5);

  points = points.slice(0, TEXTURE_WIDTH)

  return points

}







  
  return (
    <points ref={meshRef} material={material} >
      <bufferGeometry  ref={geometryRef}/>
    </points>
  );
}

export default function ThreeScene() {
  const containerRef = useRef(null)
  const [dimensions, setDimensions] = useState({width:0, heigth:0})

  useEffect(()=>{
    setDimensions({
      width: containerRef.current?.offsetWidth,
      heigth: containerRef.current?.offsetHeight
    })
  },[])

  return (
    <div className="h-screen fixed w-screen p-5" ref={containerRef}>
      <Canvas
        camera={{
          position: [0, 0, 2],
          fov: 70,
        }}
        className="w-full h-full"
        // dpr={[1, 2]}
        // gl={async (props: any) => {
        //   const renderer =
        //     new WebGPURenderer({
        //       ...props,
        //       antialias: true,
        //       alpha: true,
        //     });

        //   await renderer.init();

        //   renderer.setPixelRatio(
        //     Math.min(
        //       window.devicePixelRatio,
        //       2
        //     )
        //   );

        //   renderer.setClearColor(
        //     0x000000,
        //     0
        //   );

        //   return renderer;
        // }}
      >
        <ambientLight intensity={0.5} />
        <ShaderPlane />
     
        
      </Canvas>
    </div>
  );
}
