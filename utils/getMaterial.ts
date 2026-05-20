// import * as THREE from "three";
import image from '@/public/images/angelo.png'
import { vec2, float, vec3, Loop, step, Fn, sign, 
    positionLocal, transformNormalToView, dot, uniform,
    varying, mx_noise_float, color, cross,uv, texture, 
    mix, vec4,pow, attribute, floor
 } from "three/tsl";
import * as THREE from "three/webgpu";
import { Texture, TextureEventMap } from 'three/webgpu';

let pallete = [
    "#8c1dff",
    "#f223ff",
    "#ff2976",
    "#ff901f",
    "#ffd318"
]

interface GetMaterialsProps {
    uTexture: THREE.Texture,
    length: number,
    asciiTexture: any
}

export default function getMaterial({uTexture, length, asciiTexture}: GetMaterialsProps){



    let material = new THREE.MeshBasicNodeMaterial({
        // wireframe:true,
        transparent: true
    })
    
    const uColor1 = uniform(color(pallete[0]))
    const uColor2 = uniform(color(pallete[1]))
    const uColor3 = uniform(color(pallete[2]))
    const uColor4 = uniform(color(pallete[3]))
    const uColor5 = uniform(color(pallete[4]))

    // const uVideoTexture = uniform(uTexture)

    const asciicode = Fn(()=>{
        const textureColor = texture(uTexture, attribute('aPixelUV'))
        const luminance = textureColor.rgb.dot(
        vec3(0.299, 0.587, 0.114))
        const randomOffset = attribute('aRandom').mul(0.02).mul(textureColor.a)

       const brightness = pow(luminance.mul(textureColor.a),0.8).add(randomOffset)

        const charIndex = floor(float(1).sub(brightness).mul(length - 1))

        const asciiuv = vec2(
        uv().x.div(length).add(
            charIndex.div(length)
        ),
        uv().y)

        const asciicode = texture(asciiTexture, asciiuv)
        // const asciicode = texture(uTexture)

        let finalColor = uColor1
        finalColor = mix(finalColor, uColor2, step(0.1, brightness));
        finalColor = mix(finalColor, uColor3, step(0.2, brightness));
        finalColor = mix(finalColor, uColor4, step(0.3, brightness));
        finalColor = mix(finalColor, uColor5, step(0.4, brightness));


        // return vec4(textureColor.rgb, 1.0)
        return asciicode.mul(finalColor, 1.2)
})

    material.colorNode = asciicode()

    return material


}

