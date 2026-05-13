'use client'

import { useEffect, useRef } from "react";
import * as THREE from "three";

type GlitchImageProps = {
  src: string;
  alt?: string;
  className?: string;
  intensity?: number;
  updateFrequency?: number;
};

export default function GlitchImage({
  src,
  alt = "",
  className = "",
  intensity = 0.5,
  updateFrequency = 0.1,
}: GlitchImageProps) {

  const containerRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {

    const imageContainer = containerRef.current;
    const imageElement = imageRef.current;

    if (!imageContainer || !imageElement) return;

    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let planeMesh: THREE.Mesh;

    let animationFrame = 0;
    let isHovered = false;
    let hoverDuration = 0;

    const vertexShader = `
      varying vec2 vUv;

      void main() {

        vUv = uv;

        gl_Position =
          projectionMatrix *
          modelViewMatrix *
          vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform sampler2D tDiffuse;
      uniform float glitchIntensity;

      varying vec2 vUv;

      void main() {

        vec2 uv = vUv;

        vec4 baseState = texture2D(tDiffuse, uv);

        float brightness =
        (baseState.r + baseState.g + baseState.b) / 3.0;

        if (brightness > 0.95) {
        discard;
        }

        if (glitchIntensity > 0.0) {

          float segment = floor(uv.y * 12.0);

          float randomValue = fract(
            sin(segment * 12345.6789 + glitchIntensity)
            * 43758.5453
          );

          vec2 offset =
            vec2(randomValue * 0.03, 0.0)
            * glitchIntensity;

          vec4 redGlitch =
            texture2D(tDiffuse, uv + offset);

          vec4 greenGlitch =
            texture2D(tDiffuse, uv - offset);

          vec4 blueGlitch =
            texture2D(tDiffuse, uv);

          if (mod(segment, 3.0) == 0.0) {

            gl_FragColor = vec4(
              redGlitch.r,
              greenGlitch.g,
              baseState.b,
              1.0
            );

          } else if (mod(segment, 3.0) == 1.0) {

            gl_FragColor = vec4(
              baseState.r,
              greenGlitch.g,
              blueGlitch.b,
              1.0
            );

          } else {

            gl_FragColor = vec4(
              redGlitch.r,
              baseState.g,
              blueGlitch.b,
              1.0
            );
          }

        } else {

         float brightness =
        (baseState.r + baseState.g + baseState.b) / 3.0;

        if (brightness > 0.95) {
        discard;
        }

        gl_FragColor = baseState;
            }
        }
        `;

    function initializeScene(texture: THREE.Texture) {

      const width = imageElement.offsetWidth;
      const height = imageElement.offsetHeight;

      // camera
      camera = new THREE.PerspectiveCamera(
        80,
        width / height,
        0.01,
        10
      );

      camera.position.z = 1;

      // scene
      scene = new THREE.Scene();

      // uniforms
      const shaderUniforms = {
        tDiffuse: { value: texture },
        glitchIntensity: { value: 0.0 },
      };

      // mesh
      planeMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 2),

        new THREE.ShaderMaterial({
          uniforms: shaderUniforms,
          vertexShader,
          fragmentShader,
          transparent:true
        })
      );

      scene.add(planeMesh);

      // renderer
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
      });

      renderer.setSize(width, height);

      renderer.domElement.className =
        "absolute inset-0 h-full w-full";

      imageContainer.appendChild(renderer.domElement);

      // hover events
      const onMouseOver = () => {
        isHovered = true;
      };

      const onMouseOut = () => {
        isHovered = false;

        shaderUniforms.glitchIntensity.value = 0;
      };

      imageContainer.addEventListener(
        "mouseover",
        onMouseOver
      );

      imageContainer.addEventListener(
        "mouseout",
        onMouseOut
      );

      return () => {
        imageContainer.removeEventListener(
          "mouseover",
          onMouseOver
        );

        imageContainer.removeEventListener(
          "mouseout",
          onMouseOut
        );
      };
    }

    const start = () => {

      const texture = new THREE.TextureLoader().load(src);

      initializeScene(texture);

      animateScene();
    };

    if (imageElement.complete) {
      start();
    } else {
      imageElement.onload = start;
    }

    function animateScene() {

      animationFrame =
        requestAnimationFrame(animateScene);

      if (isHovered) {

        hoverDuration += updateFrequency;

        if (hoverDuration >= 0.5) {

          hoverDuration = 0;

          (
            planeMesh.material as THREE.ShaderMaterial
          ).uniforms.glitchIntensity.value =
            Math.random() * intensity;
        }
      }

      renderer.render(scene, camera);
    }

    const handleResize = () => {

      if (!renderer || !camera) return;

      const width = imageElement.offsetWidth;
      const height = imageElement.offsetHeight;

      renderer.setSize(width, height);

      camera.aspect = width / height;

      camera.updateProjectionMatrix();
    };

    window.addEventListener(
      "resize",
      handleResize
    );

    return () => {

      cancelAnimationFrame(animationFrame);

      window.removeEventListener(
        "resize",
        handleResize
      );

      planeMesh?.geometry.dispose();

      (
        planeMesh?.material as THREE.Material
      )?.dispose();

      renderer?.dispose();

      if (
        renderer?.domElement &&
        renderer.domElement.parentNode
      ) {
        renderer.domElement.parentNode.removeChild(
          renderer.domElement
        );
      }
    };

  }, [src, intensity, updateFrequency]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
    >
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        className="
          h-full
          w-full
          object-cover
          opacity-0
        "
      />
    </div>
  );
}