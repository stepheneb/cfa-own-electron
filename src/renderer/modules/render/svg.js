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

svg.keyboardShift = `
  <svg xmlns="http://www.w3.org/2000/svg" stroke="currentColor" viewBox="0 0 72 78">
    <path class="outline"
      d="M55 40
         h18
         l-37 -40 -37 40
         h18
         v37
         h36
         z">
      </path>
  </svg>
`;

svg.keyboardBackspace = `
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 48 48">
    <g>
      <path
        d="M45.25391,9.50537H15.17969a1.00135,1.00135,0,0,0-.73145.31787L1.85352,23.31787a.99992.99992,0,0,0,0,1.36426l12.59472,13.4956a1.00272,1.00272,0,0,0,.73145.31739H45.25391a.99943.99943,0,0,0,1-1V10.50537A.99974.99974,0,0,0,45.25391,9.50537Zm-1,26.98975H15.61426L3.95313,24,15.61426,11.50537H44.25391Z"></path>
      <path
        d="M24.668,29.62988a.99963.99963,0,0,0,1.41406,0l3.71777-3.71759,3.71778,3.71759a.99989.99989,0,0,0,1.41406-1.41406l-3.71771-3.71753,3.71771-3.71753a.99989.99989,0,0,0-1.41406-1.41406L29.7998,23.08429,26.082,19.3667A.99989.99989,0,0,0,24.668,20.78076l3.71771,3.71753L24.668,28.21582A.99962.99962,0,0,0,24.668,29.62988Z"></path>
    </g>
  </svg>
`;

svg.panArrow = (direction, rotation) => {
  let svg = `
    <svg id="pan-arrow-${direction}" class="pan-arrow ${direction}" data-direction="${direction}" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 50 50">
     <polygon transform="rotate(${rotation}, 25, 25)" points="33.82,31.84 25.42,23.44 17.03,31.84 14.2,29.01 25.42,17.79 36.65,29.01"/>
    </svg>
  `;
  return svg;
};

svg.menuConnect = () => {
  return `
    <svg id='menu-connnect-svg'>
      <line stroke-width="1px" stroke="#000000" x1="0" y1="0" x2="100" y2="100" id='menu-connnect-line' />
    </svg>
  `;
};

svg.menuSeparator = () => {
  return `
    <svg id='menu-separator-svg'>
      <line stroke-width="2px" stroke="#000000" x1="0" y1="0" x2="100" y2="100" id='menu-separator-line' />
    </svg>
  `;
};

export default svg;
