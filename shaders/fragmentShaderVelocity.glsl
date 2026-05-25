uniform float time;
uniform sampler2D uTarget;

			void main() {
        		vec2 uv = gl_FragCoord.xy / resolution.xy;

				vec4 position = texture2D( texturePosition, uv );
				vec4 velocity = texture2D( textureVelocity, uv );
				
				//statics
				vec4 target = texture2D(uTarget, uv);
				
				velocity *= 0.85;
				velocity += (target - position) * 2.;


				gl_FragColor = vec4(velocity);

			}
