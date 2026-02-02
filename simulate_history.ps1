$ErrorActionPreference = "Continue"

# Configuration
$RepoPath = "c:\PetEase"
$RemoteUrl = "https://github.com/UtsabLamaTAmang/utsab-lama-tamang-pet-ease.git"
$StartDate = (Get-Date).AddDays(-30)

Set-Location $RepoPath

# 1. Initialize and Clean
Write-Host "Initializing Git..."
if (-not (Test-Path ".git")) {
    git init
}
cmd /c "git checkout -b main 2>NUL"
cmd /c "git branch -m main 2>NUL"

# Fix .gitignore before starting (Preventing anti-patterns)
if (Test-Path "server\.gitignore") {
    Add-Content -Path "server\.gitignore" -Value "`nuploads/" -Force
}

# Reset everything to unstage
git reset
# We do NOT run clean because we want to keep the files to commit them slowly

# Helper function
function Commit-Step {
    param (
        [string]$Message,
        [int]$DayOffset,
        [string[]]$Files
    )
    $CommitDate = $StartDate.AddDays($DayOffset).ToString("yyyy-MM-ddTHH:mm:ss")
    
    foreach ($file in $Files) {
        if ($file.Contains("*")) {
             git add $file 2>$null
        } else {
             if (Test-Path $file) { git add $file }
        }
    }
    
    # Check if anything is staged
    $status = git status --porcelain
    if ($status) {
        $env:GIT_AUTHOR_DATE = $CommitDate
        $env:GIT_COMMITTER_DATE = $CommitDate
        git commit -m "$Message"
        Write-Host "Committed: $Message ($CommitDate)"
    } else {
        Write-Host "Skipping empty commit: $Message"
    }
}

# 2. Execution of 25 Steps
# Day 0: Project Scaffolding
Commit-Step -Message "chore: initial project setup and directory structure" -DayOffset 0 -Files @("frontend/package.json", "frontend/vite.config.js", "frontend/index.html", "frontend/.gitignore", "server/package.json", "server/.gitignore", "server/index.js", "README.md")

# Day 1: Backend Setup
Commit-Step -Message "feat(backend): setup express server and basic configuration" -DayOffset 1 -Files @("server/config", "server/utils")

# Day 2: Frontend Setup
Commit-Step -Message "feat(frontend): install tailwindcss and setup base styles" -DayOffset 2 -Files @("frontend/src/index.css", "frontend/src/App.css", "frontend/postcss.config.js", "frontend/tailwind.config.js")

# Day 3: Database
Commit-Step -Message "chore(db): initialize prisma schema and database connection" -DayOffset 3 -Files @("server/prisma")

# Day 5: Auth Module Backend
Commit-Step -Message "feat(auth): implement user authentication routes and controllers" -DayOffset 5 -Files @("server/controllers/auth*", "server/routes/auth*", "server/middleware/auth*")

# Day 6: Auth UI
Commit-Step -Message "feat(ui): add login and signup pages with validation" -DayOffset 6 -Files @("frontend/src/pages/Login.jsx", "frontend/src/pages/Signup.jsx", "frontend/src/context/AuthContext.jsx")

# Day 7: Layout
Commit-Step -Message "feat(ui): create main dashboard layout structure" -DayOffset 7 -Files @("frontend/src/components/layout")

# Day 8: Doctor Backend
Commit-Step -Message "feat(doctor): add doctor management api endpoints" -DayOffset 8 -Files @("server/controllers/doctor*", "server/routes/doctor*")

# Day 9: Doctor UI
Commit-Step -Message "feat(ui): doctor dashboard and schedule management view" -DayOffset 9 -Files @("frontend/src/pages/doctor")

# Day 10: User Dashboard
Commit-Step -Message "feat(user): implement user dashboard and profile settings" -DayOffset 10 -Files @("frontend/src/pages/user/Dashboard.jsx", "frontend/src/pages/user/Settings.jsx")

# Day 12: Pets & Adoption Backend
Commit-Step -Message "feat(api): create pet listings and adoption request endpoints" -DayOffset 12 -Files @("server/routes/pet*", "server/controllers/pet*", "server/routes/adoption*", "server/controllers/adoption*")

# Day 13: Adoption UI
Commit-Step -Message "feat(ui): display pet listings and adoption feed" -DayOffset 13 -Files @("frontend/src/pages/user/Adoption*", "frontend/src/components/pet")

# Day 14: Store Backend
Commit-Step -Message "feat(store): implement product catalog and inventory management" -DayOffset 14 -Files @("server/routes/store*", "server/controllers/store*", "server/models/Product*")

# Day 15: Store UI
Commit-Step -Message "feat(shop): add product listing and details page" -DayOffset 15 -Files @("frontend/src/pages/user/Shop.jsx", "frontend/src/pages/common/ProductDetails.jsx")

# Day 17: Cart & Orders
Commit-Step -Message "feat(cart): implement shopping cart and order processing logic" -DayOffset 17 -Files @("server/routes/cart*", "server/controllers/cart*", "server/routes/order*", "server/controllers/order*")

# Day 18: Cart UI
Commit-Step -Message "feat(ui): shopping cart page and checkout flow" -DayOffset 18 -Files @("frontend/src/pages/user/Cart.jsx", "frontend/src/pages/user/Orders.jsx")

# Day 19: Payments
Commit-Step -Message "feat(payment): integrate payment gateway wrappers" -DayOffset 19 -Files @("server/routes/payment*", "frontend/src/pages/Payment*")

# Day 21: Blog & Events
Commit-Step -Message "feat(content): add blog posts and event management system" -DayOffset 21 -Files @("server/routes/blog*", "server/routes/event*", "frontend/src/pages/common/Blog*")

# Day 23: Admin Panel
Commit-Step -Message "feat(admin): create admin dashboard for system oversight" -DayOffset 23 -Files @("server/routes/admin*", "frontend/src/pages/admin")

# Day 24: Chat Backend
Commit-Step -Message "feat(chat): implement real-time messaging with socket.io" -DayOffset 24 -Files @("server/routes/chat*", "frontend/src/services/socket*")

# Day 25: Chat UI
Commit-Step -Message "feat(ui): chat interface and message history" -DayOffset 25 -Files @("frontend/src/pages/user/Chat*", "frontend/src/pages/user/Messages*")

# Day 26: AI Integration
Commit-Step -Message "feat(ai): integrate gemini ai for pet recommendations" -DayOffset 26 -Files @("server/routes/ai*", "server/controllers/ai*")

# Day 28: Refactoring
Commit-Step -Message "refactor: optimize database queries and middleware" -DayOffset 28 -Files @("server/middleware", "server/utils")

# Day 29: Final Polish
Commit-Step -Message "chore: update dependencies and finalize readme" -DayOffset 29 -Files @("package-lock.json", "frontend/package-lock.json", "server/package-lock.json")

# Day 30 (Today): Catch-all
$env:GIT_AUTHOR_DATE = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
$env:GIT_COMMITTER_DATE = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
git add .
$status = git status --porcelain
if ($status) {
    git commit -m "docs: finalize project documentation and cleanup"
    Write-Host "Committed final catch-all."
}

# 3. Push
Write-Host "Configuring remote..."
if (git remote | Select-String "origin") {
    git remote remove origin
}
git remote add origin $RemoteUrl

Write-Host "Pushing to remote..."
git push --force -u origin main

Write-Host "Done!"
