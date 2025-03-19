export function generateUniquieId(){
    const timestamp=parseInt(Date.now()/1000)
    const randomThree = Math.floor(Math.random() * (999 - 100 + 1) + 100);
   return `D${timestamp}${randomThree}`
}