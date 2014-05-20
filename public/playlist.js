function updateQueue() {
	var req = new XMLHttpRequest();
	req.onload = function () {
		document.getElementById( 'queue' ).innerHTML = this.response;
	};
	req.open( 'GET', 'queue' );
	req.send();
	setTimeout( updateQueue, 1000 );
}

function toggleFlash() { // might be worth doing this on every page?
	document.getElementById( 'messages' ).classList.toggle( 'closed' );
}

function start() {
	updateQueue();
	setTimeout( toggleFlash, 2000 );
}
window.onload = start;
