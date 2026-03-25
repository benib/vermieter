<template>
  <div class="app">
    <header class="app-header">
      <nav>
        <router-link to="/" class="nav-brand">Tools für Vermieter</router-link>
        <router-link to="/mietzins">Mietzinsanpassung</router-link>
      </nav>
    </header>
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.app-header {
  border-bottom: 1px solid #e0e0e0;
  padding: 0.75rem 1.5rem;
  background: #fff;
}

nav {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  max-width: 960px;
  margin: 0 auto;
}

nav a {
  color: #333;
  text-decoration: none;
  font-size: 0.95rem;
}

nav a:hover {
  color: #1a6b3c;
}

nav a.router-link-exact-active:not(.nav-brand) {
  color: #1a6b3c;
  font-weight: 600;
}

.nav-brand {
  font-weight: 700;
  font-size: 1.1rem;
  margin-right: auto;
}

.app-main {
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}
</style>
