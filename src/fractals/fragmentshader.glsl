precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_fractal_c;
uniform float u_fractal_r;
uniform float u_sep;
uniform float u_time;

uniform vec2 u_fractal_r_range_start;
uniform vec2 u_fractal_r_range_end;

uniform vec3 u_color_start;
uniform vec3 u_color_end;
uniform vec3 u_color_overflow;
float sdCircle( vec2 p, float r )
{
    return length(p) - r;
}

vec3 palette(float t) {
  vec3 a = vec3(0.5, 0.5, 0.5);
  vec3 b = vec3(0.5, 0.5, 0.5);
  vec3 c = vec3(1.0, 1.0, 1.0);
  vec3 d = vec3(0.263, 0.416, 0.557);

  return a + b* cos(6.28318*(c*t*d));
}

  void main() {
    float cy = u_fractal_c.x;
    float cx = u_fractal_c.y;
    float r = u_fractal_r;

    float sep = u_sep;
    vec2 centeredCoord = gl_FragCoord.xy * 2.0 - u_resolution;

    vec2 uv = centeredCoord / u_resolution.x;
    vec2 preparedCoord = mod(centeredCoord, u_resolution.x / sep) - u_resolution.x / (sep * 2.0);
    vec2 coord = abs(preparedCoord/ u_resolution.y);

    vec3 palColor = palette(length(uv) + u_time / 1000.0);

    vec3 palColorEnd = palette(length(coord) + u_time / 1130.0);

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
    int maxIteration = 150;
    
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
        vec3 resultColor = 0.8*u_color_end + 0.2*palColorEnd ;

        gl_FragColor = vec4(resultColor, 1.0) * (1.0-length(uv));
    } else {
        float colorInt = iterationSmooth / float(maxIteration);
        //vec3 color = mix(u_color_start, u_color_start, log(colorInt));
        vec3 color = (u_color_end - u_color_start) * colorInt + u_color_start;

        vec3 resultColor = ((0.9 + 0.1*(1.0- colorInt))*color + (0.0 + 0.1 * colorInt )*palColor);
        gl_FragColor = vec4(resultColor,1.0);
    }
  }