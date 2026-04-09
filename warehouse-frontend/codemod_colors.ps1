$root = Resolve-Path '..'
$frontend = Join-Path $root 'warehouse-frontend'
$targets = @()
$targets += Get-ChildItem -Path (Join-Path $frontend 'src') -Recurse -File -Filter *.tsx -ErrorAction SilentlyContinue
$targets += Get-ChildItem -Path (Join-Path $frontend 'app') -Recurse -File -Filter *.tsx -ErrorAction SilentlyContinue
$targets = $targets | Sort-Object FullName -Unique

$repls = [ordered]@{
  'focus:border-[#f0c040]'='focus:border-[var(--role-admin)]'; 'bg-[#f0c040]'='bg-[var(--role-admin)]'; 'text-[#f0c040]'='text-[var(--role-admin)]'; 'border-[#f0c040]'='border-[var(--role-admin)]';
  'bg-[#4af0a0]'='bg-[var(--role-manager)]'; 'text-[#4af0a0]'='text-[var(--role-manager)]'; 'border-[#4af0a0]'='border-[var(--role-manager)]';
  'bg-[#4aa0f0]'='bg-[var(--role-customer)]'; 'text-[#4aa0f0]'='text-[var(--role-customer)]'; 'border-[#4aa0f0]'='border-[var(--role-customer)]';
  'bg-[#2f4f2f]'='bg-[var(--color-success)]'; 'border-[#2f4f2f]'='border-[var(--color-success)]'; 'text-[#8fe38f]'='text-[var(--color-success)]';
  'bg-[#5a1f1f]'='bg-[var(--color-error)]'; 'border-[#5a1f1f]'='border-[var(--color-error)]'; 'text-[#ff9f9f]'='text-[var(--color-error)]';
  'bg-[#4b3f21]'='bg-[var(--color-warning)]'; 'border-[#4b3f21]'='border-[var(--color-warning)]'; 'text-[#f0c978]'='text-[var(--color-warning)]';
  'bg-[#24405a]'='bg-[var(--color-info)]'; 'border-[#24405a]'='border-[var(--color-info)]'; 'text-[#8ecfff]'='text-[var(--color-info)]';
  'bg-[#0a0a0a]'='bg-black'; 'bg-[#101010]'='bg-gray-950'; 'bg-[#111]'='bg-gray-950'; 'bg-[#0f0f0f]'='bg-gray-950'; 'bg-[#0d0d0d]'='bg-gray-950'; 'bg-[#0b0b0b]'='bg-black';
  'border-[#1a1a1a]'='border-gray-900'; 'border-[#1b1b1b]'='border-gray-900'; 'border-[#1c1c1c]'='border-gray-900'; 'border-[#222]'='border-gray-800'; 'border-[#2a2a2a]'='border-gray-800'; 'border-[#2b2b2b]'='border-gray-800'; 'border-[#3a3a3a]'='border-gray-700';
  'text-[#333]'='text-gray-700'; 'text-[#555]'='text-gray-500'; 'text-[#666]'='text-gray-500'; 'text-[#777]'='text-gray-400'; 'text-[#888]'='text-gray-400'; 'text-[#aaa]'='text-gray-300'; 'text-[#bbb]'='text-gray-300'; 'text-[#ccc]'='text-gray-200'; 'text-[#ddd]'='text-gray-200'; 'text-[#d7d7d7]'='text-gray-200'; 'text-[#d8d8d8]'='text-gray-200'
}
$roleRepls = [ordered]@{ '"#f0c040"'='"var(--role-admin)"'; '"#4af0a0"'='"var(--role-manager)"'; '"#4aa0f0"'='"var(--role-customer)"' }

$total = 0
$changed = New-Object System.Collections.Generic.List[string]
foreach($f in $targets){
  $path = $f.FullName
  $old = [IO.File]::ReadAllText($path)
  $new = $old
  $fileCount = 0
  foreach($k in $repls.Keys){
    $c = ([regex]::Matches($new,[regex]::Escape($k))).Count
    if($c -gt 0){ $new = $new.Replace($k,$repls[$k]); $fileCount += $c; $total += $c }
  }
  if($path -match '\\app\\' -and $path -match '(profile|wrapper)'){
    foreach($k in $roleRepls.Keys){
      $c = ([regex]::Matches($new,[regex]::Escape($k))).Count
      if($c -gt 0){ $new = $new.Replace($k,$roleRepls[$k]); $fileCount += $c; $total += $c }
    }
  }
  if($new -ne $old){ [IO.File]::WriteAllText($path,$new); $changed.Add(($path -replace [regex]::Escape(($root.Path+'\')),'')) | Out-Null }
}
'CHANGED_FILES'
$changed | Sort-Object
'TOTAL_REPLACEMENTS'
$total
'FILES_CHANGED_COUNT'
$changed.Count