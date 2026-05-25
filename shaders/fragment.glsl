varying vec2 vUv;
uniform float time;
uniform float progress;
uniform sampler2D texture1;
uniform vec4 resolution;
varying vec3 vPosition;
float PI = 3.141592653589793238;
varying float vShade;

void main() {
vec3 color = vec3(.2);
 float alpha = 1. - length(gl_PointCoord.xy - 0.5)*2.;
 

float finalAlpha = alpha*0.05 + smoothstep(0.,1.,alpha)*0.1 + 0.5 * smoothstep(0.9-fwidth(alpha),0.9,alpha);

float opac = 1. - (0.3 + .7*vShade);

 gl_FragColor = vec4(color, finalAlpha*opac);
}



/*void main() {
  // Create a bright, glowing particle
  float dist = length(gl_PointCoord.xy - 0.5);
  float alpha = 1. - dist * 2.;
  
  // Radial gradient for glow effect
  float glow = pow(1. - dist, 2.);
  
  // Bright colors that "pop"
  vec3 color1 = vec3(1.0, 0.4, 0.2); // Orange/red
  vec3 color2 = vec3(1.0, 0.8, 0.2); // Yellow
  vec3 color = mix(color1, color2, glow);
  
  // Make center brighter
  color += vec3(0.5) * (1. - dist);
  
  float finalAlpha = alpha * 0.9 + glow * 0.5;
  
  gl_FragColor = vec4(color, finalAlpha);
}*/