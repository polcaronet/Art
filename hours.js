
const cartBtn = document.getElementById("cart-btn")
const cartItemsContainer = document.getElementById("cart-items")
const checkoutBtn = document.getElementById("checkout-btn")
const cartCounter = document.getElementById("cart-count")
const addressInput = document.getElementById("address")
const addressWarn = document.getElementById("address-warn")





 addressInput.addEventListener("input", function(event){
   let inputValue = event.target.value;
   
   if(inputValue !== ""){
   addressInput.classList.remove("border-red-500")
   addressWarn.classList.add("hidden")
   }

 })

   /* Finalizar pedido */
 checkoutBtn.addEventListener("click", function(){

 const isOpen = checkRestaurantOpen();
  if(!isOpen){
    
    Toastify({
            text: "Ops o restaurante está fechado!",
            duration: 3000,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: "right", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
              background: "#ef4444",
           },
        }).showToast();
       return;
    }


    if(cart.length === 0) return;
    if(addressInput.value === ""){
      addressWarn.classList.remove("hidden")
      addressInput.classList.add("border-red-500")
      return;  
    }

 })
  /* Verificar a hora e manipupular o cart do horário */
function checkRestaurantOpen(){
  const data = new Date();
  const hora = data.getHours();
  return hora >= 10 && hora < 20; 
  /* true => Restaurante está aberto */
}

const spanItem = document.getElementById("date-span")
const isOpen = checkRestaurantOpen();

if(isOpen){
 spanItem.classList.remove("bg-red-500"); 
 spanItem.classList.add("bg-green-600")
  
}else{
   spanItem.classList.remove("bg-green-600")
   spanItem.classList.add("bg-red-500")
}
