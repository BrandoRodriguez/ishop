<script>
  import { get } from "svelte/store";
  import { cart } from "../stores/stores.js";
  import { fly } from "svelte/transition";
  import Oferta from "./Oferta.svelte";

  let visible = true;

  let svg =
    "M298.7,418.289l-2.906-4.148a.835.835,0,0,0-.528-.251.607.607,0,0,0-.529.251l-2.905,4.148h-3.17a.609.609,0,0,0-.661.625v.191l1.651,5.84a1.336,1.336,0,0,0,1.255.945h8.588a1.261,1.261,0,0,0,1.254-.945l1.651-5.84v-.191a.609.609,0,0,0-.661-.625Zm-5.419,0,1.984-2.767,1.98,2.767Zm1.984,5.024a1.258,1.258,0,1,1,1.319-1.258,1.3,1.3,0,0,1-1.319,1.258Zm0,0";

  export let item;
  let { name, price, img, count } = item;
  let soles = "$";

  const cartItems = get(cart);
  let inCart = cartItems[name] ? cartItems[name].count : 0;

  function addToCart() {
    inCart++;
    cart.update(n => {
      return { ...n, [name]: { ...item, count: inCart } };
    });
  }

  const countButtonHandler = e => {
    if (e.target.classList.contains("add")) {
      inCart--;
    } else if (inCart >= 1) {
      inCart++;
    }
    cart.update(n => {
      return { ...n, [name]: { ...item, count: inCart } };
    });
  };
</script>

<style>
  .card-measurements {
    max-width: 15%;
    padding-left: 15px;
    padding-right: 15px;
    margin-bottom: 30px;
    flex: 0 0 20%;
  }
  @media (max-width: 767px) {
    .card-measurements {
      max-width: 50%;
      flex: 45%;
    }
  }
  @media (max-width: 768px) {
    .card-measurements {
      padding-left: 5px;
      padding-right: 5px;
      margin-bottom: 15px;
    }
  }
  .card-size > div {
    height: 100%;
  }
  .react-reveal {
    animation-fill-mode: both;
    animation-duration: 800ms;
    animation-delay: 0ms;
    animation-iteration-count: 1;
    opacity: 1;
  }
  .card-image {
    height: 240px;
    position: relative;
    text-align: center;
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: center;
    justify-content: center;
    padding: 5px;
  }
  .card-image img {
    max-width: 100%;
    max-height: 100%;
    display: inline-block;
  }
  .card-product {
    height: 100%;
    width: 100%;
    background-color: rgb(255, 255, 255);
    position: relative;
    font-family: Lato, sans-serif;
    cursor: pointer;
    border-radius: 6px;
  }
  .card-information {
    padding: 20px 25px 30px;
  }
  .card-information .product-title {
    font-family: Lato, sans-serif;
    font-size: 15px;
    font-weight: 700;
    color: rgb(13, 17, 54);
    width: 100%;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin: 0px 0px 7px;
    overflow: hidden;
  }
  .card-information .product-weight {
    font-family: Lato, sans-serif;
    font-size: 13px;
    font-weight: 400;
    color: rgb(119, 121, 140);
  }
  .card-information .product-meta {
    margin-top: 30px;
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: justify;
    justify-content: space-between;
  }
  .gqAiKu .product-meta .productPriceWrapper {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  .gqAiKu .product-meta .productPriceWrapper .product-price {
    font-family: Lato, sans-serif;
    font-size: 15px;
    font-weight: 700;
    color: rgb(0, 158, 127);
  }
  @media (max-width: 767px) {
    .card-information {
      padding: 15px 20px;
    }
  }
  @media (max-width: 767px) {
    .card-information .product-title {
      font-size: 14px;
      margin: 0px 0px 5px;
    }
  }
  @media (max-width: 767px) {
    .card-information .product-weight {
      font-size: 12px;
    }
  }
  @media (max-width: 767px) {
    .card-information .product-meta {
      min-height: 32px;
    }
  }
  @media (max-width: 767px) {
    .gqAiKu .product-meta .productPriceWrapper .product-price {
      font-size: 14px;
    }
  }
  @media (max-width: 767px) {
    .card-image {
      height: 135px;
    }
  }
  div {
    font-family: Lato, sans-serif;
    margin: 0px;
  }
  .product-price {
    font-family: Lato, sans-serif;
    font-size: 15px;
    font-weight: 700;
    color: rgb(0, 158, 127);
  }
  @media (max-width: 1300px) and (min-width: 768px) {
    .card-measurements {
      max-width: 33.3333%;
      flex: 28%;
    }
  }

  /* Button */
  .button-general {
    cursor: pointer;
    display: inline-flex;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: center;
    justify-content: center;
    width: auto;
    font-family: Lato, sans-serif;
    font-weight: 700;
    padding-top: 0px;
    padding-bottom: 0px;
    box-sizing: border-box;
    color: rgb(0, 158, 127);
    background-color: transparent;
    height: 38px;
    padding-left: 15px;
    padding-right: 15px;
    font-size: 14px;
    text-decoration: none;
    border-image: initial;
    border-width: 1px;
    border-style: solid;
    border-color: rgb(241, 241, 241);
    transition: all 0.35s ease 0s;
    border-radius: 20px;
  }
  .button-general span.button-icon {
    display: flex;
  }
  .button-card {
    height: 36px;
    padding-left: 17px;
    padding-right: 17px;
    font-size: 13px;
    font-weight: 700;
    border-width: 2px;
    border-style: solid;
    border-color: rgb(247, 247, 247);
    border-image: initial;
    border-radius: 18px;
  }
  .button-card:hover {
    background: rgb(0, 158, 127);
    color: #fff;
  }
  @media (max-width: 767px) {
    .button-card {
      width: 32px;
      height: 32px;
      padding: 0px;
      border-radius: 50%;
    }
  }
  @media (max-width: 767px) {
    .button-card .btn-text {
      display: none;
    }
  }
  .button-card .btn-text {
    padding: 0px 0px 0px 6px;
  }

  /* botton */
  .fmEddu {
    display: flex;
    background-color: rgb(0, 158, 127);
    color: rgb(255, 255, 255);
    font-size: 15px;
    font-weight: 700;
    -webkit-box-pack: justify;
    justify-content: space-between;
    -webkit-box-align: center;
    align-items: center;
    flex-shrink: 0;
    width: 104px;
    height: 36px;
    border-radius: 200px;
    overflow: hidden;
  }

  .bPmfin {
    background-color: transparent;
    color: rgb(255, 255, 255);
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: center;
    justify-content: center;
    height: 100%;
    cursor: pointer;
    border-width: initial;
    border-style: none;
    border-color: initial;
    border-image: initial;
    padding: 10px;
  }
  *,
  ::before,
  ::after {
    box-sizing: inherit;
  }
  button {
    font-family: Lato, sans-serif;
    margin: 0px;
  }
</style>

<div class="card-measurements">
  <div class="card-size">
    <div class="react-reveal">
      <div class="card-product product-card">

        <div class="card-image">

          <img src={`img/${img}`} alt={name} />

          <Oferta o="{50}%" />
        </div>

        <!-- 
           {#if visible}
              <span class="card-img" transition:fly="{{ y: 400, x:250, duration: 4000 }}">
                <img src={`img/${img}`} alt={name} />
              </span>
            {/if} -->
        <div class="card-information">
          <h3 class="product-title">{name}</h3>
          <span class="product-weight">{soles} {price}</span>
          <div class="product-meta">
            <div class="productPriceWrapper">
              <span class="product-price">{soles}{price}</span>
            </div>

            {#if inCart > 0}
              <!-- <span>
                      <em>({inCart} in cart)</em>
                    </span> -->
              <div class="Counterstyle__CounterBox-sc-14ahato-0 fmEddu">

                <!-- <input type="checkbox" bind:checked={visible}> -->

                <button
                  class="add Counterstyle__CounterButton-sc-14ahato-1 bPmfin"
                  on:click={countButtonHandler}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12px"
                    height="2px"
                    viewBox="0 0 12 2">
                    <rect
                      data-name="Rectangle 522"
                      width="12"
                      height="2"
                      rx="1"
                      fill="currentColor" />
                  </svg>
                </button>
                <span class="Counterstyle__CounterValue-sc-14ahato-2 dMHyRK">
                  {inCart}
                </span>
                <button
                  class=" Counterstyle__CounterButton-sc-14ahato-1 bPmfin"
                  on:click={countButtonHandler}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12px"
                    height="12px"
                    viewBox="0 0 12 12">
                    <g
                      id="Group_3351"
                      data-name="Group 3351"
                      transform="translate(-1367 -190)">
                      <rect
                        data-name="Rectangle 520"
                        width="12"
                        height="2"
                        rx="1"
                        transform="translate(1367 195)"
                        fill="currentColor" />
                      <rect
                        data-name="Rectangle 521"
                        width="12"
                        height="2"
                        rx="1"
                        transform="translate(1374 190) rotate(90)"
                        fill="currentColor" />
                    </g>
                  </svg>

                </button>
              </div>
            {:else}
              <button on:click={addToCart} class="button-general button-card">
                <span class="button-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14.4"
                    height="12"
                    viewBox="0 0 14.4 12">
                    <g
                      data-name="Group 120"
                      transform="translate(-288 -413.89)">
                      <path data-name="Path 154" fill="currentColor" d={svg} />
                    </g>
                  </svg>
                </span>
                <span class="btn-text">card</span>
              </button>
            {/if}

          </div>
        </div>
      </div>
    </div>
  </div>
</div>
