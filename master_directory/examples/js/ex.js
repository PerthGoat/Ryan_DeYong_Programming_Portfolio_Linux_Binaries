var orig_cube = [
        //front face
        [-1, -1, 1, 1],
        [1, -1, 1, 1],
        [1, 1, 1, 1],
        [-1, 1, 1, 1],
        //back face
        [-1, -1, -1, 1],
        [1, -1, -1, 1],
        [1, 1, -1, 1],
        [-1, 1, -1, 1],
];

var worldMatrix = [
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1],
];

var f = math.cot(1.047 / 2);

var zFar = 1.0;
var zNear = 0.01;

var perspectiveMatrix = [
            [f, 0, 0, 0],
            [0, f, 0, 0],
            [0, 0, (zFar + zNear) / (zNear - zFar), (2 * zFar * zNear) / (zNear - zFar)],
            [0, 0, -1, 0],
];

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

//multiplies the master matrix by a translation matrix
function translate(x, y, z)
{
    translationMatrix = [
                        [1, 0, 0, x],
                        [0, 1, 0, y],
                        [0, 0, 1, z],
                        [0, 0, 0, 1]
    ];
    
    worldMatrix = math.multiply(translationMatrix, worldMatrix);
}

//rotates the master matrix on a chosen axis by theta
function rotate(x, y, z, theta)
{
    var rotationMatrix;
    if(x)
    {
        rotationMatrix = [
                        [1, 0, 0, 0],
                        [0, Math.cos(theta), -Math.sin(theta), 0],
                        [0, Math.sin(theta), Math.cos(theta), 0],
                        [0, 0, 0, 1]
        ];
        
        worldMatrix = math.multiply(rotationMatrix, worldMatrix);
    }
    if(y)
    {
        rotationMatrix = [
                        [Math.cos(theta), 0, Math.sin(theta), 0],
                        [0, 1, 0, 0],
                        [-Math.sin(theta), 0, Math.cos(theta), 0],
                        [0, 0, 0, 1]
        ];
        
        worldMatrix = math.multiply(rotationMatrix, worldMatrix);
    }
    if(z)
    {
        rotationMatrix = [
                        [Math.cos(theta), -Math.sin(theta), 0, 0],
                        [Math.sin(theta), Math.cos(theta), 0, 0],
                        [0, 0, 1, 0],
                        [0, 0, 0, 1]
        ];
        
        worldMatrix = math.multiply(rotationMatrix, worldMatrix);
    }
}

//multiplies the master matrix by a scale matrix
function scale(x, y, z)
{
    scaleMatrix = [
                [x, 0, 0, 0],
                [0, y, 0, 0],
                [0, 0, z, 0],
                [0, 0, 0, 1]
    ];
    
    worldMatrix = math.multiply(scaleMatrix, worldMatrix);
}

translate(0, 0, -4);

// draws a shaded face based on a passed in id for that particular face
function draw_face(face_id) {
	switch(face_id) {
		case 0:
			ctx.fillStyle = "#F00";
			ctx.beginPath();
			ctx.moveTo(cube[0][0], cube[0][1]);
			ctx.lineTo(cube[1][0], cube[1][1]);
			ctx.lineTo(cube[2][0], cube[2][1]);
			ctx.lineTo(cube[3][0], cube[3][1]);
			ctx.lineTo(cube[0][0], cube[0][1]);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		break;
		case 1:
			ctx.fillStyle = "#00F";
			//draws back face
			ctx.beginPath();
			ctx.moveTo(cube[4][0], cube[4][1]);
			ctx.lineTo(cube[5][0], cube[5][1]);
			ctx.lineTo(cube[6][0], cube[6][1]);
			ctx.lineTo(cube[7][0], cube[7][1]);
			ctx.lineTo(cube[4][0], cube[4][1]);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		break;
		case 2:
			ctx.fillStyle = "#0F0";
			ctx.beginPath();
			ctx.moveTo(cube[0][0], cube[0][1]);
			ctx.lineTo(cube[3][0], cube[3][1]);
			ctx.lineTo(cube[7][0], cube[7][1]);
			ctx.lineTo(cube[4][0], cube[4][1]);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		break;
		case 3:
			ctx.fillStyle = "#FF0";
			ctx.beginPath();

			ctx.moveTo(cube[1][0], cube[1][1]);
			ctx.lineTo(cube[2][0], cube[2][1]);
			ctx.lineTo(cube[6][0], cube[6][1]);
			ctx.lineTo(cube[5][0], cube[5][1]);

			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		break;
		default:
		alert("BAD FACEID");
		break;
	}
}

// draws a rotating cube
function draw_rotate_cube() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	rotate(0, 1, 0, 0.1);
	translate(Math.sin(0.4), 0, 0);

	cube = orig_cube.slice(); // creates a copy of the original cube

	// transforms the cube by the worldmatrix, perspectiveMatrix, and divides it by the 4th vector to correctly render it
	// multiplies and adds 256 for better display
	for(var i = 0;i < cube.length;i++)
	{
		cube[i] = math.multiply(worldMatrix, cube[i]);
		cube[i] = math.multiply(perspectiveMatrix, cube[i]);
		cube[i] = math.divide(cube[i], cube[i][3]);
		cube[i] = math.multiply(cube[i], 256);
		cube[i] = math.add(cube[i], 256);
	}
	
	// calculates the length of all of the faces
	var face1 = Math.abs(cube[3][1] - cube[0][1]);
	var face2 = Math.abs(cube[7][1] - cube[4][1]);

	var line_1 = Math.abs(cube[7][1] - cube[0][1]);
	var line_2 = Math.abs(cube[2][1] - cube[1][1]);
	
	var face_array = [[face1, 0], [face2, 1], [line_1, 2], [line_2, 3]];
	
	// sorts all of the faces by how close they are to the camera based on how long they are on the y axis
	var sorted_faces = face_array.sort((a, b) => a[0] - b[0]);
	
	// draws the faces in order, shortest is drawn first, then longer are drawn over it
	for(var i = 0;i < sorted_faces.length;i++) {
		draw_face(sorted_faces[i][1]);
	}
}

// rotates the cube every 0.1 seconds
setInterval(draw_rotate_cube, 100);