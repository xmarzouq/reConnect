async function sendRequest(url, method, body) {
	const response = await fetch(url, {
		method: method,
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	});
	return response.json();
}
function formatLanguages(languages) {
	return Array.isArray(languages) ? languages.join(", ") : "Not specified";
}
async function handleLogin(event) {
	event.preventDefault();
	const email = document.getElementById("emailInput").value;
	const password = document.getElementById("passwordInput").value;
	const data = await sendRequest("http://127.0.0.1:3000/login", "POST", {
		email,
		password,
	});

	if (data.success) {
		// Redirect to search page
		company = data;
		window.location.href = "./search.html";
	} else {
		alert("Login failed: " + data.message);
	}
}

let offset = 0;
const limit = 10;

async function loadRefugeeCards() {
	const response = await fetch(
		`http://127.0.0.1:3000/refugees?offset=${offset}&limit=${limit}`
	);
	const refugees = await response.json();
	const container = document.getElementById("refugeeCardsContainer");
	container.innerHTML = "";
	refugees.forEach((refugee) => {
		const card = `<div class="refugee-card">
                        <h3><a href="profile.html?id=${
													refugee.id
												}" class="refugee-link">${refugee.name}</a></h3>
                        <p>Age: ${refugee.age_group}</p>
                        <p>City: ${refugee.city}</p>
                        <p>Education: ${refugee.education}</p>
                        <p>Profession: ${refugee.profession}</p>
                        <p>Languages: ${formatLanguages(
													refugee.languages_spoken
												)}</p>
                      </div>`;
		container.innerHTML += card;
	});

	if (refugees.length === limit) {
		// Create the div container
		const btnContainer = document.createElement("div");
		btnContainer.id = "Btn-container";
		btnContainer.className = "container btn-container";
		// Create the button
		const loadMoreBtn = document.createElement("button");
		loadMoreBtn.innerText = "Load More";
		loadMoreBtn.addEventListener("click", handleLoadMore);

		// Append the button to the div container
		btnContainer.appendChild(loadMoreBtn);

		// Assuming "container" is the parent element where you want to append the btnContainer
		container.appendChild(btnContainer);
	}
}

async function handleLoadMore() {
	offset += limit;
	await loadRefugeeCards();
}

async function loadRefugeeProfile() {
	const urlParams = new URLSearchParams(window.location.search);
	const refugeeId = urlParams.get("id");

	const response = await fetch(`http://127.0.0.1:3000/refugees/${refugeeId}`);
	const refugee = await response.json();

	const profileContainer = document.getElementById("refugeeProfile");
	profileContainer.innerHTML = `
        <h2>${refugee.name}</h2>
        <p>Age: ${refugee.age_group}</p>
        <p>City: ${refugee.city}</p>
        <p>Education: ${refugee.education}</p>
        <p>Profession: ${refugee.profession}</p>
        <p>Languages: ${formatLanguages(refugee.languages_spoken)}</p>
    `;

	const showInterestBtn = document.getElementById("showInterestBtn");
	showInterestBtn.addEventListener("click", () =>
		handleShowInterest(refugeeId)
	);
}

async function handleShowInterest(refugeeId) {
	const companyEmail = company.email;

	const emailContent = `Company Email: ${companyEmail}\nRefugee ID: ${refugeeId}`;

	// Send email to development team
	await sendRequest("http://127.0.0.1:3000/send-email", "POST", {
		to: "development-team@example.com",
		subject: "Interest Shown by Company",
		content: emailContent,
	});

	alert(
		"Thank you for showing interest! The development team has been notified." +
			`${companyEmail}`
	);
}

if (window.location.pathname.includes("profile.html")) {
	loadRefugeeProfile();
}

async function handleLoadMore() {
	offset += limit;
	await loadRefugeeCards();
}

async function handleSearch(event) {
	event.preventDefault();
	const ageGroup = document.getElementById("ageGroup").value;
	const city = document.getElementById("city").value;
	const education = document.getElementById("education").value;
	const languages = Array.from(
		document.querySelectorAll('input[name="language"]:checked')
	).map((checkbox) => checkbox.value);

	const filters = {};
	if (ageGroup) filters.ageGroup = ageGroup;
	if (city) filters.city = city;
	if (education) filters.education = education;
	if (languages.length > 0) filters.languages = languages;
	if (profession) filters.profession = profession;

	const response = await fetch("http://127.0.0.1:3000/search", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(filters),
	});

	const data = await response.json();
	const container = document.getElementById("refugeeCardsContainer");
	container.innerHTML = "";
	data.forEach((refugee) => {
		const card = `<div class="refugee-card">
                            <h3><a href="profile.html?id=${
															refugee.id
														}" class="refugee-link">${refugee.name}</a></h3>
                            <p>Age: ${refugee.age_group}</p>
                            <p>City: ${refugee.city}</p>
                            <p>Education: ${refugee.education}</p>
                            <p>Profession: ${refugee.profession}</p>
                            <p>Languages: ${formatLanguages(
															refugee.languages_spoken
														)}</p>
                          </div>`;
		container.innerHTML += card;
	});
}

// Event listeners
if (document.getElementById("loginForm")) {
	document.getElementById("loginForm").addEventListener("submit", handleLogin);
}

if (document.getElementById("searchForm")) {
	document
		.getElementById("searchForm")
		.addEventListener("submit", handleSearch);
}

if (window.location.pathname.includes("search.html")) {
	loadRefugeeCards();
}
