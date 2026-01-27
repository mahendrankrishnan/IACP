# Quick script to create a webhook

$API_URL = "http://localhost:4501"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Create Webhook" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Option 1: Use webhook.site (Recommended for testing)" -ForegroundColor Yellow
Write-Host "  1. Visit https://webhook.site" -ForegroundColor Gray
Write-Host "  2. Copy your unique URL" -ForegroundColor Gray
Write-Host ""
Write-Host "Option 2: Use your own webhook endpoint" -ForegroundColor Yellow
Write-Host "  Enter your webhook URL" -ForegroundColor Gray
Write-Host ""

$webhookUrl = Read-Host "Enter webhook URL"

if ([string]::IsNullOrWhiteSpace($webhookUrl)) {
    Write-Host "[ERROR] Webhook URL is required!" -ForegroundColor Red
    exit 1
}

# Create login webhook
Write-Host ""
Write-Host "Creating login webhook..." -ForegroundColor Yellow

$loginWebhook = @{
    url = $webhookUrl
    eventType = "login"
    isActive = $true
} | ConvertTo-Json

try {
    $result = Invoke-RestMethod -Uri "$API_URL/api/webhooks" -Method Post -Body $loginWebhook -ContentType "application/json"
    Write-Host "[OK] Login webhook created successfully!" -ForegroundColor Green
    Write-Host "  ID: $($result.webhook.id)" -ForegroundColor Gray
    Write-Host "  URL: $($result.webhook.url)" -ForegroundColor Gray
    Write-Host "  Event: $($result.webhook.eventType)" -ForegroundColor Gray
    Write-Host "  Active: $($result.webhook.isActive)" -ForegroundColor Gray
} catch {
    Write-Host "[ERROR] Failed to create webhook: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "  Details: $($errorDetails.error)" -ForegroundColor Red
    }
    exit 1
}

# Ask about logout webhook
Write-Host ""
$createLogout = Read-Host "Create logout webhook too? (y/n)"

if ($createLogout -eq "y" -or $createLogout -eq "Y") {
    Write-Host "Creating logout webhook..." -ForegroundColor Yellow
    
    $logoutWebhook = @{
        url = $webhookUrl
        eventType = "logout"
        isActive = $true
    } | ConvertTo-Json
    
    try {
        $result = Invoke-RestMethod -Uri "$API_URL/api/webhooks" -Method Post -Body $logoutWebhook -ContentType "application/json"
        Write-Host "[OK] Logout webhook created successfully!" -ForegroundColor Green
        Write-Host "  ID: $($result.webhook.id)" -ForegroundColor Gray
    } catch {
        Write-Host "[ERROR] Failed to create logout webhook: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Next Steps" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Test login - webhooks should now trigger!" -ForegroundColor Yellow
Write-Host "2. Check your webhook endpoint for received requests" -ForegroundColor Yellow
Write-Host "3. View all webhooks: GET $API_URL/api/webhooks" -ForegroundColor Yellow
Write-Host ""

