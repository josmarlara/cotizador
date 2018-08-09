<?php
  
 require_once('pdf/fpdf.php');
 
    
  class   PDF extends FPDF{
    
    
    
    
      
       // Cabecera de página
function Header()
{
       $fecha=$_POST["datepicker"]; 
       $concepto=$_POST["presu"];
       $domicilio=$_POST["domicilio"]; 
      
      $this->Rect(10,10,190,30);
       $this->SetFont('Arial','B',7);
   
       $this->Cell(80);
    // Título
    $this->Cell(20,10,'Presupuesto:'.$concepto);
    // Salto de línea
    $this->Text(15,15,$fecha);
    $domicilio=utf8_decode( $domicilio);                 
    $this->Text(15,30,$domicilio);
   // $this->Text(15,35,$c); 
    $this->Ln(20);
      
      
}     
      
  }
  /*
   $fil = $_POST["fil"];
    $des = $_POST["des"];
    $can = $_POST["can"];   
    $uni = $_POST["uni"];
    $precio = $_POST["precio"];
    $total = $_POST["total"]; 
   $n= count($fil);
  
  
 
    */
      
     $i = 1;            
    $c=$_POST["c"];    
     $x = 50; 
  $pdf = new PDF();
  $pdf->AliasNbPages();
  $pdf->AddPage();
 
 
  while ($i <= $c)
   {
      
         $x=$x+5;  
         $pdf->Text(10,45,"No."); 
         $pdf->Text(10,$x,$i); 
         $pdf->Text(20,45,utf8_decode("Cantidad"));    
         $pdf->Text(20,$x,$_POST["can".$i]); 
         $pdf->Text(45,45,utf8_decode("Descripción"));   
         $des=utf8_decode($_POST["des".$i]);
         $pdf->Text(45,$x,$des);   
         $pdf->Text(140,45,"Precio Unitario");   
         $pdf->Text(140,$x,$_POST["precio".$i]);  
         $pdf->Text(160,45,"Total");   
         $pdf->Text(160,$x,$_POST["total".$i]); 
       
       
    
   $i++; 
   
     }   
    $pdf->Text(140,$x+5,"Total"); 
    $pdf->Text(160,$x+5,$_POST["totalbruto"]); 
    $pdf->Text(140,$x+10,"IVA"); 
    $pdf->Text(160,$x+10,$_POST["ivatext"]);
    $pdf->Text(140,$x+15,"Monto total"); 
    $pdf->Text(160,$x+15,$_POST["totalneto"]);
 
  $pdf->Output();
?>
