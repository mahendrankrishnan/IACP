# Quick Webhook Test Script
# Creates a webhook and tests it

$API_URL = "http://localhost:4501"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Quick Webhook Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Get webhook URL
Write-Host "Step 1: Get a webhook URL" -ForegroundColor Yellow
Write-Host "Visit https://webhook.site and copy your unique URL" -ForegroundColor Gray
Write-Host "Or press Enter to use a test URL (won't actually receive webhooks)" -ForegroundColor Gray
Write-Host ""
$webhookUrl = Read-Host "Enter webhook URL (or press Enter to skip)"

if ([string]::IsNullOrWhiteSpace($webhookUrl)) {
    Write-Host "Skipping webhook creation. You can create one manually later." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To create a webhook manually:" -ForegroundColor Cyan
    Write-Host "  POST $API_URL/api/webhooks" -ForegroundColor Gray
    Write-Host "  Body: {`"url`": `"YOUR-URL`", `"eventType`": `"login`", `"isActive`": true}" -ForegroundColor Gray
    exit 0
}

# Step 2: Create webhook
Write-Host ""
Write-Host "Step 2: Creating webhook..." -ForegroundColor Yellow

$webhookData = @{
    url = $webhookUrl
    eventType = "login"
    isActive = $true
} | ConvertTo-Json

try {
    $result = Invoke-RestMethod -Uri "$API_URL/api/webhooks" -Method Post -Body $webhookData -ContentType "application/json"
    Write-Host "[OK] Webhook created successfully!" -ForegroundColor Green
    Write-Host "  ID: $($result.webhook.id)" -ForegroundColor Gray
    Write-Host "  URL: $($result.webhook.url)" -ForegroundColor Gray
    $webhookId = $result.webhook.id
} catch {
    Write-Host "[ERROR] Failed to create webhook: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 3: List webhooks
Write-Host ""
Write-Host "Step 3: Verifying webhook exists..." -ForegroundColor Yellow
try {
    $webhooks = Invoke-RestMethod -Uri "$API_URL/api/webhooks" -Method Get
    $activeLoginWebhooks = $webhooks.webhooks | Where-Object { $_.eventType -eq "login" -and $_.isActive -eq $true }
    Write-Host "[OK] Found $($activeLoginWebhooks.Count) active login webhook(s)" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Failed to list webhooks: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 4: Test login
Write-Host ""
Write-Host "Step 4: Testing login (this will trigger webhook)..." -ForegroundColor Yellow
Write-Host "Enter your test credentials:" -ForegroundColor Gray
$email = Read-Host "Email"
$phone = Read-Host "Phone"
$password = Read-Host "Password" -AsSecureString
$passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

$loginData = @{
    email = $email
    phone = $phone
    password = $passwordPlain
} | ConvertTo-Json

try {
    Write-Host "Sending login request..." -ForegroundColor Gray
    $loginResponse = Invoke-RestMethod -Uri "$API_URL/api/auth/login" -Method Post -Body $loginData -ContentType "application/json"
    Write-Host "[OK] Login successful!" -ForegroundColor Green
    Write-Host "  User: $($loginResponse.user.username)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "[OK] Webhook should have been triggered!" -ForegroundColor Green
    Write-Host "  Check your webhook endpoint ($webhookUrl) for the received request" -ForegroundColor Yellow
    Write-Host "  Or check backend logs for: [Webhook] messages" -ForegroundColor Yellow
} catch {
    Write-Host "[ERROR] Login failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "  Error: $($errorDetails.error)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Test Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

