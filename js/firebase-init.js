'use strict';

firebase.initializeApp(firebaseConfig);

window._adminInit(firebase.firestore(), firebase.auth());