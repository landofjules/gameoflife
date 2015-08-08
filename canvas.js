// ** PARAMETERS for WEBSITE **
//  
// ====>> COLOR <<==== // 
var CLR_2000 = {
   bg:"#460662",
   offb:"#580853",
   onb:"#8F0047",
   on:"#ffcc00"
};
var CLR_bluprint = {
   bg:"#001144",
   offb:"#002288",
   onb:"#0099FF",
   on:"#ffffff"
};
var CLR = CLR_bluprint;
// ====>> would be CONSTANTS <<==== // 
var C = {
   gridH:10,
   gridW:14,
   cell:40,
   border:2,
   spacing:6
};
$("body").css("background-color",CLR.bg)


// ** VARIABLES **
var grid = [];
var canv = document.getElementById("demoCanvas");
var ctx = canv.getContext("2d");
var isPlaying = false;


// adjust the canvas based on window size 
// and the number of squares that fit in
window.onresize = rszWindow;
function rszWindow() {
   canv.height = window.innerHeight;
   canv.width = window.innerWidth;
   setGridSize();
   canv.height = C.gridH * (C.cell + C.spacing);
   canv.width = C.gridW * (C.cell + C.spacing);
   canv.style.marginLeft = -canv.width/2;
   canv.style.marginTop = -canv.height/2;
   printGrid();
}

// size the grid dimensions based on canvas size
function setGridSize() {
  var space = C.spacing + C.cell;
  C.gridW = Math.floor(canv.width/space);
  C.gridH = Math.floor(canv.height/space);
  drawGrid();
}

// setup function: draws the grid
// also used for readjusting
function drawGrid() {
   var oldgrid = grid;
   grid = [];
   for(var i=0;i<C.gridW;i++) grid.push([]);
   for(var i=0;i<C.gridW;i++) {
      for(var j=0;j<C.gridH;j++) {
         if(i<oldgrid.length && j<oldgrid[i].length) {
            grid[i].push(oldgrid[i][j]); 
         } else {
            grid[i].push(false); 
            
         }
      }
   }
}


// mouse interactivity with game
var isMouseDown=false;
var mouseCellState=false;
function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

canv.addEventListener('mousedown', function(evt) {
   mouseCellState = clickflip(evt);
   isMouseDown = true;
} , false);


function clickflip(evt) {
   var mousePos = getMousePos(canv, evt);
   var space = C.spacing + C.cell;
   var gridX = Math.floor( mousePos.x / space );
   var gridY = Math.floor( mousePos.y / space );
   console.log("Click: ",gridX,gridY)

   grid[gridX][gridY] = !grid[gridX][gridY];
   drawone(gridX,gridY,grid[gridX][gridY]);
   return grid[gridX][gridY];
};

canv.addEventListener('mousemove', function(evt) {
   if(isMouseDown) {
      var mousePos = getMousePos(canv, evt);
      var space = C.spacing + C.cell;
      var gridX = Math.floor( mousePos.x / space );
      var gridY = Math.floor( mousePos.y / space );
      grid[gridX][gridY] = mouseCellState;
      drawone(gridX,gridY,grid[gridX][gridY]);
   }
   
});

canv.addEventListener("mouseup",function() {
   isMouseDown = false;
});

$(canv).keydown(function(evt) {
   console.log("Key Down");
   if(evt.keyCode == 32) { 
      isPlaying = !isPlaying;
      console.log("isPlaying: "+ isPlaying)
   } else if(evt.keyCode == 67) { // 'c' 
      grid = [];
      drawGrid();
   }
})

function drawone(x,y,isOn) {
   var space = C.spacing + C.cell;
   ctx.beginPath();
   if(isOn) {
      ctx.fillStyle = CLR.on;
      ctx.strokeStyle = CLR.onb;
   } else {
      ctx.fillStyle = CLR.bg;
      ctx.strokeStyle = CLR.offb;
   }
   ctx.lineWidth = C.border;
   ctx.fillRect((space*x)+(C.spacing/2),(space*y)+(C.spacing/2),C.cell,C.cell);
   ctx.rect((space*x)+(C.spacing/2),(space*y)+(C.spacing/2),C.cell,C.cell);
   ctx.stroke();
   ctx.closePath();

}

function printGrid() {
   ctx.fillStyle = CLR.bg;
   ctx.fillRect(0,0,canv.width,canv.height);


   var i, j, pi, pj;
   var space = C.spacing + C.cell;
   for(i = 0;i < C.gridW;i++) {
      pi = i * space;
      for(j = 0;j < C.gridH;j++) {
         pj = j * space;
         ctx.beginPath();

         if(grid[i][j]) {
            ctx.fillStyle = CLR.on;
            ctx.strokeStyle = CLR.onb;
         } else {
            ctx.fillStyle = CLR.bg;
            ctx.strokeStyle = CLR.offb;
         }


         ctx.lineWidth = C.border;
         ctx.fillRect(pi+(C.spacing/2),pj+(C.spacing/2),C.cell,C.cell);
         ctx.rect(pi+(C.spacing/2),pj+(C.spacing/2),C.cell,C.cell);
         ctx.stroke();
         ctx.closePath();
         
      }
   }
   
}



function init() {

   // Fill the grid
   rszWindow();
   drawGrid();
   printGrid(); 

   
    setInterval(function() {
       if(isPlaying){
          updateGrid();
          printGrid();
       }
    }, 1000);
    
   
}

// the rules of the game of life
function updateGrid() {
   var newgrid =[];
   var i,j;
   for(i=0;i<grid.length;i++) newgrid.push(grid[i].slice());
   for(i=0;i<C.gridW;i++) {
      for(j=0;j<C.gridH;j++) {
         if(grid[i][j]) {
            if(N(i,j)<2) {
               newgrid[i][j] = false;
               console.log("lonely death at "+i+","+j);
               console.log(N(i,j));
            }
            if(N(i,j)>3) {
               newgrid[i][j] = false;
               console.log("crowded death at "+i+","+j);
            }
         } else {
            if(N(i,j)==3){ 
               newgrid[i][j] = true;
               console.log("life at "+i+","+j);
            }
         }
      }}
   grid = newgrid;
}

function step() {
   updateGrid();
   printGrid();
}

//how many squares are getting lit
function N(x,y) {
   var n = 0;
   if(gridwrap(x+1,y+1)) n++;
   if(gridwrap(x+1,y)) n++;
   if(gridwrap(x+1,y-1)) n++;
   if(gridwrap(x,y+1)) n++;
   if(gridwrap(x,y-1)) n++;
   if(gridwrap(x-1,y+1)) n++;
   if(gridwrap(x-1,y)) n++;
   if(gridwrap(x-1,y-1)) n++;
   return n;
}

// returns locations wraped
function gridwrap(x,y) {
   if(x<0) x = C.gridW + x;
   else x = x % C.gridW;
   if(y<0) y = C.gridH + y;
   else y = y % C.gridH;
   return grid[x][y];
}
