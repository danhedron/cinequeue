function start() {
	updateQueue();
	setTimeout( start, 1000 );
}


function updateQueue() {
	var req = new XMLHttpRequest();
	req.onload = function () {
		document.getElementById( 'queue' ).innerHTML = this.response;
	}
	console.log( 3 );
	req.open( 'GET', 'queue' );
	req.send();
}
window.onload = start;
