console.log("SCRIPT VERSION 2");
(function () {
	var root = document.getElementById('aap-widget');
	if (!root) return;

	var apiUrl = "/api/chat";

	var intro = document.getElementById('aap-intro');
	var vibeGrid = document.getElementById('aap-vibe-grid');
	var uploadLabel = root.querySelector('.aap-upload-label');
	var fileInput = document.getElementById('aap-file-input');
	var previewWrap = document.getElementById('aap-preview');
	var previewImg = document.getElementById('aap-preview-img');
	var previewRemove = document.getElementById('aap-preview-remove');
	var thread = document.getElementById('aap-thread');
	var itineraryEl = document.getElementById('aap-itinerary');
	var textarea = document.getElementById('aap-textarea');
	var sendBtn = document.getElementById('aap-send');
	var resetBtn = document.getElementById('aap-reset');
	var loader = document.getElementById('aap-loader');
	var loaderText = document.getElementById('aap-loader-text');

	var history = [];
	var pendingImage = null;
	var busy = false;

	var LOADER_PHRASES = ['Charting your route…', 'Checking the tide tables…', 'Mapping the coastline…', 'Plotting your stops…'];

	function el(tag, className, text) {
		var node = document.createElement(tag);
		if (className) node.className = className;
		if (text !== undefined && text !== null) node.textContent = text;
		return node;
	}

	function scrollThreadToBottom() {
		thread.scrollTop = thread.scrollHeight;
	}

	function autoGrow() {
		textarea.style.height = 'auto';
		textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
	}
	textarea.addEventListener('input', autoGrow);

	function setBusy(state) {
		busy = state;
		sendBtn.disabled = state;
		textarea.disabled = state;
		if (state) {
			loaderText.textContent = LOADER_PHRASES[Math.floor(Math.random() * LOADER_PHRASES.length)];
			loader.hidden = false;
		} else {
			loader.hidden = true;
		}
	}

	vibeGrid.addEventListener('click', function (e) {
		var btn = e.target.closest('.aap-vibe-btn');
		if (!btn) return;
		Array.prototype.forEach.call(vibeGrid.querySelectorAll('.aap-vibe-btn'), function (b) {
			b.classList.toggle('is-selected', b === btn);
		});
		sendMessage('I love the "' + btn.dataset.vibe + '" vibe — plan a trip around that.');
	});

	uploadLabel.addEventListener('keydown', function (e) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			fileInput.click();
		}
	});

	fileInput.addEventListener('change', function () {
		var file = fileInput.files && fileInput.files[0];
		if (!file) return;
		if (file.size > 6 * 1024 * 1024) {
			addMessage('error', "That photo's a little large — try one under 6MB.");
			fileInput.value = '';
			return;
		}
		var reader = new FileReader();
		reader.onload = function () {
			pendingImage = reader.result;
			previewImg.src = pendingImage;
			previewWrap.hidden = false;
		};
		reader.readAsDataURL(file);
	});

	previewRemove.addEventListener('click', function () {
		pendingImage = null;
		fileInput.value = '';
		previewWrap.hidden = true;
	});

	sendBtn.addEventListener('click', function () {
		var text = textarea.value.trim();
		if (!text && !pendingImage) return;
		sendMessage(text);
	});

	textarea.addEventListener('keydown', function (e) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			sendBtn.click();
		}
	});

	resetBtn.addEventListener('click', function () {
		history = [];
		pendingImage = null;
		fileInput.value = '';
		previewWrap.hidden = true;
		thread.innerHTML = '';
		itineraryEl.hidden = true;
		itineraryEl.innerHTML = '';
		intro.hidden = false;
		resetBtn.hidden = true;
		Array.prototype.forEach.call(vibeGrid.querySelectorAll('.aap-vibe-btn'), function (b) {
			b.classList.remove('is-selected');
		});
	});

	function addMessage(kind, text) {
		var cls = kind === 'user' ? 'aap-msg-user' : (kind === 'error' ? 'aap-msg-error' : 'aap-msg-assistant');
		thread.appendChild(el('div', 'aap-msg ' + cls, text));
		scrollThreadToBottom();
	}

	function sendMessage(text) {
		if (busy) return;
		if (text) addMessage('user', text);

		var formData = new FormData();
        formData.append('message', text || '');
formData.append('history', JSON.stringify(history));

if (pendingImage) {
    formData.append('image', pendingImage);
}

		intro.hidden = true;
		textarea.value = '';
		autoGrow();
		setBusy(true);

		var controller = new AbortController();
		var timeoutId = setTimeout(function () { controller.abort(); }, 100000);

		fetch(apiUrl, {
    method: 'POST',
    body: formData,
    signal: controller.signal
})
			.then(function (res) { return res.json(); })
			.then(function (json) {
				clearTimeout(timeoutId);
				setBusy(false);
				if (!json || !json.success) {
var msg =
    (json && json.message) ||
    'Something went wrong. Please try again.';
    					addMessage('error', msg);
					return;
				}
var itinerary = json.itinerary;

history.push({
    role: 'user',
    content: text || (pendingImage ? 'Plan a trip inspired by this photo.' : '')
});

history.push({
    role: 'assistant',
    content: json.assistant_raw
});				pendingImage = null;
				fileInput.value = '';
				previewWrap.hidden = true;

				if (itinerary.assistant_reply) {
					addMessage('assistant', itinerary.assistant_reply);
				}
				renderItinerary(itinerary);
				resetBtn.hidden = false;
			})
			.catch(function (err) {
				clearTimeout(timeoutId);
				setBusy(false);
				if (err && err.name === 'AbortError') {
					addMessage('error', "That's taking longer than expected — the planner may be busy. Please try again.");
				} else {
					addMessage('error', "Couldn't reach the planner — check your connection and try again.");
				}
			});
	}

	function renderItinerary(data) {
		itineraryEl.innerHTML = '';
		itineraryEl.hidden = false;

		itineraryEl.appendChild(el('h3', 'aap-trip-title', data.trip_title || ''));
		itineraryEl.appendChild(el('p', 'aap-vibe-match', data.vibe_match || ''));

		if (Array.isArray(data.ui_tags) && data.ui_tags.length) {
			var tagWrap = el('div', 'aap-tags');
			data.ui_tags.forEach(function (t) { tagWrap.appendChild(el('span', 'aap-tag', t)); });
			itineraryEl.appendChild(tagWrap);
		}

		if (data.route_map) {
			itineraryEl.appendChild(el('p', 'aap-section-label', '🗺️ The Route Map'));
			var grid = el('div', 'aap-route-grid');
			[['Start', data.route_map.start], ['End', data.route_map.end], ['Drive time', data.route_map.drive_time], ['Crossings', data.route_map.crossings]].forEach(function (f) {
				var cell = el('div');
				cell.appendChild(el('span', null, f[0]));
				cell.appendChild(document.createTextNode(f[1] || '—'));
				grid.appendChild(cell);
			});
			itineraryEl.appendChild(grid);
		}

		if (Array.isArray(data.destination_stays) && data.destination_stays.length) {
			itineraryEl.appendChild(el('p', 'aap-section-label', '🏨 Destination Stays'));
			data.destination_stays.forEach(function (stay) {
				var row = el('div', 'aap-stay');
				var left = el('div');
				left.appendChild(el('strong', null, stay.name || ''));
				left.appendChild(document.createElement('br'));
				left.appendChild(document.createTextNode(stay.style || ''));
				row.appendChild(left);
				row.appendChild(el('span', 'aap-stay-nights', stay.nights + ' night' + (stay.nights === 1 ? '' : 's')));
				itineraryEl.appendChild(row);
			});
		}

		if (Array.isArray(data.days) && data.days.length) {
			var daysWrap = el('div', 'aap-days');
			data.days.forEach(function (day) {
				var dayEl = el('div', 'aap-day');
				dayEl.appendChild(el('span', 'aap-day-marker', String(day.day_number)));
				dayEl.appendChild(el('h4', 'aap-day-theme', 'Day ' + day.day_number + ': ' + (day.theme || '')));
				if (day.route) dayEl.appendChild(el('p', 'aap-day-route', '📍 ' + day.route));

				[['🌅', day.morning], ['☀️', day.afternoon], ['🍽️', day.dining], ['🧭', day.guide_tour]].forEach(function (l) {
					if (!l[1]) return;
					var line = el('p', 'aap-day-line');
					line.appendChild(el('span', null, l[0]));
					line.appendChild(document.createTextNode(l[1]));
					dayEl.appendChild(line);
				});

				if (day.swap_option) {
					var swapBtn = el('button', 'aap-swap-btn', '↻ ' + day.swap_option);
					swapBtn.type = 'button';
					swapBtn.addEventListener('click', function () {
						sendMessage('For Day ' + day.day_number + ', go with this alternative: ' + day.swap_option);
					});
					dayEl.appendChild(swapBtn);
				}

				daysWrap.appendChild(dayEl);
			});
			itineraryEl.appendChild(daysWrap);
		}

		itineraryEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
	}
})();
