<script>
  import { cart } from "../stores/stores.js";
  export let item;
  let { name, price, img, count } = item;

  $: doubled = count * price;

  const countButtonHandler = e => {
    if (e.target.classList.contains("add")) {
      count++;
    } else if (count >= 1) {
      count--;
    }
    cart.update(n => ({ ...n, [name]: { ...n[name], count } }));
  };

  const removeItem = () => {
    cart.update(n => {
      delete n[name];
      return n;
    });
  };
</script>

<style>
  .item-grid {
    display: flex;
    background: #fff;
    margin: 10px;
    padding: 20px;
    border-radius: 7px;
  }

  img {
    object-fit: cover;
    margin: 10px 20px 10px 0;
  }

  .item-meta-data {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  }

  .item-meta-data h3 {
    margin-top: 0;
  }

  .item-meta-data p {
    margin: 0.2em 0;
    font-size: 0.8em;
  }

  .count {
    display: flex;
    margin-top: 10px;
  }

  .count > * {
    display: block;
    margin: 0;
    font-size: 0.8em;
    box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  }

  .count button.add {
    border-radius: 5px 0 0 5px;
    margin-right: 0;
    border: 0.5px solid #7d7d7d;
  }

  .count p {
    border: 0.5px solid #7d7d7d;
    margin: 0;

    background: #fefefe;
    border-left: none;
    border-right: none;
  }

  .count button.subtract {
    border: 0.5px solid #7d7d7d;

    border-radius: 0 5px 5px 0;
  }

  .count button.remove {
    display: flex;
    align-content: center;
    font-size: 0.6em;
    background-color: #c91616;
    color: white;
    box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    margin-left: 10px;
  }

  .count button.remove object {
    width: 20px;
    height: 20px;
  }

  button > *:active,
  button > *:focus {
    outline: none;
  }

  @media screen and (max-width: 1048px) {
    img {
      width: 45%;
    }
  }

  @media screen and (max-width: 454px) {
    .item-grid {
      flex-direction: column;
    }

    img {
      width: 100%;
    }
  }

  /* {{{{{{{{{{{{{{{{{{{{{{{{}}}}}}}}}}}}}}}}}}}}}}}} */

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

<div class="item-grid">
  <img src={`img/${img}`} alt={name} />
  <div class="item-meta-data">
    <h3 class="title">{name}</h3>
    <p class="price">Price: {price}</p>
    <p class="price">Suma: {doubled}</p>

    <div class="count">
      <div class="Counterstyle__CounterBox-sc-14ahato-0 fmEddu">

        <!-- <input type="checkbox" bind:checked={visible}> -->

        <button
          class=" add Counterstyle__CounterButton-sc-14ahato-1 bPmfin"
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
          {count}
        </span>
        <button
          class="Counterstyle__CounterButton-sc-14ahato-1 bPmfin"
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
      <button class="remove" on:click={removeItem}>
        <object
          aria-label="remove"
          type="image/svg+xml"
          data="img/svg/cancel.svg" />
        Remove
      </button>
    </div>
  </div>
</div>
