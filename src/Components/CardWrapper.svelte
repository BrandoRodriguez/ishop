<script>
  import Card from "./Card.svelte";
  import items from "../items.js";
</script>

<style>
  .card {
    display: flex;
    flex-wrap: wrap;
    background-color: rgb(247, 247, 247);
    position: relative;
    z-index: 1;
  }

  .card-details {
    /* width: calc(100% - 280px); */
    height: auto;
    min-height: 100vh;
    /* padding: 30px 30px 50px; */
    /* padding-left: 10px; */
  }

  @media (max-width: 768px) {
    .card {
      padding-top: 15px;
      min-height: auto;
    }
  }

  @media (max-width: 768px) {
    .card-details {
      margin-top: 15px;
    }
  }
  .card-details {
    display: flex;
    flex-wrap: wrap;
    background-color: rgb(247, 247, 247);
    position: relative;
    z-index: 1;
  }
</style>

<div class="card">
  <div class="card-details">

    {#each items as item}
      <Card {item} />
    {/each}

  </div>
</div>
