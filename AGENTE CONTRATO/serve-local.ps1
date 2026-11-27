$port = 8090
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$filePath = Join-Path $root "abrir-directo.html"

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

Write-Host "LEXAURA listo en http://localhost:$port/"

while ($listener.IsListening) {
  $context = $listener.GetContext()
  $response = $context.Response
  $bytes = [System.IO.File]::ReadAllBytes($filePath)
  $response.ContentType = "text/html; charset=utf-8"
  $response.ContentLength64 = $bytes.Length
  $response.OutputStream.Write($bytes, 0, $bytes.Length)
  $response.OutputStream.Close()
}
