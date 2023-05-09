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

	for (var cat in data) {
		// Create sections
		var section = document.createElement("section");
		section.className = "category";
		document.body.append(section);

		// Section Header
		var header = document.createElement("header")
		header.className = "header"
		header.textContent = cat
		header.addEventListener("click", function () {
			this.parentElement.toggleAttribute("collapsed")
		});

		// -> Progress
		var progress = document.createElement('div')
		progress.className = 'progress'
		header.append(progress)
		section.append(header)

		// Create entries
		for (var ent in data[cat]) {
			// Create entry
			var entry = document.createElement("div");
			entry.className = "entry";
			entry.setAttribute("achievement", ent)
			if (data[cat][ent].group) {
				entry.setAttribute("group", data[cat][ent].group)
			}

			// Check if completed
			if (storage && storage.includes(ent)) {
				entry.setAttribute("checked", "")
			}

			// Sync OnClick
			entry.addEventListener("click", function () {
				if (!this.hasAttribute('blocked')) {
					this.toggleAttribute("checked");
					updateGroups()
					syncStorage(this.getAttribute("achievement"))
				}
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
				if (data[cat][ent].bugged) {
					comment.setAttribute('bugged', '')
				}
				description.append(comment)
			}

			entry.append(description);

			// Jade Reward
			var jades = document.createElement('div')
			jades.className = 'jades'
			jades.textContent = data[cat][ent].jades || '??'
			entry.append(jades)

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

	// Filter group exclusivity
	updateGroups()

	// Trigger progress update
	updateProgress()
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

	// Trigger progress update
	updateProgress()
}

function updateGroups() {
	var groupEntries = document.querySelectorAll('[group]')

	// Collect checked groups
	var blockedGroups = []
	var excludedKeys = []
	for (var i = 0; i < groupEntries.length; i++) {
		if (groupEntries[i].hasAttribute('checked')) {
			// Add group
			blockedGroups.push(groupEntries[i].getAttribute('group'))
			// Add excluded keys
			excludedKeys.push(groupEntries[i].getAttribute('achievement'))
		}
	}

	// Update group state
	for (var i = 0; i < groupEntries.length; i++) {
		if (blockedGroups.includes(groupEntries[i].getAttribute('group')) && !excludedKeys.includes(groupEntries[i].getAttribute('achievement'))) {
			groupEntries[i].setAttribute('blocked', '')
		} else {
			groupEntries[i].removeAttribute('blocked')

		}
	}
}

function updateProgress() {
	// Update progress counters
	var counters = document.getElementsByClassName('progress')
	for (var i = 0; i < counters.length; i++) {
		var cat = counters[i].parentElement.parentElement

		// Progress
		var entryChecked = cat.querySelectorAll('.entry[checked]').length || 0
		var entryTotal = cat.querySelectorAll('.entry:not([blocked])').length

		counters[i].textContent = '(' + entryChecked + '/' + entryTotal + ')'
	}
}

function filterSearch(key) {
	var entryList = document.getElementsByClassName('entry')
	var catList = document.getElementsByClassName('category')

	if (key.value != '') {
		for (var i = 0; i < entryList.length; i++) {
			// Get context data
			if (isNaN(key.value)) {
				// Check by title/description
				var checkKey = key.value.toLowerCase()
				var checkData = entryList[i].getElementsByClassName('title')[0].textContent.toLowerCase() +
					entryList[i].getElementsByClassName('description')[0].textContent.toLowerCase()
			} else {
				// Check by version
				checkData = entryList[i].getElementsByClassName('version')[0].textContent
			}

			// Filter entries
			if (checkData.includes(checkKey)) {
				entryList[i].style.display = ''
				entryList[i].parentElement.setAttribute("searchable", "")
			} else {
				entryList[i].style.display = 'none'
			}
		}
	} else {
		// Remove searchable tags
		for (var i = 0; i < catList.length; i++) {
			catList[i].removeAttribute("searchable")
		}

		for (var i = 0; i < entryList.length; i++) {
			entryList[i].style.display = ''
		}
	}
}

function toggleFilter(el) {
	if (el.textContent == 'Show: All') {
		el.textContent = 'Show: Incomplete'
	} else {
		el.textContent = 'Show: All'
	}
	document.body.toggleAttribute('filtered')
}