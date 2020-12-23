import { createApp } from 'vue';
import './assets/main.css';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import { routes } from './routes';

const app = createApp(App);
const router = createRouter({
  history: createWebHistory(),
  routes,
});

if (import.meta.hot) {
  let removeRoutes = []

  for (let route of routes) {
    removeRoutes.push(router.addRoute(route))
  }

  import.meta.hot.acceptDeps('./routes.js', ({ routes }) => {
    for (let removeRoute of removeRoutes) removeRoute()
    removeRoutes = []
    for (let route of routes) {
      removeRoutes.push(router.addRoute(route))
    }
    router.replace('')
  })
}

app.use(router)

app.mount('#app')
