# PPBO Gim Project
Gim virtual tour dari Capstone Project kelas Praktikum PBO 2025.
- Isomorphic 2D JS Engine Game (PixiJs)
- Showroom project
- OAuth Google
- Voting system by Untan email & Leaderboard
- Quiz OOP

## Database
- users (id, name, email, picture, created_at)
- pojects (id, title, description, image, link_web, link_vid_pitch, link_vid_demo, link_repo)
- teams (project_id, user_id, role)
- ratings (user_id, project_id, rate, created_at)

## Config
- Setup Google Auth:
  - APIs & Services → OAuth consent screen 
  - APIs & Services → Credentials → Create Credentials → OAuth Client ID
  - Client Web App (+Authorize Redirect URI)
- Setup Server PHP & Database (MySQL)
- JWT Secret (32 - 64 random): 
  - Linux/MacOS: `openssl rand -hex 32`
  - Powersheel: `[guid]::NewGuid()`
  
## Run
```bash
php -S localhost:8080 -t public
``` 