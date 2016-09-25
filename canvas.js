// ** PARAMETERS for WEBSITE **
 
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
   on:"#ffffff",
   text:"#3399FF",
   lifed:"#005449"
};
var CLR = CLR_bluprint;

const SHOW_NUMBER_MINIMUM = 15;


// ====>> would be CONSTANTS <<==== // 
var C = {
   gridH:10,
   gridW:14,
   cell:10,
   border:1,
   spacing:2,
   delay:500
};
$("body").css("background-color",CLR.bg)
$("#toolbar li").not("#keybtn").click(function() {
   stepOnce = false;
   $("#popup").hide();
   popupup=false;
});


// ** VARIABLES **
var grid = [];
var savedGrid = [];
var canv = document.getElementById("demoCanvas");
var ctx = canv.getContext("2d");
var mainInterval;
var stepTimeout;

// booleans
var isPlaying = false;
var doWrap = true;
var showNumber = false;
var isMouseDown=false;
var mouseCellState=false;
var wasEdited=false;
var popupup=false;
var stepOnce=false;

// adjust the canvas based on window size 
// and the number of squares that fit in
window.onresize = rszWindow;
function rszWindow() {
   canv.height = window.innerHeight;
   canv.width = window.innerWidth;
   setGridSize();
   
   //trim grid based on cells that fit
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
   populateGrid();
}

// setup function: draws the grid
// also used for readjusting
function populateGrid() {
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
function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

canv.addEventListener('mousedown', function(evt) {
   // pretty ui things
   $("#popup").hide();
   popupup=false;
   stepOnce = false;
   if(!isPlaying) wasEdited = true;

   // actual mechanism
   mouseCellState = clickflip(evt);
   isMouseDown = true;
} , false);


function clickflip(evt) {
   var mousePos = getMousePos(canv, evt);
   var space = C.spacing + C.cell;
   var gridX = Math.floor( mousePos.x / space );
   var gridY = Math.floor( mousePos.y / space );
   //console.log("Click: ",gridX,gridY)

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
   if(showNumber && C.cell > SHOW_NUMBER_MINIMUM ) printGrid();
});

// ** KEY STROKES **
$(window).keydown(function(evt) {
   $("#popup").hide();
   var stepTemp = false;
   
   var key = String.fromCharCode(event.keyCode);
   
   if(evt.keyCode == 32) { // 'space' to start and stop 
      isPlaying = !isPlaying;
      if(isPlaying && wasEdited) saveGrid();  //save game for 'r' 
      if(!isPlaying) wasEdited = false;
      if(!$("#toolbar").is(":visible")) {
         cmessage(isPlaying?
                  '<span class="green">Play</span>':
                  '<span class="red">Stop</span>');
      }
   } else if( evt.keyCode == 67 || evt.keyCode == 27) {   // 'c' or 'esc' to clear board
      grid = [];
      populateGrid();
      printGrid();
      isPlaying = false;
      cmessage("Clear");
   }
   else if(evt.keyCode == 13) {   // 'enter' to step
      isPlaying = false;
      updateGrid();
      printGrid();
      if(!stepOnce) cmessage('Step');
      stepTemp = true;
      // return step message after 3 seconds
      window.clearTimeout(stepTimeout);
      stepTimeout = window.setTimeout(function() {
         stepOnce = false;
      }, 3000);
   }
   else if(evt.keyCode == 82) {   // 'r' to revert to last play
      isPlaying = false;
      wasEdited = false;
      grid = savedGrid;
      populateGrid();
      printGrid();
      cmessage("Revert");
   } 
   // 's' to capture a snippet and save it
   // 'l' to load a snippet
   else if(evt.keyCode == 84) { // 't' to toggle toolbar 
      $("#toolbar").toggle();
      cmessage("Toolbar",$("#toolbar").is(":visible"));
   }
   else if( evt.keyCode == 87) { // 'w' to toggle wrap
      doWrap = !doWrap;
      if(showNumber && C.cell > SHOW_NUMBER_MINIMUM ) printGrid();
      cmessage("Wrap",doWrap);
   }
   else if(event.keyCode == 90) { // 'z' for random
     isPlaying = false;
     wasEdited = true;
     grid = [];
     randomGrid();
     printGrid();
     cmessage("Random");
   }
   else if(evt.keyCode == 78) { // 'n' for number touching
      
      showNumber = !showNumber;
      printGrid();
      cmessage("N-Adjacent", showNumber);
   }
   else if(/[a-zA-Z0-9]/.test(key)) { // 'k' (or anything else) to show help menu
      if(!popupup) $("#popup").show();
   }
   // 'g' for ground covered
   // '-' and '='/'+' to go be bigger or smaller
   // '<' and '>' to go slower or faster
   
   
   adjustPlayButton();
   popupup = $("#popup").is(":visible");
   stepOnce = stepTemp;
})

function cmessage(message,onword) {
   $("#message").remove();
   if(arguments.length==2) message += onword?
      ' <span class="green">on</span>':
      ' <span class="red">off</span>';
      $(canv).after('<div id="message">'+message+"</div>");
   $("#message").fadeOut(800);
}

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

// actualy draw the grid with canvas elements
function printGrid() {
   ctx.fillStyle = CLR.bg;
   ctx.fillRect(0,0,canv.width,canv.height);


   var i, j, pi, pj;
   var space = C.spacing + C.cell; // how much space is  
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
         
         if(showNumber && C.cell > SHOW_NUMBER_MINIMUM ) {
            var num = N(i,j)
            
            // the color of the number will be the same as the border
            // the color of the numbers will forshadow the future state of the cell
            if(grid[i][j]) {
               if(num==2 || num==3) ctx.fillStyle = CLR.onb;
               else ctx.fillStyle = CLR.offb;
            } else {
               if(num==3) ctx.fillStyle = CLR.onb;
               else ctx.fillStyle = CLR.offb;
            }
            
            ctx.font = ( C.cell * 2/3 ) + "px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            
            if(num>0 || grid[i][j]) ctx.fillText(num,pi+(C.spacing/2)+(C.cell/2),pj+(C.spacing/2)+(C.cell/2));
         }
         
      }
   }
}

function saveGrid() {
   savedGrid=[];
   for(var i=0;i<grid.length;i++) savedGrid.push(grid[i].slice());
}


function init() {
   // Fill the grid
   changeSpeed();
   changeSize();
   rszWindow();
}
function intervalFunc() {
    if(isPlaying){
       updateGrid();
       printGrid();
    }
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
            }
            if(N(i,j)>3) {
               newgrid[i][j] = false;
            }
         } else {
            if(N(i,j)==3){ 
               newgrid[i][j] = true;
            }
         }
      }}
   grid = newgrid;
}

function step() {
   console.log("tick");
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
   if(x<0) if(doWrap) x = C.gridW + x;
           else return false;
   else if(x>=C.gridW && !doWrap) return false;
   else x = x % C.gridW;
   if(y<0) if(doWrap) y = C.gridH + y;
           else return false;
   else if(y>=C.gridH && !doWrap) return false;
   else y = y % C.gridH;
   return grid[x][y];
}

$("#playbtn").click(function() {
   if(!isPlaying && wasEdited) saveGrid();
   if(isPlaying) wasEdited = false;
   isPlaying = !isPlaying;
   adjustPlayButton();

})

$("#stepbtn").click(function() {
   updateGrid();
   printGrid();
});

$("#keybtn").click(function() {
   $("#popup").toggle();
})

var playClass = "fa fa-play";
var pauseClass = "fa fa-pause";
function adjustPlayButton() {
   if(isPlaying) {
      $("#playbtn i").attr("class",pauseClass);
      $("#playbtn").addClass("running");
   } else {
      $("#playbtn i").attr("class",playClass);
      $("#playbtn").removeClass("running");
   }
}

//speed slider
$("#speedSlider").on('input',changeSpeed);
function changeSpeed() {
   C.delay = 10 * (100-$("#speedSlider").val());
   clearInterval(mainInterval);
   mainInterval = setInterval(intervalFunc,C.delay);
}

//size slider
$("#sizeSlider").on('input',changeSize);
function changeSize() {
   var val = $("#sizeSlider").val();
   C.cell = Math.floor(val * 0.8 + 5);
   spacBord();
   rszWindow();
}

function spacBord() {
   if(C.cell < 15) {
      C.border = 1;
      C.spacing = 3;
   } else if(C.cell < 34) {
      C.border = 2;
      C.spacing = 4;
   } else if(C.cell < 60){
      C.border = 4;
      C.spacing = 8;
   } else {
      C.border = 6;
      C.spacing = 10;
   }
   //C.spacing = Math.floor(C.spacing);
   //C.border = Math.floor(C.border);
}

function randomGrid() {
   var oldgrid = grid;
   var flip;
   grid = [];
   
   for(var i=0;i<C.gridW;i++) grid.push([]);
   for(var i=0;i<C.gridW;i++) {
      for(var j=0;j<C.gridH;j++) {
        flip = Math.random();
        if(flip < .5) {
          grid[i].push(false); 
        }
        else {
          grid[i].push(true); 
        }
      }
   }
}

//functions to draw a selection square and cover it up
function drawMarq(sq1x,sq1y,sq2x,sq2y) {
   var px  
   var py  
   var lx  
   var ly
}

function coverMarq(sq1x,sq1y,sq2x,sq2y) {
   
}

