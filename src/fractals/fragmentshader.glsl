  precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_fractal_c;
uniform float u_fractal_r;

uniform vec2 u_fractal_r_range_start;
uniform vec2 u_fractal_r_range_end;

uniform vec3 u_color_start;
uniform vec3 u_color_end;
uniform vec3 u_color_overflow;
float sdCircle( vec2 p, float r )
{
    return length(p) - r;
}

  void main() {
    float cy = u_fractal_c.x;
    float cx = u_fractal_c.y;
    float r = u_fractal_r;

    vec2 coord = (gl_FragCoord.xy * 2.0 - u_resolution)/ u_resolution.y;
    // coord = fract(coord*2.0) - 0.5;
   
    vec2 frcoords = (u_fractal_r_range_end - u_fractal_r_range_start) * coord+0.5 + u_fractal_r_range_start;

    float zx = frcoords.x;
    float zy = frcoords.y;
    float zxPrev = zx;
    float zyPrev = zy;
    float xSqrd = pow(frcoords.x, 2.0);
    float ySqrd = pow(frcoords.y, 2.0);
    float Rsqrd = pow(r, 2.0);
    int iteration = 0;
    int maxIteration = 80;
    
    for (int iter = 0; iter < 10000; iter += 1) {
        if (xSqrd + ySqrd >= Rsqrd || maxIteration <= iter) {
            break;
        } 
        zy = 2.0 * zx * zy + cy;
        zx = xSqrd - ySqrd + cx;

     	xSqrd = pow(zx, 2.0);
     	ySqrd = pow(zy, 2.0);
        iteration = iter;
    }
    if (iteration < 2) {
      gl_FragColor = vec4(u_color_start, 1.0);
      //return;
    }
    float abs_z = xSqrd + ySqrd;
    float x = sqrt(abs_z) - u_fractal_r;

    if (x > 3.0) {
      gl_FragColor = vec4(1.0, 0, 0, 1.0);
      //return;
    }
    float iterationSmooth = 0.0;
    iterationSmooth = float(iteration);

    iterationSmooth =  float(iteration) + 1.0 - log(log(abs_z))/log(2.0);
    //iterationSmooth = float(iteration) - 1.0*clamp(x/2.0,0.0,1.0);

    iterationSmooth = float(iteration) - 1.0*min(sqrt(x/2.1), 1.0);
      //iterationSmooth = float(iteration) - 2.0*min(exp(x*4.0-4.0), 1.0);
    // iterationSmooth = float(iteration);
    if (iteration == maxIteration - 1) {
        gl_FragColor = vec4(u_color_end, 1.0);
    } else {
        float colorInt = iterationSmooth / float(maxIteration);
        vec3 color = (u_color_end - u_color_start) * colorInt + u_color_start;
        gl_FragColor = vec4(color,1.0);
    }
  }