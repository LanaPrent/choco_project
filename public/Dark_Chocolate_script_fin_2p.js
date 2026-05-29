var myIndex = 0;
   carousel();

   function carousel()   {
      var i;
      var x = document.getElementsByClassName("mySlides");
      for(i=0; i<x.length; i++){
         x[i].style.display="none";
      }
      myIndex++;
      if(myIndex>x.length) {myIndex=1}
      x[myIndex-1].style.display="block";
      setTimeout(carousel,6000);
   }

      console.log("Hey, there!")

      //instead of fetch('api/message') block
      async function getMessage() {
        try {
            const res = await fetch('/api/message');
            const data = await res.json();

            console.log("Server says:", data.text);
        } catch (err) {
            console.error(err);
        }
    }
    getMessage();



 /*     
fetch('api/message')
.then(res => res.json())
.then(data =>{
    console.log("Server says:", data.text);})
.catch(err =>console.error(err));
*/



/*   
fetch('/')
    .then(res => res.text())
    .then(data => {
        console.log(data);
    });*/
    