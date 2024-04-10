/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes:{
        floatUP:{
          "%0": {transform: "translatey(0px)"},
          "50%": { transform: "translatey(-8px)"},
          "100%": { transform: "translatey(0px)"},
         }
        },
        animation:{
         floatUP: "floatUP 2s infinite"
        },
        colors:{
          vermelho:"#B3093F",
          vermelhinho: "#cc0000",
          vinho:"#451531", 
          piscina:"#64B7CC", 
          pink:"#FF3877", 
          opacity: "#B7B7B8", 
          ciano: "#104b85", 
          aqua: "#0066cc",
          cianozinho: "#04a9e5",       
          azul:   "rgb(25, 58, 189)",
        }
    },
  },
  plugins: [],
}

