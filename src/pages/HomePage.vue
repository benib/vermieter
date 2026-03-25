<template>
  <div>
    <h1>Tools für Vermieter</h1>
    <p class="subtitle">Nützliche Berechnungen für Vermieter von Wohnungen in der Schweiz.</p>

    <div class="tools-grid">
      <router-link to="/mietzins" class="tool-card">
        <h2>Mietzinsanpassung</h2>
        <p>
          Berechnung der Mietzinsanpassung bei Änderung des Referenzzinssatzes,
          inkl. Teuerungsausgleich und allgemeiner Kostensteigerung.
        </p>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
h1 {
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #666;
  margin-bottom: 2rem;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.tool-card {
  display: block;
  padding: 1.5rem;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.tool-card:hover {
  border-color: #1a6b3c;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.tool-card h2 {
  font-size: 1.15rem;
  margin-bottom: 0.5rem;
  color: #1a6b3c;
}

.tool-card p {
  font-size: 0.9rem;
  color: #666;
}
</style>
