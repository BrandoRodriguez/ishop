<script>
  import { cart } from "../stores/stores.js";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  let cart_sum = 0;
  let articulo = "Item";

  const unsubscribe = cart.subscribe(items => {
    const itemValues = Object.values(items);
    cart_sum = 0;
    itemValues.forEach(item => {
      cart_sum += item.count;
    });
  });

  function goToHome() {
    dispatch("nav", {
      option: "home"
    });
  }

  function goToCheckout() {
    dispatch("nav", {
      option: "checkout"
    });
  }
  function goToModa() {
    dispatch("nav", {
      option: "moda"
    });
  }
</script>

<style>
  /* button */
  .hQDCQX {
    height: auto;
    width: auto;
    display: flex;
    flex-direction: column;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: center;
    justify-content: center;
    background-color: rgb(0, 158, 127);
    box-shadow: rgba(0, 0, 0, 0.16) 0px 21px 36px;
    cursor: pointer;
    position: fixed;
    right: 0px;
    top: 50%;
    margin-top: -46px;
    z-index: 99;
    padding: 0px;
    border-radius: 6px 0px 0px 6px;
    border-width: 0px;
    border-style: initial;
    border-color: initial;
    border-image: initial;
    outline: 0px;
  }

  .bMppaE {
    font-family: Lato, sans-serif;
    font-size: 13px;
    font-weight: 700;
    color: rgb(255, 255, 255);
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: center;
    justify-content: center;
    padding: 15px 10px;
  }
  button {
    font-family: Lato, sans-serif;
    margin: 0px;
  }
  span {
    font-family: Lato, sans-serif;
    margin: 2px;
    padding: 1px;
  }
  *,
  ::before,
  ::after {
    box-sizing: inherit;
  }

  .iZKyqx {
    width: auto;
    height: 35px;
    min-width: 80px;
    display: inline-flex;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: center;
    justify-content: center;
    background-color: rgb(255, 255, 255);
    font-family: Lato, sans-serif;
    font-size: 13px;
    font-weight: 700;
    color: rgb(0, 158, 127);
    overflow: hidden;
    border-radius: 6px;
  }
</style>

<header>
  <ul>
    <li on:click={goToHome}>SvelteCommerce</li>
  </ul>
</header>

<button
  on:click={goToCheckout}
  class="CartPopupstyle__CartPopupBoxButton-sc-67tc19-4 hQDCQX product-cart">
  <span class="CartPopupstyle__TotalItems-sc-67tc19-5 bMppaE">
    <span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="12.686"
        height="16"
        viewBox="0 0 12.686 16">
        <g data-name="Group 2704" transform="translate(-27.023 -2)">
          <g data-name="Group 17" transform="translate(27.023 5.156)">
            <g data-name="Group 16">
              <path
                data-name="Path 3"
                d="M65.7,111.043l-.714-9A1.125,1.125,0,0,0,63.871,101H62.459V103.1a.469.469,0,1,1-.937,0V101H57.211V103.1a.469.469,0,1,1-.937,0V101H54.862a1.125,1.125,0,0,0-1.117,1.033l-.715,9.006a2.605,2.605,0,0,0,2.6,2.8H63.1a2.605,2.605,0,0,0,2.6-2.806Zm-4.224-4.585-2.424,2.424a.468.468,0,0,1-.663,0l-1.136-1.136a.469.469,0,0,1,.663-.663l.8.8,2.092-2.092a.469.469,0,1,1,.663.663Z"
                transform="translate(-53.023 -101.005)"
                fill="currentColor" />
            </g>
          </g>
          <g data-name="Group 19" transform="translate(30.274 2)">
            <g data-name="Group 18">
              <path
                data-name="Path 4"
                d="M160.132,0a3.1,3.1,0,0,0-3.093,3.093v.063h.937V3.093a2.155,2.155,0,1,1,4.311,0v.063h.937V3.093A3.1,3.1,0,0,0,160.132,0Z"
                transform="translate(-157.039)"
                fill="currentColor" />
            </g>
          </g>
        </g>
      </svg>
    </span>

    <span style="vertical-align: inherit;">
      <span style="vertical-align: inherit;">{articulo}</span>
    </span>
    <span class="CartPopupstyle__PriceBoxAlt-sc-67tc19-6 iZKyqx">

      <!-- -->
      <span style="vertical-align: inherit;">
        <span style="vertical-align: inherit;">
          {#if cart_sum > 0}
            <div class="circle">{cart_sum}</div>
          {/if}
        </span>
      </span>
    </span>
  </span>
</button>
