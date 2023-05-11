'use strict';

let products = [];
let resultsLimit = 4;
let recordResults = false;

window.addEventListener('load', () => {
  fetch('./data.json')
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      products = data.products;
    });
});

function reset() {
  document.querySelector('#search').value = '';
  document.querySelector('#search-options').innerHTML = '';
}
function submit() {
  recordResults = true;
  resultsLimit = 1000;
  search();
  resultsLimit = 5;
}

function search() {
  const searchedKeyword = document.querySelector('#search').value.toLowerCase();

  if (!searchedKeyword || searchedKeyword === ' ' || searchedKeyword === '') {
    document.querySelector('#search-options').innerHTML = '';
    const getSuggestionsHistory = JSON.parse(
      localStorage.getItem('suggestionsHistory')
    );
    displayProductsSuggestions(getSuggestionsHistory);
    return;
  }
  const searchedProducts = searchProducts(searchedKeyword);
  displayProductsSuggestions(searchedProducts);
}

const searchProducts = (searchedKeyword) => {
  let searchedProducts = [];
  products.forEach((product) => {
    product.description.toLowerCase().search(searchedKeyword) !== -1
      ? searchedProducts.push(
          convertStringToHtmlElement(
            product.description.toLowerCase(),
            searchedKeyword
          )
        )
      : '';
  });
  if (recordResults) storeSuggestionsHistory(searchedProducts[0]);
  return searchedProducts;
};
const storeSuggestionsHistory = (searchedProduct) => {
  const suggestionsHistory = JSON.parse(
    localStorage.getItem('suggestionsHistory')
  );

  if (suggestionsHistory.length === 5) {
    suggestionsHistory.shift();
  }
  suggestionsHistory.push(searchedProduct);
  localStorage.setItem(
    'suggestionsHistory',
    JSON.stringify(suggestionsHistory)
  );
};

const displayProductsSuggestions = (suggestions) => {
  let select = document.querySelector('#search-options');
  select.innerHTML = '';
  suggestions.forEach((product, index) => {
    if (index > resultsLimit) return;
    const opt = document.createElement('div');
    opt.className = 'suggestion';
    opt.innerHTML = `<span>${product}</span>`;
    select.appendChild(opt);
  });
};

const convertStringToHtmlElement = (str, keyword) => {
  const regexp = new RegExp(keyword, 'g');
  const matches = str.matchAll(regexp);

  let htmlElement = '';
  let lastIndex = 0;

  for (const match of matches) {
    if (match.index === 0) {
      htmlElement += `<span class='keyword'>${match[0]}</span>`;
    } else {
      htmlElement +=
        str.slice(lastIndex, match.index) +
        `<span class='keyword'>${match[0]}</span>`;
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex !== str.length - 1)
    htmlElement += str.slice(lastIndex, str.length);

  return htmlElement;
};

function debounce(func, timeout = 700) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}

const findWords = debounce((event) => search(event));
