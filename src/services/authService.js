import { auth, db } from '../firebase'
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
} from 'firebase/firestore'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth'

export const signup = async (email, password, displayName) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  const user = userCredential.user

  // Create a user document in Firestore
  const userDocRef = doc(db, 'users', user.uid)
  await setDoc(userDocRef, {
    displayName: displayName,
    email: user.email,
    createdAt: serverTimestamp(),
    liked_songs: [], // Initialize with an empty array
  })

  return userCredential
}

export const login = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password)
}

export const logout = () => {
  return signOut(auth)
}

export const onAuthStateChanged = (callback) => {
  return auth.onAuthStateChanged(callback)
}

export const getUserProfile = async (uid) => {
  if (!uid) return null
  const userDocRef = doc(db, 'users', uid)
  const userDocSnap = await getDoc(userDocRef)

  if (userDocSnap.exists()) {
    return { uid, ...userDocSnap.data() }
  } else {
    console.warn('No user profile document found in Firestore for UID:', uid)
    return null
  }
}

export const likeTrack = (userId, trackId) => {
  const userDocRef = doc(db, 'users', userId)
  return updateDoc(userDocRef, {
    liked_songs: arrayUnion(trackId),
  })
}

export const unlikeTrack = (userId, trackId) => {
  const userDocRef = doc(db, 'users', userId)
  return updateDoc(userDocRef, {
    liked_songs: arrayRemove(trackId),
  })
}

export const createPlaylist = async (userId, name) => {
  const playlistsColRef = collection(db, 'playlists')
  const newPlaylistRef = await addDoc(playlistsColRef, {
    ownerId: userId,
    name: name,
    trackIds: [],
    collaborators: [userId], // Add owner as the first collaborator
    createdAt: serverTimestamp(),
  })
  return { id: newPlaylistRef.id, name, trackIds: [], ownerId: userId, collaborators: [userId] }
}

export const getUserPlaylists = async (userId) => {
  if (!userId) return []
  const playlistsColRef = collection(db, 'playlists')
  const q = query(playlistsColRef, where('collaborators', 'array-contains', userId))
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export const addTrackToPlaylist = (playlistId, trackId) => {
  const playlistDocRef = doc(db, 'playlists', playlistId)
  return updateDoc(playlistDocRef, {
    trackIds: arrayUnion(trackId),
  })
}

export const getPlaylist = async (playlistId) => {
  if (!playlistId) return null
  const playlistDocRef = doc(db, 'playlists', playlistId)
  const docSnap = await getDoc(playlistDocRef)

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() }
  }
  return null
}

export const removeTrackFromPlaylist = (playlistId, trackId) => {
  const playlistDocRef = doc(db, 'playlists', playlistId)
  return updateDoc(playlistDocRef, {
    trackIds: arrayRemove(trackId),
  })
}

export const deletePlaylist = (playlistId) => {
  const playlistDocRef = doc(db, 'playlists', playlistId)
  return deleteDoc(playlistDocRef)
}

export const updateUserProfile = (userId, data) => {
  const userDocRef = doc(db, 'users', userId)
  return updateDoc(userDocRef, data)
}

export const updatePlaylist = (playlistId, data) => {
  const playlistDocRef = doc(db, 'playlists', playlistId)
  return updateDoc(playlistDocRef, data)
}

export const updatePlaylistTrackOrder = (playlistId, trackIds) => {
  const playlistDocRef = doc(db, 'playlists', playlistId)
  return updateDoc(playlistDocRef, { trackIds })
}

export const findUserByEmail = async (email) => {
  const usersColRef = collection(db, 'users')
  const q = query(usersColRef, where('email', '==', email))
  const querySnapshot = await getDocs(q)
  if (querySnapshot.empty) {
    return null
  }
  return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() }
}

export const addCollaborator = (playlistId, userId) => {
  const playlistDocRef = doc(db, 'playlists', playlistId)
  return updateDoc(playlistDocRef, { collaborators: arrayUnion(userId) })
}

export const removeCollaborator = (playlistId, userId) => {
  const playlistDocRef = doc(db, 'playlists', playlistId)
  return updateDoc(playlistDocRef, { collaborators: arrayRemove(userId) })
}
