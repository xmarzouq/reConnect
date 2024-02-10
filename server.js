require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { createClient } = require("@supabase/supabase-js");
const bcrypt = require("bcrypt");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.post("/login", async (req, res) => {
	const { email, password } = req.body;

	// Hash the incoming password to compare with the stored hashed password
	const hashedPassword = bcrypt.hashSync(password, 10); // Modify the hashing as per your database password storage

	const { data, error } = await supabase
		.from("users")
		.select("*")
		.eq("email", email)
		.eq("password", password)
		.single();

	if (error || !data) {
		return res
			.status(401)
			.json({ success: false, message: "Invalid credentials" });
	}

	res.json({ success: true, message: "Login successful", user: data });
});

// Get all refugees
app.get("/refugees", async (req, res) => {
	const { offset = 0, limit = 10 } = req.query;
	const { data, error } = await supabase
		.from("refugees")
		.select("*")
		.range(offset, parseInt(offset) + parseInt(limit) - 1);
	if (error) {
		res.status(500).json({ error: error.message });
	} else {
		res.json(data);
	}
});

// Get refugee by ID
app.get("/refugees/:id", async (req, res) => {
	const { id } = req.params;
	const { data, error } = await supabase
		.from("refugees")
		.select("*")
		.eq("id", id)
		.single();
	if (error) {
		res.status(500).json({ error: error.message });
	} else {
		res.json(data);
	}
});
app.post("/search", async (req, res) => {
	const { ageGroup, city, education, languages } = req.body;
	let query = supabase.from("refugees").select("*");

	if (ageGroup) query = query.eq("age_group", ageGroup);
	if (city) query = query.eq("city", city);
	if (education) query = query.eq("education_level", education);
	if (languages && languages.length > 0) {
		// Use 'contains' instead of 'in' to search for array elements
		query = query.contains("languages_spoken", languages);
	}

	const { data, error } = await query;
	if (error) {
		res.status(500).json({ error: error.message });
	} else {
		res.json(data);
	}
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
