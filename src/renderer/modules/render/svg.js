/*jshint esversion: 8 */

let svg = {};

svg.plusIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 34">
    <circle cx="17" cy="17" r="15" fill="#fff" id="Layer_1"/>
    <path d="M18.22 15.7h3.26c.21 0 .35.04.43.13s.12.24.12.44v1.34c0 .37-.18.55-.55.55h-3.26v3.31c0 .38-.19.58-.58.58h-1.42c-.38 0-.58-.19-.58-.58v-3.31h-3.26c-.37 0-.55-.18-.55-.55v-1.34c0-.21.04-.36.12-.44s.22-.13.43-.13h3.26v-3.29c0-.38.19-.58.58-.58h1.42c.38 0 .58.19.58.58v3.29z" id="Layer_3"/>
  </svg>
  `;

svg.minusIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 34">
    <circle cx="17" cy="17" r="15" fill="#fff" id="Layer_1"/>
    <path d="M19.29 18.22h-4.56c-.34 0-.5-.17-.5-.5V16.3c0-.35.17-.53.5-.53h4.56c.34 0 .5.18.5.53v1.42c.01.33-.16.5-.5.5z" id="_x2D_"/>
  </svg>
`;

svg.panArrowUp = `
  <svg id="pan-arrow-up" class="pan-arrow up bi-caret-up" data-direction="up" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
    <path d="M3.204 11h9.592L8 5.519 3.204 11zm-.753-.659 4.796-5.48a1 1 0 0 1 1.506 0l4.796 5.48c.566.647.106 1.659-.753 1.659H3.204a1 1 0 0 1-.753-1.659z"/>
  </svg>
`;

svg.panArrowDown = `
  <svg id="pan-arrow-down" class="pan-arrow down bi bi-caret-down" data-direction="down" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
    <path d="M3.204 5h9.592L8 10.481 3.204 5zm-.753.659 4.796 5.48a1 1 0 0 0 1.506 0l4.796-5.48c.566-.647.106-1.659-.753-1.659H3.204a1 1 0 0 0-.753 1.659z"/>
  </svg>
`;

svg.panArrowLeft = `
  <svg id="pan-arrow-left" class="pan-arrow left bi-caret-left" data-direction="left" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
    <path d="M10 12.796V3.204L4.519 8 10 12.796zm-.659.753-5.48-4.796a1 1 0 0 1 0-1.506l5.48-4.796A1 1 0 0 1 11 3.204v9.592a1 1 0 0 1-1.659.753z"/>
  </svg>
`;

svg.panArrowRight = `
  <svg id="pan-arrow-right" class="pan-arrow right bi-caret-right" data-direction="right" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
    <path d="M6 12.796V3.204L11.481 8 6 12.796zm.659.753 5.48-4.796a1 1 0 0 0 0-1.506L6.66 2.451C6.011 1.885 5 2.345 5 3.204v9.592a1 1 0 0 0 1.659.753z"/>
  </svg>
`;

export default svg;
