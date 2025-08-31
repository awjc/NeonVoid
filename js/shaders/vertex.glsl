attribute vec3 a_position;
attribute vec3 a_normal;

uniform mat4 u_modelMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;
uniform mat4 u_normalMatrix;

varying vec3 v_normal;
varying vec3 v_position;

void main(){
  vec4 worldPosition=u_modelMatrix*vec4(a_position,1.);
  v_position=worldPosition.xyz;
  v_normal=(u_normalMatrix*vec4(a_normal,0.)).xyz;
  
  gl_Position=u_projectionMatrix*u_viewMatrix*worldPosition;
}
