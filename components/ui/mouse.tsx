'use client';
import { useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function Index() {
  const cursorSize = 15;

  const mouse = {
    x: useMotionValue(0),
    y: useMotionValue(0),
  };

  // Slower spring = slight delay
  const smoothOptions = {
    damping: 20,
    stiffness: 300, // lower = more lag
    mass: 0.5,        // higher = more inertia
  };

    const smoothOptions2 = {
    damping: 25,
    stiffness: 120, // lower = more lag
    mass: 1,        // higher = more inertia
  };


  const smoothMouse = {
    x: useSpring(mouse.x, smoothOptions),
    y: useSpring(mouse.y, smoothOptions),
    x2: useSpring(mouse.x, smoothOptions2),
    y2: useSpring(mouse.y, smoothOptions2)
  };



  const manageMouseMove = (e) => {
    const { clientX, clientY } = e;

    mouse.x.set(clientX - cursorSize / 2);
    mouse.y.set(clientY - cursorSize / 2);
  };

  useEffect(() => {
    window.addEventListener('mousemove', manageMouseMove);

    return () => {
      window.removeEventListener('mousemove', manageMouseMove);
    };
  }, []);

  return (
    <div>
      <motion.div
        style={{
          left: smoothMouse.x,
          top: smoothMouse.y,
          x: '-50%',
          y: '-50%',
          
        }}
        className="fixed w-[20px] h-[20px] bg-black rounded-full z-2"
      />

         <motion.div
        style={{
          left: smoothMouse.x2,
          top: smoothMouse.y2,
          x: '-50%',
          y: '-50%',
          
        }}
        className="fixed w-[80px] h-[80px] border-black border rounded-full z-2"
      />
    </div>
  );
}