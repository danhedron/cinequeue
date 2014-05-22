function updatePlayer() {
	var req = new XMLHttpRequest();
	req.onload = function () {
		document.getElementById( 'playing' ).outerHTML = this.response;
	};
	req.open( 'GET', '/playlist/playing' );
	req.send();
	setTimeout( updatePlayer, 1000 );
}

updatePlayer();
