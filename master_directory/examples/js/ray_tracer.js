/*
* General purpose graphics library
*/
/*
* Structure to hold a 2D vector
*/
var Vector2 = /** @class */ (function () {
    function Vector2(x, y) {
        this.x = x;
        this.y = y;
    }
    return Vector2;
}());
/*
* Structure to hold a 3D vector
*/
var Vector3 = /** @class */ (function () {
    function Vector3(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    return Vector3;
}());
/*
* Class that controls graphical output
*/
var Graphics = /** @class */ (function () {
    function Graphics(canvas, w, h) {
        this.w = w;
        this.h = h;
        canvas.width = w;
        canvas.height = h;
        this.ctx = canvas.getContext("2d");
        this.imageData = this.ctx.getImageData(0, 0, w, h); // get the image data in the canvas
        // now put the bytes into an off-screen buffer
        var buf = new ArrayBuffer(this.imageData.data.length);
        this.buf8 = new Uint8ClampedArray(buf);
    }
    /*
    * Put a pixel into our int buffer
    */
    Graphics.prototype.putPixel = function (pos, color) {
        var offset = (pos.y * this.w + pos.x) * 4; // offset for pixels, 32-bit RGBA
        this.buf8[offset + 3] = 255; // alpha
        this.buf8[offset] = color.x; // red
        this.buf8[offset + 1] = color.y; // green
        this.buf8[offset + 2] = color.z; // blue
    };
    /*
    * Show the graphics buffer after drawing
    */
    Graphics.prototype.showBuffer = function () {
        this.imageData.data.set(this.buf8);
        this.ctx.putImageData(this.imageData, 0, 0);
    };
    return Graphics;
}());
/// <reference path='trace_gfx.ts'/>
/*
* Holds 3D object primitives
*/
/*
* Structure to hold a sphere
*/
var Sphere = /** @class */ (function () {
    function Sphere(center, radius, color, specular) {
        this.center = center;
        this.radius = radius;
        this.color = color;
        this.specular = specular;
    }
    return Sphere;
}());
/// <reference path='trace_gfx.ts'/>
/// <reference path='3d_prim.ts'/>
var Math_3D = /** @class */ (function () {
    function Math_3D() {
    }
    /*
    * Add 2 3D vectors
    * Returns a Vector3 result
    */
    Math_3D.AddVectors = function (V1, V2) {
        var a1 = [V1.x, V1.y, V1.z];
        var a2 = [V2.x, V2.y, V2.z];
        var result = a1.map(function (item, index) {
            return item + a2[index];
        });
        return new Vector3(result[0], result[1], result[2]);
    };
    /*
    * Subtract 2 3D vectors
    * Returns a Vector3 result
    */
    Math_3D.SubtractVectors = function (V1, V2) {
        var a1 = [V1.x, V1.y, V1.z];
        var a2 = [V2.x, V2.y, V2.z];
        var result = a1.map(function (item, index) {
            return item - a2[index];
        });
        return new Vector3(result[0], result[1], result[2]);
    };
    /*
    * Gets the dot product of 2 3D vectors
    * Returns a scalar result
    */
    Math_3D.DotProduct = function (V1, V2) {
        return V1.x * V2.x + V1.y * V2.y + V1.z * V2.z;
    };
    /*
    * Gets the cross product of 2 3D vectors
    * Returns a Vector3 result
    */
    Math_3D.CrossProduct = function (V1, V2) {
        var cx = V1.y * V2.z - V1.z * V2.y;
        var cy = V1.z * V2.x - V1.x * V2.z;
        var cz = V1.x * V2.y - V1.y * V2.x;
        return new Vector3(cx, cy, cz);
    };
    /*
    * Gets the magnitude of a 3D vector
    * Returns a scalar result
    */
    Math_3D.VectorMagnitude = function (V) {
        return Math.sqrt(V.x * V.x + V.y * V.y + V.z * V.z);
    };
    /*
    * Gets the result of a vector multiplied by a number
    * Returns a Vector3 result
    */
    Math_3D.MultiplyVector = function (V, N) {
        return new Vector3(V.x * N, V.y * N, V.z * N);
    };
    /*
    * Gets the result of a vector divided by a number
    * Returns a Vector3 result
    */
    Math_3D.DivideVector = function (V, N) {
        return new Vector3(V.x / N, V.y / N, V.z / N);
    };
    /*
    * Gets the unit vector that represents a 3D vector
    * Returns a Vector3 result
    */
    Math_3D.UnitVector = function (V) {
        return Math_3D.DivideVector(V, Math_3D.VectorMagnitude(V));
    };
    /*
    * Returns the absolute value of a vector
    */
    Math_3D.AbsVector = function (V) {
        return new Vector3(Math.abs(V.x), Math.abs(V.y), Math.abs(V.z));
    };
    /*
    * Cast a ray to attempt to intersect with a sphere from start to end
    */
    Math_3D.IntersectRaySphere = function (o, lnn, sphere) {
        var l = Math_3D.UnitVector(lnn); // normalized ray direction
        var c = sphere.center;
        var r = sphere.radius;
        // part 1
        // -(l DOT (o - c))
        var oc = Math_3D.SubtractVectors(o, c); // o - c
        var ld = Math_3D.DotProduct(l, oc); // l DOT (o - c)
        var ldn = -ld; // -(l DOT (o - c))
        // part 2
        // number under radical
        var lds = ld * ld; // ld^2
        var mag = Math_3D.VectorMagnitude(oc); // || o - c ||
        mag = mag * mag;
        var result = lds - mag + r * r;
        var sq = Math.sqrt(result);
        var r1 = ldn - sq;
        var r2 = ldn + sq;
        if (r1 < r2) {
            return r1;
        }
        else {
            return r2;
        }
    };
    /*
    * Check all passed spheres for collision
    */
    Math_3D.IntersectAllSpheres = function (o, lnn, sphereArray) {
        var l = Math_3D.UnitVector(lnn); // normalized ray direction
        // holds ending information
        var sphere = undefined;
        var distance = 999;
        for (var i = 0; i < sphereArray.length; i++) {
            var t_dist = Math_3D.IntersectRaySphere(o, lnn, sphereArray[i]);
            if (distance > t_dist && t_dist >= 0) {
                distance = t_dist;
                sphere = sphereArray[i];
            }
        }
        if (sphere != undefined) {
            var P = Math_3D.AddVectors(o, Math_3D.MultiplyVector(l, distance)); // compute hit pos
            var N = Math_3D.SubtractVectors(P, sphere.center); // compute sphere normal
            var NORM = Math_3D.UnitVector(N); // gets the normalized normal
            return { sphere: sphere, distance: distance, hit_point: P, hit_normal: NORM };
        }
        return { sphere: sphere, distance: distance, hit_point: undefined, hit_normal: undefined };
    };
    return Math_3D;
}());
/// <reference path='trace_gfx.ts'/>
/// <reference path='math_3d.ts'/>
/*
* Holds lighting information
*/
/*
* enum to hold light types
*/
var LIGHT_TYPE;
(function (LIGHT_TYPE) {
    LIGHT_TYPE[LIGHT_TYPE["AMBIENT"] = 0] = "AMBIENT";
    LIGHT_TYPE[LIGHT_TYPE["POINT"] = 1] = "POINT";
    LIGHT_TYPE[LIGHT_TYPE["DIRECTIONAL"] = 2] = "DIRECTIONAL";
})(LIGHT_TYPE || (LIGHT_TYPE = {}));
/*
* Structure to hold lights
*/
var Light = /** @class */ (function () {
    function Light(type, intensity, position, direction) {
        this.type = type;
        this.intensity = intensity;
        this.position = position;
        this.direction = direction;
    }
    return Light;
}());
var Lighting = /** @class */ (function () {
    function Lighting() {
    }
    Lighting.CalcLighting = function (P, N, V, lights, s, sphereArray) {
        var i = 0;
        for (var l = 0; l < lights.length; l++) {
            var li = lights[l];
            if (li.type == LIGHT_TYPE.AMBIENT) {
                i += li.intensity;
            }
            else {
                var L = undefined;
                if (li.type == LIGHT_TYPE.POINT) {
                    L = Math_3D.SubtractVectors(li.position, P);
                }
                else {
                    L = li.direction;
                }
                var new_l = Math_3D.AddVectors(L, N);
                // shadows
                var hit = Math_3D.IntersectAllSpheres(P, new_l, sphereArray);
                if (hit.sphere != undefined) {
                    continue;
                }
                // diffuse lighting
                var n_dot_l = Math_3D.DotProduct(N, L);
                if (n_dot_l > 0) {
                    i += li.intensity * n_dot_l / (Math_3D.VectorMagnitude(N) * Math_3D.VectorMagnitude(L));
                }
                // specular lighting
                if (s != -1) {
                    var R1 = Math_3D.MultiplyVector(N, 2);
                    var R2 = Math_3D.DotProduct(N, L);
                    var R3 = Math_3D.MultiplyVector(R1, R2);
                    var R4 = Math_3D.SubtractVectors(R3, L);
                    var r_dot_v = Math_3D.DotProduct(R4, V);
                    if (r_dot_v > 0) {
                        i += li.intensity * Math.pow(r_dot_v / (Math_3D.VectorMagnitude(R4) * Math_3D.VectorMagnitude(V)), s);
                    }
                }
            }
        }
        return i;
    };
    return Lighting;
}());
/// <reference path='trace_gfx.ts'/>
/// <reference path='3d_prim.ts'/>
/// <reference path='math_3d.ts'/>
/// <reference path='lighting.ts'/>
// create the graphics context
var canvas = document.getElementById("drawCanvas");
var g = new Graphics(canvas, 256, 256);
// define the spheres
var sphereArray = [
    new Sphere(new Vector3(-4 * Math.random() + 2, 1 * Math.random(), 4 * Math.random() + 1), 1, new Vector3(255, 0, 0), 500),
    new Sphere(new Vector3(-4 * Math.random() + 2, 1 * Math.random(), 4 * Math.random() + 1), 1, new Vector3(0, 0, 255), 500),
    new Sphere(new Vector3(-4 * Math.random() + 2, 1 * Math.random(), 4 * Math.random() + 1), 1, new Vector3(0, 255, 0), 10),
    new Sphere(new Vector3(0, -5001, 0), 5000, new Vector3(255, 255, 0), 1000),
];
// define the scene lights
var lightArray = [
    new Light(LIGHT_TYPE.AMBIENT, 0.2),
    new Light(LIGHT_TYPE.POINT, 0.6, new Vector3(2, 1, 0)),
    new Light(LIGHT_TYPE.DIRECTIONAL, 0.2, undefined, new Vector3(1, 4, 4))
];
// define camera pos and other stuff
var camera = new Vector3(0, 0, 0); // camera is at the origin
for (var x = -g.w / 2; x < g.w / 2; x++) {
    for (var y = -g.h / 2; y < g.h / 2; y++) {
        var hit = Math_3D.IntersectAllSpheres(camera, new Vector3(x / g.w, -y / g.h, 1), sphereArray);
        if (hit.sphere != undefined) {
            var ray_dir = Math_3D.UnitVector(new Vector3(x / g.w, -y / g.h, 1));
            var light_index = Lighting.CalcLighting(hit.hit_point, hit.hit_normal, new Vector3(-ray_dir.x, -ray_dir.y, -ray_dir.z), lightArray, hit.sphere.specular, sphereArray);
            g.putPixel(new Vector2(x + g.w / 2, y + g.w / 2), new Vector3(hit.sphere.color.x * light_index, hit.sphere.color.y * light_index, hit.sphere.color.z * light_index));
        }
        else {
            g.putPixel(new Vector2(x + g.w / 2, y + g.w / 2), new Vector3(255, 255, 255));
        }
        //console.log();
    }
}
g.showBuffer();
//console.log(g.w);
