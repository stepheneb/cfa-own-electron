/*jshint esversion: 8 */

let svg = {};

svg.plusIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 34">
    <circle cx="17" cy="17" r="15" fill="#fff"/>
    <path d="M18.22 15.7h3.26c.21 0 .35.04.43.13s.12.24.12.44v1.34c0 .37-.18.55-.55.55h-3.26v3.31c0 .38-.19.58-.58.58h-1.42c-.38 0-.58-.19-.58-.58v-3.31h-3.26c-.37 0-.55-.18-.55-.55v-1.34c0-.21.04-.36.12-.44s.22-.13.43-.13h3.26v-3.29c0-.38.19-.58.58-.58h1.42c.38 0 .58.19.58.58v3.29z"/>
  </svg>
  `;

svg.minusIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 34">
    <circle cx="17" cy="17" r="15" fill="#fff"/>
    <path d="M19.29 18.22h-4.56c-.34 0-.5-.17-.5-.5V16.3c0-.35.17-.53.5-.53h4.56c.34 0 .5.18.5.53v1.42c.01.33-.16.5-.5.5z"/>
  </svg>
`;

svg.stepNext = `
  <svg class='next' xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 30 30">
    <rect x="20" y="7" width="3" height="16"/>
    <polygon points="16,15 4,7 4,23 "/>
  </svg>
`;

svg.stepBack = `
  <svg class='back' xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 30 30">
    <rect x="8" y="7" width="3" height="16"/>
    <polygon points="15,15 27,23 27,7 "/>
  </svg>
`;

svg.panArrow = (direction, rotation) => {
  svg = `
    <svg id="pan-arrow-${direction}" class="pan-arrow ${direction}" data-direction="${direction}" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 50 50">
     <polygon transform="rotate(${rotation}, 25, 25)" points="33.82,31.84 25.42,23.44 17.03,31.84 14.2,29.01 25.42,17.79 36.65,29.01"/>
    </svg>
  `;
  return svg;
};

export default svg;
