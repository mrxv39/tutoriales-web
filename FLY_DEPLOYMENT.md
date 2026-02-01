# Fly.io SQLite Persistence Setup

## Overview
This configuration makes SQLite persistent on Fly.io using a volume mount.

## Volume Configuration

### 1. Create the Volume (One-time setup)
Before deploying, create a volume in your Fly.io app:

```bash
fly volumes create tutoriales_data --size 1 --region sin
```

**Notes:**
- Volume name: `tutoriales_data` (matches fly.toml `source`)
- Size: 1GB (adjustable based on needs)
- Region: `sin` (matches your app's primary_region in fly.toml)
- This command only needs to be run ONCE per region

### 2. Deploy the Application
```bash
fly deploy
```

### 3. Verify Persistence (Smoke Check)
After deployment, verify the volume is mounted and working:

```bash
# SSH into your deployed app
fly ssh console

# Check volume is mounted
ls -la /data

# Check database file exists (will be created on first run)
ls -la /data/app.db

# Exit
exit
```

**Expected output:**
- `/data` directory should exist
- `/data/app.db` should exist after the app starts
- If missing, check logs: `fly logs`

## How It Works

### Development vs Production
- **Development**: Database stored in `./data/app.db` (local filesystem)
- **Production**: Database stored in `/data/app.db` (Fly.io volume)

The app uses `/data` if `/data` exists or if `FLY_APP_NAME` is set; otherwise it uses `./data`

### Volume Persistence
- The volume mount at `/data` persists across deployments
- Database survives app restarts and redeployments
- Data is stored on Fly.io's infrastructure
- Volume is tied to a specific region

## Important Notes

### Multi-Region Deployments
⚠️ **SQLite is NOT suitable for multi-region deployments** because:
- Each region would need its own volume
- Volumes don't sync across regions
- This can lead to data inconsistency

For multi-region apps, consider:
- PostgreSQL (Fly.io Postgres)
- Distributed databases
- Primary region with read replicas

### Backup Strategy
To backup your database:
```bash
# SSH into your Fly.io instance
fly ssh console

# Inside the container, copy the database
cat /data/app.db > backup.db
exit

# Or use fly sftp to download
fly sftp get /data/app.db ./backup.db
```

### Volume Management
```bash
# List volumes
fly volumes list

# Show volume details
fly volumes show tutoriales_data

# Delete volume (⚠️ destroys data)
fly volumes delete tutoriales_data
```

## Troubleshooting

### Volume Not Mounted
If the volume isn't mounting:
1. Verify volume exists: `fly volumes list`
2. Check volume region matches app region
3. Ensure volume name in fly.toml matches created volume

### Permission Issues
If you get permission errors:
```dockerfile
# Add to Dockerfile before CMD
RUN chmod 755 /data
```

### Database Locked Errors
- Ensure only one instance is running in the region
- SQLite doesn't support multiple writers well
- Consider `auto_start_machines = true` and `min_machines_running = 0` (already configured)

## Migration from Existing Deployment

If you already have a deployed app without a volume:

1. Create the volume: `fly volumes create tutoriales_data --size 1 --region sin`
2. Update fly.toml (already done)
3. Deploy: `fly deploy`
4. The app will start with a fresh database in the volume
