# Local preview server (no Node.js / Python required)
# Usage: powershell -ExecutionPolicy Bypass -File serve.ps1

$port = 8080
$root = $PSScriptRoot

$mimeMap = @{
  ".html" = "text/html; charset=utf-8"
  ".css"  = "text/css"
  ".js"   = "application/javascript"
  ".json" = "application/json"
  ".png"  = "image/png"
  ".jpg"  = "image/jpeg"
  ".svg"  = "image/svg+xml"
  ".txt"  = "text/plain; charset=utf-8"
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

Write-Host ""
Write-Host "Server started:" -ForegroundColor Green
Write-Host "  http://localhost:$port/"
Write-Host "  http://localhost:$port/weather.html"
Write-Host "Press Ctrl+C to stop"
Write-Host ""

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $path = $context.Request.Url.LocalPath
    if ($path -eq "/") { $path = "/index.html" }

    $relative = $path.TrimStart("/") -replace "/", "\"
    $file = Join-Path $root $relative

    if (Test-Path $file -PathType Leaf) {
      $bytes = [System.IO.File]::ReadAllBytes($file)
      $ext = [System.IO.Path]::GetExtension($file).ToLower()
      $mime = $mimeMap[$ext]
      if (-not $mime) { $mime = "application/octet-stream" }
      $context.Response.ContentType = $mime
      $context.Response.StatusCode = 200
      $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $context.Response.StatusCode = 404
      $notFound = "404 Not Found"
      $msg = [Text.Encoding]::UTF8.GetBytes($notFound)
      $context.Response.OutputStream.Write($msg, 0, $msg.Length)
    }
    $context.Response.Close()
  }
} finally {
  $listener.Stop()
}
