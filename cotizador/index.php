<?php
  
?>
<html>

<head>
<meta http-equiv="content-type" content="text/html; charset=utf-8" /> 
<title>Instalaciones eléctricas</title>  

 

<script type="text/javascript" src="js/jquery-1.3.2.js"></script>
<link href="css/style.css" rel="stylesheet" type="text/css" media="screen" />  
<link href="css/sms.css" rel="stylesheet" type="text/css" media="screen" />  
 <script src="js/jquery.validate.js" type="text/javascript"></script>  
  <link type="text/css" href="css/ui-lightness/jquery-ui-1.8.16.custom.css" rel="stylesheet" />      
 <script type="text/javascript" src="js/jquery-ui-1.8.16.custom.min.js"> </script>  
<style type="text/css">

    div{

        padding:8px;

    }

</style>



<script type="text/javascript">

     
 
 $(document).ready(function() {
     $("#datepicker").datepicker();   
     $("#test").validate();
     $("#test2").validate(); 
  
  });   

  </script> 




</head>



<body  style="color:yellow;font-size:18px">
                <center>











<h1>Presupuesto</h1>
</center>

  Esta  pequeña funcionalidad nos va a servir para calcular nuestros presupuestos y posteriormente
 exportarlos a pdf y poder imprimir o guardarlos en nuestra pc personal o laptop.

<script type="text/javascript">



    $(document).ready(function(){



        var counter = 1;

        

        $("#addButton").click(function () {

                

           
            

            var newTextBoxDiv = $(document.createElement('div')).attr("id", 'TextBoxDiv' + counter);

               /*
              
                newTextBoxDiv.after().html('<label>Textbox #'+ counter + ' : </label>' +

                '<input type="text" name="textbox' + counter + 

                '" id="textbox' + counter + '" value="" >');
               */
            
               newTextBoxDiv.after().html('<tr><td>'+counter+'</td>' +
' <td><label for="can'+counter+'"></label><input type="text"   name="can'+counter+'"  id="can'+counter+'" size="5" class="required digits"  > </td>'+                                                                                                  
' <td><label for="des'+counter+'"></label><input type="text"   name="des'+counter+'"  id="des'+counter+'" size="70" class="required"  > </td>'+
' <td><label for="precio'+counter+'"></label><input type="text"   name="precio'+counter+'"  id="precio'+counter+'" size="15" class="required number"  > </td>'+ 
' <td><label for="total'+counter+'"></label><input type="text"   name="total'+counter+'"  id="total'+counter+'" size="15" class="required number"  > </td>'+ 
'</tr>');
            
            
            
            
            newTextBoxDiv.appendTo("#TextBoxesGroup");

                

            counter++;

        });



        $("#removeButton").click(function () {

            if(counter==1){

                alert("No more textbox to remove");

                return false;

            }   

            counter--;

            

            $("#TextBoxDiv" + counter).remove();

        });

        

        $("#iva").click(function () {
            var iva = $('#ivaNum').val();   
            
             iva= iva/100;
            
             var resultado=0; 
             
             
            
             if ((counter - 1) == 0  || iva ==  0 ){  
            var caja2 = $('<div title="Precaución"><p>tu iva es = 0% ó No hay elemetos que calcular </p></div>');
             caja2.dialog();
             }else{

             
             
                 for(i=1; i<(counter); i++){

               
                    var precio = $('#precio'+i).val();
                    var cantidad =  $('#can'+i).val();  
                     
                        if(cantidad == ""){
                        
                      var caja2 = $('<div title="Precaución">falta la cantidad: '+i+'</p></div>');
                      caja2.dialog();      
                      $('#can'+i).focus();
                        break;
                      }
                     
                     
                     
                     
                     
                     
                     
                     
                     
                      if(precio == ""){
                       
                        var caja3 = $('<div title="Precaución">falta precio unitario: '+i+'</p></div>');
                      caja3.dialog();
                        
                       
                        $('#precio'+i).focus();
                        break;
                      }
                     // msg += "\n Textbox #" + i + " : " + $('#textbox' + i).val();

                     
                      
                      var total= cantidad*precio;
                     
                      $("#total"+i).attr('value',total);
                     
                     
                     resultado=resultado+total;
                     
                     
                     
              
              
                 
                 }
             
                   
                     ivaTotal=(resultado*iva);
                     resultado2=resultado+ivaTotal;
                     
                     
                     $("#ivatext").attr('value',ivaTotal); 
                     $("#totalbruto").attr('value',resultado);    
                     $("#totalneto").attr('value',resultado2);
                     $("#c").attr('value',i-1); 
                   
                   
                   
                   
                   
             
             
             
             
             }
           
            
             
             
             
        });

        
        
        
         $("#calcular").click(function () {
                
               
             
             
                 var resultado=0;
             if ((counter - 1) == 0)  {
                var caja1 = $('<div title="Precaución"><p>No hay elemetos que calcular</p></div>');
                caja1.dialog();   
            
             
             } else{

             
             
                 for(i=1; i<(counter); i++){

               
                    var precio = $('#precio'+i).val();
                    var cantidad =  $('#can'+i).val();  
                     
                        if(cantidad == ""){
                        
                      var caja2 = $('<div title="Precaución">falta la cantidad: '+i+'</p></div>');
                      caja2.dialog();      
                      $('#can'+i).focus();
                        break;
                      }
                     
                     
                     
                     
                     
                     
                     
                     
                     
                      if(precio == ""){
                       
                        var caja3 = $('<div title="Precaución">falta precio unitario: '+i+'</p></div>');
                      caja3.dialog();
                        
                       
                        $('#precio'+i).focus();
                        break;
                      }
                     // msg += "\n Textbox #" + i + " : " + $('#textbox' + i).val();

                     
                      
                      var total= cantidad*precio;
                     
                      $("#total"+i).attr('value',total);
                     
                     
                     resultado=resultado+total;
                     
                     
                     
              
              
                 
                 }
             
                   
                      $("#totalneto").attr('value',resultado);
                     $("#totalbruto").attr('value',resultado);    
                     $("#c").attr('value',i-1); 
                   
                   
                   
                   
                   
             
             
             
             
             }
           
            
            
            
            
            
             

        });
        
           
         $("#limpiar").click(function () {       
           
           var datepicker = "";
           var presu = "";
           var domicilio = "";
           var totalneto= "";
           var totalbruto = ""; 
           var ivatext = 0;
           var ivaNum =  0; 
           
            
            $("#presu").attr('value',presu);
            $("#domicilio").attr('value',domicilio);
            $("#totalneto").attr('value',totalneto);
            $("#totalbruto").attr('value',totalbruto);
            $("#ivatext").attr('value',ivatext);
            $("#ivaNum").attr('value',ivaNum); 
            $("#datepicker").attr('value',datepicker);  
              
         });  
             
             
  });

</script>

    <form id="test" action="pdf.php" method="post" enctype="multipart/form-data">
       <table>
       
       <tr>
      <td><label for="datepicker">Fecha:</label></td>
       <td>             
      <input type="text"   name="datepicker"  id="datepicker"  class="required"  >
        </td>         
         </tr> 
          <tr>    
        <td>
        
     <label for="presu">Nombre del Presupuesto:</label>
        </td>
       
        <td>             
      <input type="text"   name="presu"  id="presu"  size="25" class="required"  >
        </td> 
             </tr>      
           <tr>
            <td>
        
       <label for="domicilio">domicilio:  </label>
        </td>
          <td>
         <textarea id="domicilio" name="domicilio"  class="required" rows="5" cols="100" ></textarea>  
          </td> 
           
           </tr>
          
          
          
           </table>                  
            


 <table> 
 <tr><td>
 No.
 </td>
 <td>
 Cantidad
 </td>
 
 
 <td>
 Descripción &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 
 </td>  <td>   
 Precio Unitario  &nbsp;&nbsp;  
  </td> 
  <td>
 Total
 </td>    
 </tr>
 </table>
 <table>
<div id='TextBoxesGroup'>
     
         
    
    

</div>
  </table>  
   <table> 
 <tr><td>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;
 </td>
 <td>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;
 </td>
 
 
 <td>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
 </td>  <td>   
  <label for="totalbruto">Total:</label>    &nbsp;&nbsp;  
  </td> 
  <td>
   <input type="text" id="totalbruto"       name="totalbruto"     size="15"   class="required number" >
 </td>    
 </tr>
  <tr><td>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;
 </td>
 <td>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;
 </td>
 
 
 <td>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
 </td>  <td>   
  <label for="ivatext">IVA:</label>    &nbsp;&nbsp;  
  </td> 
  <td>
   <input type="text" id="ivatext"       name="ivatext"     size="15"   class="required number"  value="0">
 </td>    
 </tr>
 <tr><td>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;
 </td>
 <td>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;
 </td>
 
 
 <td>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
 </td>  <td>   
  <label for="totalneto">Monto Total:</label>    &nbsp;&nbsp;  
  </td> 
  <td>
   <input type="text" id="totalneto"       name="totalneto"     size="15"   class="required number"  >
 </td>    
 </tr>
 </table>
        
  Agregar concepto:<a href="#"  id='addButton' > <img src="images/95.png"> </a> <a href="#"  id='removeButton' > <img src="images/117.png"> </a> 
     <a href="#"  id='calcular' > <img src="images/calcular.png"> </a>     <a href="#"  id='limpiar' > <img src="images/limpiar.png"> </a>      
   <br>
  
 <label for="ivaNumb">Introducir el valor de IVA(Solo numero enteros)</label>   
<input type="text" id="ivaNum"       name="ivaNum"     size="15"   class=" isdigit "  value="0"> 
 <a href="#"  id='iva' > <img src="images/iva.png"> </a>  
  
  
  
  
                   <input type="hidden" id="c"    name="c">         
  




      <center>
                <input type="submit" value="PDF" >
                
               
          </center>
          
          
               
          
          
 </form>


</body>

</html>