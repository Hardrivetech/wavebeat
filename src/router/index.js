import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import SignupView from '../views/SignupView.vue'
import PlaylistView from '../views/PlaylistView.vue'
import ProfileView from '../views/ProfileView.vue'
import ArtistView from '../views/ArtistView.vue'
import SearchView from '../views/SearchView.vue'
import LikedSongsView from '../views/LikedSongsView.vue'
import { auth } from '../firebase'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
  },
  {
    path: '/signup',
    name: 'Signup',
    component: SignupView,
  },
  {
    path: '/playlist/:id',
    name: 'Playlist',
    component: PlaylistView,
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfileView,
  },
  {
    path: '/search',
    name: 'Search',
    component: SearchView,
  },
  {
    path: '/artist/:handle',
    name: 'Artist',
    component: ArtistView,
  },
  {
    path: '/collection/tracks',
    name: 'LikedSongs',
    component: LikedSongsView,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = auth.currentUser
  const requiresAuth = ['Profile', 'Playlist', 'LikedSongs'].includes(to.name)
  const requiresGuest = ['Login', 'Signup'].includes(to.name)

  if (requiresAuth && !isAuthenticated) {
    // If a route requires authentication and the user is not logged in,
    // redirect them to the login page.
    next({ name: 'Login' })
  } else if (requiresGuest && isAuthenticated) {
    // If a user is logged in, they shouldn't see the login or signup pages.
    // Redirect them to the home page.
    next({ name: 'Home' })
  } else {
    // Otherwise, allow the navigation to proceed.
    next()
  }
})

export default router
