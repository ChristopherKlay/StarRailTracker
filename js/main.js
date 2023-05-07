// Setup
loadAchievements();

// Fetch database
function loadAchievements() {
	fetch("https://raw.githubusercontent.com/ChristopherKlay/StarRailTracker/main/import/achievements.json")
		.then((response) => response.json())
		.then((data) => createEntries(data));
}

// Create Entries
function createEntries(data) {
	// Check userdata
	if (localStorage.getItem("userdata")) {
		// Load storage
		var storage = localStorage.getItem("userdata").split(",")
	} else {
		// Create storage
		localStorage.setItem("userdata", "")
	}

	console.log(data)

	for (var cat in data) {
		// Create sections
		var section = document.createElement("section");
		section.className = "category";
		document.body.append(section);

		// Section Header
		var header = document.createElement("header")
		header.className = "header"
		header.textContent = cat

		// Progress Bar
		var progress = document.createElement('div')
		progress.className = 'progress'
		header.append(progress)
		section.append(header)

		// Create entries
		for (var ent in data[cat]) {
			var entry = document.createElement("div");
			entry.className = "entry";
			entry.setAttribute("achievement", ent)

			// Check if completed
			if (storage && storage.includes(ent)) {
				entry.setAttribute("checked", "")
			}

			// Sync OnClick
			entry.addEventListener("click", function () {
				this.toggleAttribute("checked");
				syncStorage(this.getAttribute("achievement"))
			});

			// Checkbox
			var check = document.createElement("img");
			entry.append(check);

			// Title
			var title = document.createElement("div");
			title.className = "title";
			title.title = data[cat][ent].title;
			title.textContent = data[cat][ent].title;
			entry.append(title);

			// Description
			var description = document.createElement("div");
			description.className = "description";
			description.textContent = data[cat][ent].description

			// -> Comment
			if (data[cat][ent].comment) {
				var comment = document.createElement('div')
				comment.className = "comment"
				comment.textContent = data[cat][ent].comment
				description.append(comment)
			}

			entry.append(description);

			// Version
			var version = document.createElement("div");
			version.className = "version";
			version.title = "Available since Version " + data[cat][ent].version.toFixed(1)
			version.textContent = data[cat][ent].version.toFixed(1);
			entry.append(version);

			// Append generated entry
			section.append(entry);
		}
	}
}

function syncStorage(id) {
	// Update existing storage
	var storage = localStorage.getItem("userdata").split(",")
	if (storage.includes(id)) {
		for (var i = storage.length - 1; i >= 0; i--) {
			if (storage[i] == id) {
				storage.splice(i, 1);
			}
		}
	} else {
		storage.push(id)
	}

	// Push to storage
	localStorage.setItem("userdata", storage.toString())
}