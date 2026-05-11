import React from 'react'

export default function MaskBackground() {
  return (
    <div className='h-full w-full bg-black z-4  flex justify-start items-start'>
        <div>
          <img src={'/images/angelo.png'} alt='angelo' className='scale-[2] invert left-[40] relative  top-[200] cover'/>
        </div>
    </div>
  )
}
