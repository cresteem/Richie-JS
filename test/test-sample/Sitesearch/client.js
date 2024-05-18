function search() {
	// Get the search term from the input field
	var searchTerm = document.getElementById("searchTerm").value;

	// Send the search term to the server using AJAX
	var xhr = new XMLHttpRequest();
	xhr.open("POST", "./server.php", true);
	xhr.setRequestHeader(
		"Content-Type",
		"application/x-www-form-urlencoded",
	);
	xhr.onreadystatechange = function () {
		if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
			// Display the result from the server
			document.getElementById("result").innerHTML = xhr.responseText;
		}
	};
	xhr.send("searchTerm=" + encodeURIComponent(searchTerm));

	// Prevent the form from submitting in the traditional way
	return false;
}
