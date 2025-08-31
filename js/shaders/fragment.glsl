precision mediump float;

varying vec3 v_normal;
varying vec3 v_position;

uniform vec3 u_color;
uniform vec3 u_lightPosition;
uniform vec3 u_cameraPosition;
uniform float u_glowIntensity;

void main(){
  vec3 normal=normalize(v_normal);
  vec3 lightDir=normalize(u_lightPosition-v_position);
  vec3 viewDir=normalize(u_cameraPosition-v_position);
  
  // Basic lighting
  float NdotL=max(dot(normal,lightDir),0.);
  float NdotV=max(dot(normal,viewDir),0.);
  
  // Enhanced fresnel effect for stronger glow
  float fresnel=pow(1.-NdotV,2.);
  
  // Base material color (not too bright)
  vec3 baseColor=u_color*(NdotL*.4+.3);
  
  // Strong rim glow for bloom extraction
  vec3 rimGlow=u_color*fresnel*u_glowIntensity;
  
  // Combine effects
  vec3 finalColor=baseColor+rimGlow;
  
  gl_FragColor=vec4(finalColor,1.);
}
