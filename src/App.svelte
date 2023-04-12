<script lang="ts">
  import Counter from './lib/Counter.svelte'
</script>

<main>
  <div class="card">
    <Counter />
  </div>

  <p id="clickText" style="display: none">Clicking from <span id="state"></span>, <span id="country"></span>.</p>
  <div id="map"></div>
  <table id="table"></table>
</main>

<style>
  
</style>
