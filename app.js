// SQLITE3 Database Setup //
const sqlite3  = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/recipes.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) return console.error(err.message);
    console.log("Database Connection Successful");
});
// EXPRESS.JS setup //
const express = require("express");
const app = express();
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: true }))
app.set('view engine', 'ejs');
app.set('views', './public/views');
app.use('/public', express.static('public'));

// EXPRESS.JS Login Session Manager //
const expressSession = require("express-session");
const session = new expressSession({
	secret: "secret",
	resave: true,
	saveUninitialized: true,
});
app.use(session);

// Home //
app.get("/", (req, res) =>{
	res.render('index');
});
app.get("/home", (req, res) =>{
	res.render('index');
});

// Development Diary / Details Page //
app.get("/about", (req, res) =>{
	res.render('about');
});

// Displays all recipes on the site //
app.get("/recipes", (req, res) =>{
	db.all("SELECT * FROM recipes", [], (error, results) => {
		res.render("recipes", {results: results});
	});
});

// Displays recipe details for given recipe //
app.get("/recipes/:recipe_id", (req, res) =>{
	db.all(`SELECT * FROM recipes INNER JOIN recipe_ingredients ON recipes.recipe_id=recipe_ingredients.recipe_id INNER JOIN recipe_methods ON recipe_ingredients.recipe_id=recipe_methods.recipe_id WHERE recipes.recipe_id = ${req.params.recipe_id}`, [], (error, results) => {
		res.render('recipe1', {results: results});
	});
});

// Displays all recipes returned from the search function //
app.get("/recipe/search", (req, res) =>{
	db.all(`SELECT * FROM recipes WHERE recipe_name LIKE '%${req.query.search_recipe}%' OR recipe_difficulty LIKE '%${req.query.search_recipe}%'`, [], (error, results) => {
		res.render('searchresults', { results, req});
	});
});

// LOGINS: Login GET //
app.get("/add/login", (req, res) =>{
	if (req.session.user) {
		res.redirect('/add');
	} else {
		res.render('login');
	}
});

// LOGINS: Login POST //
app.post("/add/login", (req, res) => {
	const email = req.body.login_email;
	const password = req.body.login_password;
	db.all(`SELECT * FROM users WHERE user_email='${email}' AND user_password='${password}'`, [], (error, results) => {
		if(results.length != 0) {
			req.session.user = results[0].user_name;
			res.redirect("/add");
		} else {
			res.render("login", { error: "Invalid username or password, please try again." });
		}
	});
});

// Login sessions: Add Recipe GET //
app.get("/add", (req, res) =>{
	if (req.session.user) {
		res.render('add');
	} else {
		res.redirect('/add/login');
	}
});

// Login Sessions: Add Recipe POST //
app.post("/add", (req, res) => {
	// Form Contents //
	const recipe_name = req.body.add_name;
	const recipe_difficulty = req.body.add_difficulty_select;
	const recipe_ingredients = req.body.add_ingredients;
	const recipe_step_1 = req.body.add_step_1;
	const recipe_step_2 = req.body.add_step_2;
	const recipe_step_3 = req.body.add_step_3;
	const recipe_step_4 = req.body.add_step_4;
	const recipe_step_5 = req.body.add_step_5;
	let FinalStepString = `blank`;

	// Ingredient List Formatting Function //
	function boldWordAfterComma(recipe_ingredients) {
  		// Split the string into an array of words.
  		const words = recipe_ingredients.split(' ');

  		// Iterate over the words and bold the ones that come after a comma.
  		for (let i = 0; i < words.length; i++) {
    		if (words[i].endsWith(",")) {
      		// The next word should be bold.
      			words[i + 1] = `<br /><b>${words[i + 1]}</b>`;
    		}
  		}
  		// Return the bolded string.
		const firstWord = words[0];
		const boldedFirstWord = '<b>' + firstWord + '</b>';
  		return words.join(' ').replace(firstWord, boldedFirstWord);
	}

	// Final Ingredients Variable For Integration //
	const FinalIngredientString = boldWordAfterComma(recipe_ingredients);
	// Conditionally rendering formatted steps as per input data. //
	// Single Step //
	if((recipe_step_2 == "" ) && (recipe_step_3 == "") && (recipe_step_4 == "") && (recipe_step_5 == "")) {
		FinalStepString = `<strong>STEP 1:</strong><br />${recipe_step_1}`;
	}
	// Two Step //
	if((recipe_step_2 != "" ) && (recipe_step_3 == "") && (recipe_step_4 == "") && (recipe_step_5 == "")) {
		FinalStepString = `<strong>STEP 1:</strong><br />${recipe_step_1}<br /><br /><strong>STEP 2:</strong><br />${recipe_step_2}`;
	}
	// Three Step //
	if((recipe_step_2 != "" ) && (recipe_step_3 != "") && (recipe_step_4 == "") && (recipe_step_5 == "")) {
		FinalStepString = `<strong>STEP 1:</strong><br />${recipe_step_1}<br /><br /><strong>STEP 2:</strong><br />${recipe_step_2}<br /><br /><strong>STEP 3:</strong><br />${recipe_step_3}`;
	}
	// Four Step //
	if((recipe_step_2 != "" ) && (recipe_step_3 != "") && (recipe_step_4 != "") && (recipe_step_5 == "")) {
		FinalStepString = `<strong>STEP 1:</strong><br />${recipe_step_1}<br /><br /><strong>STEP 2:</strong><br />${recipe_step_2}<br /><br /><strong>STEP 3:</strong><br />${recipe_step_3}<br /><br /><strong>STEP 4:</strong><br />${recipe_step_4}`;
	}
	// Five Step //
	if((recipe_step_2 != "" ) && (recipe_step_3 != "") && (recipe_step_4 != "") && (recipe_step_5 != "")) {
		FinalStepString = `<strong>STEP 1:</strong><br />${recipe_step_1}<br /><br /><strong>STEP 2:</strong><br />${recipe_step_2}<br /><br /><strong>STEP 3:</strong><br />${recipe_step_3}<br /><br /><strong>STEP 4:</strong><br />${recipe_step_4}<br /><br /><strong>STEP 5:</strong><br />${recipe_step_5}`;
	}
	// Insert Recipe into Recipes table //
	db.run("INSERT INTO recipes(recipe_name, recipe_difficulty, recipe_image, recipe_author) VALUES(?,?,?,?)", [recipe_name, recipe_difficulty, "https://i.imgur.com/psjV4nC.png", req.session.user],(error)=>{
		if(error) {
			console.log(error);
		} else {
			console.log("Successfully registered new recipe 1/3");
		}
	});
	// Insert Ingredients into ingredients table //
	db.run("INSERT INTO recipe_ingredients(recipe_ingredient_list) VALUES(?)", [FinalIngredientString],(error)=>{
		if(error) {
			console.log(error);
		} else {
			console.log("Successfully registered new recipe 2/3");
		}
	});
	// Insert Methods into Methods table //
	db.run("INSERT INTO recipe_methods(recipe_steps) VALUES(?)", [FinalStepString],(error)=>{
		if(error) {
			console.log(error);
		} else {
			console.log("Successfully registered new recipe 3/3");
		}
	});
	// Redirect to MyRecipes to show all published recipes & the new one. //
	res.redirect('/myrecipes');
});

// LOGINS: Signup Functionality //
app.get('/add/signup', function(req, res){
    res.render('signup');
});

// LOGINS: Signup POST //
app.post("/add/signup", (req, res) => {
	const name = req.body.login_name;
	const email = req.body.login_email;
	const password = req.body.login_password;
	db.run("INSERT INTO users(user_email, user_password, user_name) VALUES(?,?,?)", [email, password, name],(error)=>{
		if(error) {
			console.log(error);
		} else {
			req.session.user = email;
			res.redirect("/add");
		}
	});
});

// LOGINS: All user-specific recipes //
app.get("/myrecipes", (req, res) =>{
	if (req.session.user) {
		db.all(`
		SELECT * FROM recipes INNER JOIN recipe_ingredients ON recipes.recipe_id = recipe_ingredients.recipe_id INNER JOIN recipe_methods ON recipe_ingredients.recipe_id = recipe_methods.recipe_id WHERE recipes.recipe_author = '${req.session.user}'`, [], (error, results) => {
			res.render('user_recipes', { results, req});
		});
	} else {
		res.render('login');
	}
});

// 404 Route //
app.get('*', function(req, res){
    res.render('error404');
});


app.listen(80);