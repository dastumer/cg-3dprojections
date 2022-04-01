// create a 4x4 matrix to the parallel projection / view matrix
function mat4x4Parallel(prp, srp, vup, clip) {
    // 1. translate PRP to origin
    let m1 = new Matrix(4,4);
    Mat4x4Translate(m1, -prp.x, -prp.y, -prp.z);
    // 2. rotate VRC such that (u,v,n) align with (x,y,z)
    let n = prp.subtract(srp);
    n.normalize;
    let u = vup.cross(n);
    u.normalize;
    let v = n.cross(u);
    let m2 = new Matrix(4,4)
    m2.values = [[u.x, u.y, u.z, 0],
                  [v.x, v.y, v.z, 0],
                  [n.x, n.y, n.z, 0],
                  [0, 0, 0, 1]];
    // 3. shear such that CW is on the z-axis
    let cw = Vector3((clip[0]+clip[1])/2, (clip[2]+clip[3])/2, -clip[4]);
    let m3 = new Matrix(4,4);
    Mat4x4ShearXY(m3, -cw.x/cw.z, -cw.y/cw.z);
    // 4. translate near clipping plane to origin
    let m4 = new Matrix(4,4);
    Mat4x4Translate(m4, 0, 0, clip[4]);
    // 5. scale such that view volume bounds are ([-1,1], [-1,1], [-1,0])
    let m5 = new Matrix(4,4);
    Mat4x4Scale(m5, 2/(clip[1]-clip[0]), 2/(clip[3]-clip[2]), 1/clip[5]);
    // ...
    let transform = Matrix.multiply([m5,m4,m3,m2,m1]);
    return transform;
}

// create a 4x4 matrix to the perspective projection / view matrix
function mat4x4Perspective(prp, srp, vup, clip) {
    // 1. translate PRP to origin
    let m1 = new Matrix(4,4);
    Mat4x4Translate(m1, -prp.x, -prp.y, -prp.z);
    // 2. rotate VRC such that (u,v,n) align with (x,y,z)
    let n = prp.subtract(srp);
    n.normalize;
    let u = vup.cross(n);
    u.normalize;
    let v = n.cross(u);
    let m2 = new Matrix(4,4)
    m2.values = [[u.x, u.y, u.z, 0],
                  [v.x, v.y, v.z, 0],
                  [n.x, n.y, n.z, 0],
                  [0, 0, 0, 1]];
    // 3. shear such that CW is on the z-axis
    let cw = Vector3((clip[0]+clip[1])/2, (clip[2]+clip[3])/2, -clip[4]);
    let m3 = new Matrix(4,4);
    Mat4x4ShearXY(m3, -cw.x/cw.z, -cw.y/cw.z);
    // 4. scale such that view volume bounds are ([z,-z], [z,-z], [-1,zmin])
    let m4 = new Matrix(4,4);
    Mat4x4Scale(m4, (2*clip[4])/((clip[1]-clip[0])*clip[5]), (2*clip[4])/((clip[3]-clip[2])*clip[5]), 1/clip[5]);
    // ...
    let transform = Matrix.multiply([m4,m3,m2,m1]);
    console.log(n);
    console.log(u);
    console.log(v);
    console.log(m2);
    console.log(transform);
    return transform;
}

// create a 4x4 matrix to project a parallel image on the z=0 plane
function mat4x4MPar() {
    let mpar = new Matrix(4, 4);
    mpar.values = [[1, 0, 0, 0],
                  [0, 1, 0, 0],
                  [0, 0, 0, 0],
                  [0, 0, 0, 1]];
    return mpar;
}

// create a 4x4 matrix to project a perspective image on the z=-1 plane
function mat4x4MPer() {
    let mper = new Matrix(4, 4);
    mpar.values = [[1, 0, 0, 0],
                  [0, 1, 0, 0],
                  [0, 0, 1, 0],
                  [0, 0, -1, 0]];
    return mper;
}



///////////////////////////////////////////////////////////////////////////////////
// 4x4 Transform Matrices                                                         //
///////////////////////////////////////////////////////////////////////////////////

// set values of existing 4x4 matrix to the identity matrix
function mat4x4Identity(mat4x4) {
    mat4x4.values = [[1, 0, 0, 0],
                     [0, 1, 0, 0],
                     [0, 0, 1, 0],
                     [0, 0, 0, 1]];
}

// set values of existing 4x4 matrix to the translate matrix
function Mat4x4Translate(mat4x4, tx, ty, tz) {
    mat4x4.values = [[1, 0, 0, tx],
                     [0, 1, 0, ty],
                     [0, 0, 1, tz],
                     [0, 0, 0, 1]];
}

// set values of existing 4x4 matrix to the scale matrix
function Mat4x4Scale(mat4x4, sx, sy, sz) {
    mat4x4.values = [[sx, 0, 0, 0],
                     [0, sy, 0, 0],
                     [0, 0, sz, 0],
                     [0, 0, 0, 1]];
}

// set values of existing 4x4 matrix to the rotate about x-axis matrix
function Mat4x4RotateX(mat4x4, theta) {
    mat4x4.values = [[1, 0, 0, 0],
                     [0, Math.cos(theta), -Math.sin(theta), 0],
                     [0, Math.sin(theta), Math.cos(theta), 0],
                     [0, 0, 0, 1]];
}

// set values of existing 4x4 matrix to the rotate about y-axis matrix
function Mat4x4RotateY(mat4x4, theta) {
    mat4x4.values = [[Math.cos(theta), 0, Math.sin(theta), 0],
                     [0, 1, 0, 0],
                     [-Math.sin(theta), 0, Math.cos(theta), 0],
                     [0, 0, 0, 1]];
}

// set values of existing 4x4 matrix to the rotate about z-axis matrix
function Mat4x4RotateZ(mat4x4, theta) {
    mat4x4.values = [[Math.cos(theta), -Math.sin(theta), 0, 0],
                     [Math.sin(theta), Math.cos(theta), 0, 0],
                     [0, 0, 1, 0],
                     [0, 0, 0, 1]];
}

// set values of existing 4x4 matrix to the shear parallel to the xy-plane matrix
function Mat4x4ShearXY(mat4x4, shx, shy) {
    mat4x4.values = [[1, 0, shx, 0],
                     [0, 1, shy, 0],
                     [0, 0, 1, 0],
                     [0, 0, 0, 1]];
}

// create a new 3-component vector with values x,y,z
function Vector3(x, y, z) {
    let vec3 = new Vector(3);
    vec3.values = [x, y, z];
    return vec3;
}

// create a new 4-component vector with values x,y,z,w
function Vector4(x, y, z, w) {
    let vec4 = new Vector(4);
    vec4.values = [x, y, z, w];
    return vec4;
}
