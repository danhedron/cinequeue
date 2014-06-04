// courtesy of http://www.webcitation.org/6Nx2CrAUF
function addOnloadHook( func ) {
  var oldonload = window.onload;
  if ( typeof window.onload !== 'function' ) {
    window.onload = func;
  } else {
    window.onload = function () {
      if ( oldonload ) {
        oldonload();
      }
      func();
    };
  }
}
