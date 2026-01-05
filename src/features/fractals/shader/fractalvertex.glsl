#version 300 es
  
  precision highp float;

  in vec3 a_position;
  in vec2 a_texture_coord;
 
  uniform vec2 u_resolution;

  uniform vec2 u_camera_offset;
  uniform float u_camera_scale;


  out highp vec2 vTextureCoord;
  // 0 700
  // 0 700

  // f = (ps - res/2)/(res*scale/2) 
  // f = ps / ((res*scale/2)) - (res/2) / ((res*scale/2)
  // f = ps / ((res*scale/2)) - 1/scale

  // 350 350
  void main() {
    // convert the position from pixels to 0.0 to 1.0
    vec2 zeroToOne = a_position.xy/u_resolution;
    vec2 zeroToTwo = zeroToOne * 2.0;
    vec2 clipSpace = zeroToTwo - 1.0;
    
    // float scale = 0.1;
    // vec2 zeroToOne = (a_position.xy - u_resolution/2.0)/((u_resolution/2.0) * scale);
    // vec2 clipSpace = zeroToOne;

    
    // ps = a_position; res = u_resolution
    // f = (ps - res/2)/(res*scale/2) 
    // f = ps / ((res*scale/2)) - (res/2) / ((res*scale/2)
    // f = ps / ((res*scale/2)) - 1/scale
    // float scale = u_tex_scale;
    // vec2 clipSpace = (a_position.xy - u_tex_offset) / ((u_resolution * scale) / 2.0) - 1.0/scale;

    // float aspect = u_resolution.y / u_resolution.x;
    // vec2 normlizedOffset = (u_tex_offset) / u_resolution;

    vTextureCoord = ((a_texture_coord - 0.5) * u_camera_scale + 0.5) + u_camera_offset/u_resolution;
    // vTextureCoord = a_texture_coord;

    gl_Position = vec4(clipSpace * vec2(1, -1), a_position.z, 1);
  }