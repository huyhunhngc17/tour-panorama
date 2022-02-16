$(".btn").click(function () {
	$(".input").toggleClass("active").focus;
	$(this).toggleClass("animate");
	$(".input").val("");
});

$(document).ready(function () {
	$(".primaryContained").on('click', function () {
		var content = $("#input-comment").val();
		var today = new Date();
		var dd = String(today.getDate()).padStart(2, '0');
		var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
		var yyyy = today.getFullYear();
		today = mm + '/' + dd + '/' + yyyy + " " + msToTime(today.getTime());
		var userName = "Anonymous";
		$(".comment").addClass("commentClicked");
		addComment({ content: content, today: today, user: userName })

	});
	$("textarea").on('keyup.enter', function () {
		$(".comment").addClass("commentClicked");
	});
});

function onShowCommentTab() {
	location.href='#comment-modal';
}

function isEmpty(str) {
	return (!str || str.length === 0);
}

function msToTime(duration) {
	var seconds = Math.floor((duration / 1000) % 60),
		minutes = Math.floor((duration / (1000 * 60)) % 60),
		hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
	hours = (hours < 10) ? "0" + hours : hours;
	minutes = (minutes < 10) ? "0" + minutes : minutes;

	return hours + ":" + minutes;
}

function loadComments() {

}

function addComment(comment) {
	if (!isEmpty(comment.content)) {
		$("#comment-list").prepend(`<div class="timeline-item-description"><i class="avatar | small">
		<img src="https://assets.codepen.io/285131/hat-man.png" /></i>
		<span><b class="b-text">${comment.user}</b> <i class="i-text">commented on </i><u class="b-text">${comment.today}</u></span></div>
		<button class="button-38">${comment.content}</button>`);
		$("#input-comment").val('')
	}
}