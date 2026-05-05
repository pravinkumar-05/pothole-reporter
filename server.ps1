$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:5500/")
$listener.Start()
Write-Host "Server running at http://localhost:5500/"

$mimeTypes = @{
    ".html" = "text/html"
    ".css"  = "text/css"
    ".js"   = "application/javascript"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".svg"  = "image/svg+xml"
    ".json" = "application/json"
    ".ico"  = "image/x-icon"
    ".webp" = "image/webp"
}

$root = $PSScriptRoot

while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $path = $ctx.Request.Url.LocalPath
    if ($path -eq "/") { $path = "/index.html" }
    $file = Join-Path $root $path.Replace("/", "\")
    if (Test-Path $file) {
        $ext = [System.IO.Path]::GetExtension($file)
        $mime = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
        $ctx.Response.ContentType = $mime
        $bytes = [System.IO.File]::ReadAllBytes($file)
        $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
        $ctx.Response.StatusCode = 404
        $bytes = [System.Text.Encoding]::UTF8.GetBytes("Not Found")
        $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    }
    $ctx.Response.Close()
}
