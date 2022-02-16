const firebaseConfig = {
	apiKey: "AIzaSyB31h5t8TA0y7gA-rNilEi6MokrFCU7q7Q",
	authDomain: "huyspace-687ae.firebaseapp.com",
	projectId: "huyspace-687ae",
	storageBucket: "huyspace-687ae.appspot.com",
	messagingSenderId: "429573449298",
	appId: "1:429573449298:web:22a0d3b9f9caebdd92618b",
	measurementId: "G-MWTG3NE5P0"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

var movies = { 'All': { 'results': [] } }
var db = firebase.firestore();

function addDocument(obj, collection) {
	db.collection(collection).add(obj)
	.then((docRef) => {
		console.log("Document written with ID: ", docRef.id);
	})
	.catch((error) => {
		console.error("Error adding document: ", error);
	});
}

function getAllDocument(collection, id) {
	db.collection(collection).where("id", "==", id).get().then((querySnapshot) => {
	//getListSuccess(querySnapshot.docs.map(doc => doc.data()));
		querySnapshot.forEach(doc => {
			console.log(doc.data());
		})
	});
}

function getDocuments(collection, query) {

}

function getGenreMovies(target, options) {
	getAllDocument("categories", options.id)
	//theMovieDb.genres.getMovies(options, getListSuccess.bind(target), error);
}


function getMovieImages(target, options) {
	theMovieDb.movies.getImages(options, getImagesSuccess.bind(target), error);
}

function getMovieTrailers(target, options) {
	theMovieDb.movies.getTrailers(options, getTrailerSuccess.bind(target), error);
}

function getMovies(tile) {
	var page = 1, pageSize = 20;
	if (movies[tile.category]) {
		page = movies[tile.category].results.length / pageSize + 1;
	}

	if (page > 1) {
		return;
	}
	getGenreMovies(tile, { id: tile.categoryId, page: page });
}
