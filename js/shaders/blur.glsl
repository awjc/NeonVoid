precision mediump float;

uniform sampler2D u_texture;
uniform vec2 u_resolution;
uniform vec2 u_direction;

varying vec2 v_texCoord;

void main(){
  vec4 color=vec4(0.);
  vec2 texelSize=1./u_resolution;
  
  // Extra wide blur for expansive atmospheric glow
  vec2 off1=vec2(1.4)*u_direction*texelSize*6.;
  vec2 off2=vec2(3.3)*u_direction*texelSize*6.;
  vec2 off3=vec2(5.2)*u_direction*texelSize*6.;
  vec2 off4=vec2(7.1)*u_direction*texelSize*6.;
  vec2 off5=vec2(9.)*u_direction*texelSize*6.;
  
  // Extended sampling for wide atmospheric effect
  color+=texture2D(u_texture,v_texCoord)*.18;
  color+=texture2D(u_texture,v_texCoord+off1)*.22;
  color+=texture2D(u_texture,v_texCoord-off1)*.22;
  color+=texture2D(u_texture,v_texCoord+off2)*.12;
  color+=texture2D(u_texture,v_texCoord-off2)*.12;
  color+=texture2D(u_texture,v_texCoord+off3)*.06;
  color+=texture2D(u_texture,v_texCoord-off3)*.06;
  color+=texture2D(u_texture,v_texCoord+off4)*.02;
  color+=texture2D(u_texture,v_texCoord-off4)*.02;
  color+=texture2D(u_texture,v_texCoord+off5)*.01;
  color+=texture2D(u_texture,v_texCoord-off5)*.01;
  
  gl_FragColor=color;
}
