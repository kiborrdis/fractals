#version 300 es
  
  precision highp float;

  in vec3 a_position;
  in vec2 a_texture_coord;
 
  uniform vec2 u_resolution;

  out highp vec2 vTextureCoord;

  void main() {
    // convert the position from pixels to 0.0 to 1.0
    vec2 zeroToOne = a_position.xy/u_resolution;
 
    // convert from 0->1 to 0->2
    vec2 zeroToTwo = zeroToOne * 2.0;
 
    // convert from 0->2 to -1->+1 (clip space)
    vec2 clipSpace = zeroToTwo - 1.0;

    vTextureCoord = a_texture_coord;

    gl_Position = vec4(clipSpace * vec2(1, -1), a_position.z, 1);
  }