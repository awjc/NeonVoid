precision mediump float;

uniform sampler2D u_texture;
uniform vec2 u_resolution;
uniform float u_bloomThreshold;

varying vec2 v_texCoord;

void main(){
  vec4 color=texture2D(u_texture,v_texCoord);
  
  // Extract bright areas
  float brightness=dot(color.rgb,vec3(.2126,.7152,.0722));
  
  if(brightness>u_bloomThreshold){
    gl_FragColor=color;
  }else{
    gl_FragColor=vec4(0.,0.,0.,1.);
  }
}
