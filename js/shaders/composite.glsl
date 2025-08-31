precision mediump float;

uniform sampler2D u_scene;
uniform sampler2D u_bloom;
uniform float u_bloomStrength;

varying vec2 v_texCoord;

void main(){
  vec4 sceneColor=texture2D(u_scene,v_texCoord);
  vec4 bloomColor=texture2D(u_bloom,v_texCoord);
  
  gl_FragColor=sceneColor+bloomColor*u_bloomStrength;
}
