'use client'

import { useEffect, useState } from "react";
import gsap from "gsap";
import LoadingPage from "./(pages)/LoadingPage";
import ThreeScene from "@/components/3d/Sketch";
import TextScene from "@/components/3d/FadeTransition";
import Mouse from '@/components/ui/mouse';
import Mouse2 from '@/components/ui/mouse2'
import FadeTransition from '@/components/3d/FadeTransition'
export default function Home() {





useEffect(()=>{
  
},[])
  return (
    <div className="flex h-screen text-white overflow-visible  p-0  items-center justify-center bg-white font-sans text-shadow-black text-shadow-lg"> 
      {/* <p className="font-[Googi] text-2xl z-2  absolute font-bold text-purple-300">I build </p> */}
      {/* <Mouse /> */}
      <FadeTransition />
      {/* <ThreeScene /> */}
      {/* <LoadingPage /> */}
      {/* <div className="fixed border w-5 h-5">box</div>    */}
    </div>
  );
}
