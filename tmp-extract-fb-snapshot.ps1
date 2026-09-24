$source = 'C:\Users\65966\AppData\Roaming\Code\User\workspaceStorage\f9c46dfa836271efc4face544adc6f90\GitHub.copilot-chat\chat-session-resources\2023ceb6-5eaf-4ea5-8a9a-f1332d931d28\call_eFelyavpb7MfnDnCCtLSQAp5__vscode-1790207623475\content.txt'
$lines = Get-Content -Encoding UTF8 $source
$start = ($lines | Select-String 'generic \[ref=e771\]').LineNumber
$end = ($lines | Select-String 'generic \[ref=e887\]').LineNumber
$body = $lines[($start - 1)..($end - 1)] | ForEach-Object {
  if ($_ -match '^\s+- (?:generic|text): (.*)$') { $Matches[1] }
} | Where-Object { $_ -and $_ -notmatch '^https?://' }
$body -join "`n" | Set-Content -Encoding UTF8 'tmp-school-snapshot.txt'
Write-Output "lines=$($body.Count) chars=$(($body -join "`n").Length)"
