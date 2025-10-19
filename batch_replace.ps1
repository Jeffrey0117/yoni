# 批次替換 HTML 檔案中的連結
$files = Get-ChildItem -Recurse -Filter *.html
$count = 0

foreach ($file in $files) {
    $content = Get-Content -LiteralPath $file.FullName -Raw -Encoding UTF8
    $newContent = $content -replace 'href="html/demo9\.html"', 'href="search-results-grid.html"'
    
    if ($content -ne $newContent) {
        [System.IO.File]::WriteAllText($file.FullName, $newContent, [System.Text.UTF8Encoding]::new($false))
        Write-Host "Updated: $($file.Name)"
        $count++
    }
}

Write-Host ""
Write-Host "Total files updated: $count"