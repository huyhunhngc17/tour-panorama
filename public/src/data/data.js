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

function addComment(obj) {
	addDocument(obj, "comment");
} 