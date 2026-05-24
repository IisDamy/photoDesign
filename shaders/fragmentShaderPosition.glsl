uniform float time;
uniform float delta;
#include <noise>


			void main()	{

				vec2 uv = gl_FragCoord.xy / resolution.xy;
				vec3 position = texture2D( texturePosition, uv ).xyz;		
				vec3 velocity = texture2D( textureVelocity, uv ).xyz;

				position.xyz += velocity.xyz * 1./60.;

				vec4 rands = hash43(vec3(uv * 5.,0.));

				position.xyz += curl(vec3(position.xy, rands.x), 0., 0.1) * 0.001;

				gl_FragColor = vec4( position + velocity*0., 1. );

			}