
function upload(file) {
    var form = new FormData(),
        xhr = new XMLHttpRequest();
 
    form.append('image', file);
    xhr.open('post', 'server.php', true);
    xhr.send(form);
  }
 
  function drawOnCanvas(file) {
    var reader = new FileReader();
    reader.onload = function (e) {
      var dataURL = e.target.result,
          c = document.querySelector('canvas'), // see Example 4
          ctx = c.getContext('2d'),
          img = new Image();
 
      img.onload = function() {
        c.width = img.width;
        c.height = img.height;
        ctx.drawImage(img, 0, 0);
      };
 
      img.src = dataURL;
    };
 
    reader.readAsDataURL(file);
  }
 
  function displayAsImage(file) {
    var imgURL = URL.createObjectURL(file),
        img = document.createElement('img');
 
    img.onload = function() {
      URL.revokeObjectURL(imgURL);
    };
 
    img.src = imgURL;
    document.body.appendChild(img);
  }

  function showImage() {

    var input = document.querySelector('input[type=file]'); // see Example 4
    input.onchange = function () {
    var file = input.files[0];
//    //upload(file);
    drawOnCanvas(file);   // see Example 6
//      displayAsImage(file); // see Example 7
    };

  }

  		// reduziere auf Ganzzahl zwischen 0 und 255
      function byteRange(a) {
				if (a > 255) {
					a = 255;
				}
				if (a < 0) {
					a = 0;
				}
				return Math.floor(a);
      }

      function colorRange(a) {
				if (a > 360) {
					a = a - 360;
				}
				if (a < 0) {
					a = a + 360;
				}
				return Math.floor(a);
      }

      function resizeCanvas(nsizex,nsizey) {
        var imgMod, x, y, r, g, b, a, l, offset, ix, iy, newset
        var img = new Image();
        var canvas = document.getElementById("myCanvasPic");
        var ctx = canvas.getContext("2d");
        img.height = canvas.height;
        img.width = canvas.width;
        var imgData = ctx.getImageData(0, 0, img.width, img.height);
        var imgMod = ctx.createImageData(nsizex, nsizey);
        for (x = 0; x < nsizex; x++) {
          for (y = 0; y < nsizey; y++) {
            ix = Math.floor(x*imgData.width/nsizex)
            iy = Math.floor(y*imgData.height/nsizey)  
            offset = (imgData.width * iy + ix) * 4;
            r = imgData.data[offset]; // rot
            g = imgData.data[offset + 1]; // grün
            b = imgData.data[offset + 2]; // blau
            a = imgData.data[offset + 3]; // Transparenz 
            newset = (nsizex * y + x) * 4;
            imgMod.data[newset] = byteRange(r);
            imgMod.data[newset + 1] = byteRange(g);
            imgMod.data[newset + 2] = byteRange(b);
            imgMod.data[newset + 3] = byteRange(a);
          }
        }
        ctx.clearRect(0, 0, img.width, img.height);
        canvas.width = nsizex;
        canvas.height = nsizey;
        ctx.putImageData(imgMod, 0, 0);

        createSpec(nsizex,nsizey); 

        }

//
//  function to build the spectra
          function createSpec(nsizex,nsizey) {
            var imgMod, x, y, r, g, b, a, l, offset, ix, iy, newset
            var lammax = 300;  // max color angle according hsv colorspace
            var lambmax = 0;
//
//  the color angle from 0 (red) to 300 (blue/violet) is roughly the wavelength between 700 and 400 nm
//  (polynom-fit third order)            
            var specval = new Array(lammax); lambda = new Array(lammax)
            for (ix = 0; ix < lammax+1; ix++) {
              specval[ix] = 0;
//              lambda[ix] = 700*(-1.116*(ix/lammax)*(ix/lammax)*(ix/lammax)+1.938*(ix/lammax)*(ix/lammax)-1.251*(ix/lammax)+1);              
              lambda[ix] = 700*(-1.20*(ix/lammax)*(ix/lammax)*(ix/lammax)+2.00*(ix/lammax)*(ix/lammax)-1.25*(ix/lammax)+1);              

              //                lambda[ix] = 700 - ix;
            }
            var sumspec = 0, lsumspec = 0, coltemp = 0, colsum = 0;
            var img = new Image();
            var canpic = document.getElementById("myCanvasPic");
            var ctxp = canpic.getContext("2d");
            img.height = canpic.height;
            img.width = canpic.width;
            var canspec = document.getElementById("myCanvasSpec");
            var ctxs = canspec.getContext("2d");
            var imgData = ctxp.getImageData(0, 0, img.width, img.height);
            var imgMod = ctxs.createImageData(nsizex, nsizey);
            for (ix = 0; ix < img.width; ix++) {
              for (iy = 0; iy < img.height; iy++) { 
                offset = (imgData.width * iy + ix) * 4;
                r = imgData.data[offset]/255; // rot
                g = imgData.data[offset + 1]/255; // grün
                b = imgData.data[offset + 2]/255; // blau
                a = imgData.data[offset + 3]; // Transparenz 
//
// look for the highets na lowest r,g,b values                
                hmax = r;
                hmin = r;
                seg = "r";
                if (g > hmax) {
                    hmax = g;
                    seg = "g";
                } 
                if (b > hmax) {
                    hmax = b;
                    seg = "b";
                }               
                if (g < hmin) {
                    hmin = g;
                } 
                if (b < hmin) {
                    hmin = b;
                }              
//
//  calculate the hsv-color angle according wikipedia https://de.wikipedia.org/wiki/HSV-Farbraum         
                if (hmax > hmin) {                 
                  if (seg == "r") {
                    x = colorRange(60*(0+(g-b)/(hmax-hmin)))
                  }
                  if (seg == "g") {
                    x = colorRange(60*(2+(b-r)/(hmax-hmin)))
                  }            
                  if (seg == "b") {
                    x = colorRange(60*(4+(r-g)/(hmax-hmin)))
                  }
                  y = Math.floor(hmax*nsizey);   
                  specval[x] = specval[x] + hmax;
                }
//
//  in the case of white/gre< light add values to all color angles 
                if (hmax == hmin) {
                  for (jx = 0; jx < lammax+1; jx++) {
                    specval[jx] = specval[jx] + hmax/lammax ;
                  }
                }

              }
            }
//
// normalize the values to 0...1            
            maxs = 0;
            for (ix = 0; ix < lammax+1; ix++) {
              if (specval[ix] > maxs) {
                maxs = specval[ix];
                lambmax = lambda[ix];
              }
            }
//
//  calculate the intensity per color angle             
            for (gx = 0; gx < nsizex; gx++) {
              ix = Math.round(gx/nsizex*lammax)
              specval[ix] = Math.sqrt(specval[ix]/maxs);
              hseg = Math.floor(ix/60);
              fseg = ix/60 - hseg;
              qval = 1-fseg;
              tval = fseg;
//
//  Segment 0..60 Grad (red)
              if (hseg == 0) {
                r = 1;
                g = tval;
                b = 0;
              }
//
//  Segment 60..120 Grad (yellow)              
              if (hseg == 1) {
                r = qval;
                g = 1;
                b = 0;
              }
//
//  Segment 120..180 Grad (green)              
              if (hseg == 2) {
                r = 0;
                g = 1;
                b = tval;
              }
//
//  Segment 180..240 Grad (cyan)                
              if (hseg == 3) {
                r = 0;
                g = qval;
                b = 1;
              }
//
//  Segment 240..3000 Grad (blue)               
              if (hseg == 4) {
                r = tval;
                g = 0;
                b = 1;
              }
//
//  Segment 300..360 Grad (violet-purple) - not relevant for light sprctra               
              if (hseg == 5) {
                r = 1;
                g = 0;
                b = qval;
              }
//
// calculate the center of the wavelength
              sumspec = sumspec + specval[ix]*specval[ix];
              lsumspec = lsumspec + specval[ix]*specval[ix]*lambda[ix];
//
// determine/estimate the color temperature accoridng to the CIE Normtafel
              if (r > 0) { 
                  ra = r/(r+g+b);
                  if (ra > 0.25) {
                    if (ra < 0.65) {
                  colsum = colsum + specval[ix]*specval[ix];
                  coltemp =  coltemp + specval[ix]*specval[ix]*310/Math.pow(ra,2.8);
 //                 console.log(ra,310/Math.pow(ra,2.8),specval[ix]*specval[ix]);
              }
            }
            }
              

              for (iy = 0; iy < Math.floor(specval[ix]*nsizey); iy++) {
                newset = (nsizex * (nsizey-iy) + gx) * 4;
                imgMod.data[newset] = byteRange(r*255);
                imgMod.data[newset + 1] = byteRange(g*255);
                imgMod.data[newset + 2] = byteRange(b*255);
                imgMod.data[newset + 3] = byteRange(255);
              }
            }


  //          ctxp.clearRect(0, 0, img.width, img.height);
            canspec.width = nsizex;
            canspec.height = nsizey;
            ctxs.putImageData(imgMod, 0, 0);
//            console.log (specval, lambda, lsumspec/sumspec, coltemp/colsum);

            coltemp = coltemp/colsum;
            lambavg = lsumspec/sumspec;
            txtout("max = "+form(lambmax,0)+" nm","c_lambmax");
            txtout("Temp = "+form(coltemp,0)+" K","c_coltemp");
            txtout("avg = "+form(lambavg,0)+" nm","c_lambavg");            
            if (coltemp < 3300) {
              txtout("Warm White","c_tempname");
            }
            if (coltemp > 3300) {
              if (coltemp < 5300) {
                txtout("Neutral White","c_tempname");
              }
            }
            if (coltemp > 5300) {
              txtout("Cold White","c_tempname");
            }
            

            }


      
      function applyChange(getChange) {
        var imgMod, x, y, r, g, b, a, l, offset, ix, iy, v;
        var img = new Image();
        var canvas = document.getElementById("myCanvasPic");
        var ctx = canvas.getContext("2d");
        img.height = canvas.height;
        img.width = canvas.width;
        var imgData = ctx.getImageData(0, 0, img.width, img.height);
        var imgMod = ctx.createImageData(img.width, img.height);
        if (getChange == "Nichts") {
                // do nothing
                console.log ("Width, Height",img.width,img.height);
        }

        if (getChange == "Invert") {
            for (x = 0; x < imgData.width; x++) {
                for (y = 0; y < imgData.height; y++) {
                    offset = (imgData.width * y + x) * 4;
                    r = imgData.data[offset]; // rot
                    g = imgData.data[offset + 1]; // grün
                    b = imgData.data[offset + 2]; // blau
                    a = imgData.data[offset + 3]; // Transparenz
                    l = 0.299 * r + 0.587 * g + 0.114 * b; // (NTSC-Standard für Luminanz)
                    imgMod.data[offset] = byteRange(255 - r);
                    imgMod.data[offset + 1] = byteRange(255 - g);
                    imgMod.data[offset + 2] = byteRange(255 - b);
                    imgMod.data[offset + 3] = byteRange(a);
                }
              }
              ctx.putImageData(imgMod, 0, 0);
            }

            if (getChange == "Pseudo") {
              for (x = 0; x < imgData.width; x++) {
                  for (y = 0; y < imgData.height; y++) {
                      offset = (imgData.width * y + x) * 4;                    
                      r = imgData.data[offset]; // rot
                      g = imgData.data[offset + 1]; // grün
                      b = imgData.data[offset + 2]; // blau
                      a = imgData.data[offset + 3]; // Transparenz
                      l = 0.299 * r + 0.587 * g + 0.114 * b; // (NTSC-Standard für Luminanz)
                      v = g;
                      ix = Math.floor(v*imgData.width/255);
                      iy = imgData.height-Math.floor((r+g+b)*imgData.height/255/3);
                      newset = (imgData.width * iy + ix) * 4;
                      imgMod.data[newset] = byteRange(r);
                      imgMod.data[newset + 1] = byteRange(g);
                      imgMod.data[newset + 2] = byteRange(b);
                      imgMod.data[newset + 3] = byteRange(a);
                  }
                }
                ctx.putImageData(imgMod, 0, 0);
                console.log (ix,iy,v,l);
              }   
      }



//
// Formatting text output
function txtout(txtstr,elemstr) {
  var nxtline = document.createElement('br');
  var element = document.getElementById(elemstr).appendChild(nxtline); 
  var wrtline = document.createTextNode(txtstr);
  var element = document.getElementById(elemstr).appendChild(wrtline);
  }

  //
// Power-Function
function power(x, z) {
  var y;
  y = Math.pow(x, z);
  return y;
}
  
//
// Formatting Number
function form(x, z) {
  var y;
  x = Math.round(x * power(10, z));
  y = x / power(10, z);
  return y;
}


function getInfo() {
  alert('The WebApp estimates the visible spectra of an image. It converts the image in a canvas, anlyzes' + 
         ' the rgb values and convert it into the HVS-Colorspace. The spectra is plotted from 700nm (red) to ' +
         ' 380nm (violet). The maximun and avergae wavelength and the color temperature is estimated. \n \n' + 
         'Useful infos can be find here: \n ' + 
         'https://de.wikipedia.org/wiki/HSV-Farbraum \n' +
         'https://de.wikipedia.org/wiki/CIE-Normvalenzsystem' );
}


function getHelp() {
  alert('1. Make an Image bei "Datei auswählen" \n' + 
         '2. Press "Settings" to resize and anlyze the spectra  \n' +
         '3. Press "Catalog" to print the spectra \n' +
         '4. Press "About" for a short explanation. \n' +
         '5. Press "Help" for this info. \n ' +
         '6. Press "Home" to reload the webApp. \n' +
         ' \n' +
         'Known Bugs: \n' +
         'If the ios-camera is frozen, delete the WebApp from the background cache and restart.'); 
}


// Useful webpages
// https://de.wikipedia.org/wiki/Flammenf%C3%A4rbung
// https://de.wikipedia.org/wiki/HSV-Farbraum
// https://de.wikipedia.org/wiki/Farbtemperatur
// https://de.wikipedia.org/wiki/CIE-Normvalenzsystem
