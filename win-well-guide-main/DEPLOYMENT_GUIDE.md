# Deployment Configuration Guide

This guide covers different ways to run and deploy the Store Analyzer API.

## Local Development

### Requirements
- Python 3.8+
- pip or conda
- Node.js 14+ (for frontend)

### Setup

```bash
# Backend
python -m venv venv
venv\Scripts\activate  # Windows or source venv/bin/activate on Mac/Linux
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your LOVABLE_API_KEY

# Start API (terminal 1)
python store_analyzer_api.py

# Frontend (terminal 2)
npm run dev  # or bun run dev
```

**Access**: 
- Frontend: `http://localhost:3000` (or Vite default)
- API: `http://localhost:5000`

## Docker Deployment

### Dockerfile

Create a `Dockerfile` in the project root:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY store_analyzer_api.py .

# Expose port
EXPOSE 5000

# Set environment
ENV FLASK_ENV=production

# Run application
CMD ["python", "store_analyzer_api.py"]
```

### Build and Run

```bash
# Build image
docker build -t store-analyzer-api .

# Run container
docker run -p 5000:5000 \
  -e LOVABLE_API_KEY=your_key_here \
  store-analyzer-api

# Or with env file
docker run -p 5000:5000 \
  --env-file .env \
  store-analyzer-api
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "5000:5000"
    environment:
      - LOVABLE_API_KEY=${LOVABLE_API_KEY}
      - FLASK_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://api:5000
    depends_on:
      - api
    restart: unless-stopped
```

Run with: `docker-compose up`

## Cloud Deployment

### Heroku

```bash
# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set LOVABLE_API_KEY=your_key_here

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### AWS (EC2)

```bash
# Connect to instance
ssh -i your-key.pem ec2-user@your-instance

# Install dependencies
sudo yum update -y
sudo yum install python3-pip -y
pip3 install -r requirements.txt

# Create systemd service
sudo nano /etc/systemd/system/store-analyzer.service
```

Content:
```ini
[Unit]
Description=Store Analyzer API
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/home/ec2-user/app
Environment="LOVABLE_API_KEY=your_key"
ExecStart=/usr/local/bin/python3 store_analyzer_api.py
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable store-analyzer
sudo systemctl start store-analyzer
```

### Google Cloud Run

```bash
# Deploy
gcloud run deploy store-analyzer \
  --source . \
  --platform managed \
  --region us-central1 \
  --set-env-vars LOVABLE_API_KEY=your_key_here
```

### Railway.app

```bash
# Connect repository and push
git push origin main
# Railway detects Python automatically
# Set LOVABLE_API_KEY in project variables
```

## Gunicorn (Production Server)

Instead of Flask development server:

```bash
# Install gunicorn
pip install gunicorn

# Run with gunicorn (8 workers)
gunicorn -w 8 -b 0.0.0.0:5000 store_analyzer_api:app

# Run with custom configuration
gunicorn -w 4 --worker-class eventlet -b 0.0.0.0:5000 store_analyzer_api:app
```

## Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

## Environment Configuration

### Development (.env)
```
FLASK_ENV=development
LOVABLE_API_KEY=your_test_key
PORT=5000
DEBUG=True
```

### Production (.env)
```
FLASK_ENV=production
LOVABLE_API_KEY=your_production_key
PORT=5000
DEBUG=False
MAX_CONTENT_LENGTH=16777216  # 16MB
```

## Performance Tuning

### Python API

1. **Worker Processes**: Use Gunicorn with multiple workers
   ```bash
   gunicorn -w 4 store_analyzer_api:app
   ```

2. **Connection Pooling**: Add connection pool for external requests
   ```python
   from requests.adapters import HTTPAdapter
   from urllib3.util.retry import Retry
   
   session = requests.Session()
   retry = Retry(total=3, backoff_factor=0.3)
   adapter = HTTPAdapter(max_retries=retry)
   session.mount('http://', adapter)
   session.mount('https://', adapter)
   ```

3. **Caching**: Implement Redis caching
   ```python
   from flask_caching import Cache
   cache = Cache(app, config={'CACHE_TYPE': 'redis'})
   ```

4. **Rate Limiting**: Add request rate limiting
   ```python
   from flask_limiter import Limiter
   limiter = Limiter(app, key_func=lambda: request.remote_addr)
   ```

### Database Optimization

If adding database:
```python
# Use connection pooling
from sqlalchemy.pool import QueuePool

app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'poolclass': QueuePool,
    'pool_size': 10,
    'pool_recycle': 3600,
    'pool_pre_ping': True,
}
```

## Monitoring & Logging

### Application Logging

```python
import logging
from logging.handlers import RotatingFileHandler

# Setup file logging
file_handler = RotatingFileHandler('logs/app.log', maxBytes=10240000, backupCount=10)
file_handler.setFormatter(logging.Formatter('%(asctime)s %(levelname)s: %(message)s'))
app.logger.addHandler(file_handler)
```

### Health Checks

The API includes `/health` endpoint for monitoring. Monitor with:
- Uptime monitoring services (UptimeRobot, Pingdom)
- Container orchestration health checks
- Application monitoring (New Relic, DataDog)

## Security in Production

1. **HTTPS**: Always use HTTPS
   ```nginx
   listen 443 ssl http2;
   ssl_certificate /path/to/cert.pem;
   ssl_certificate_key /path/to/key.pem;
   ```

2. **CORS**: Restrict to specific domains
   ```python
   CORS(app, origins=['https://yourdomain.com'])
   ```

3. **API Authentication**: Implement if needed
   ```python
   from flask import request
   
   def require_api_key(f):
       @wraps(f)
       def decorated_function(*args, **kwargs):
           api_key = request.headers.get('X-API-Key')
           if not api_key or api_key != os.getenv('API_KEY'):
               return {'error': 'Unauthorized'}, 401
           return f(*args, **kwargs)
       return decorated_function
   ```

4. **Rate Limiting**: Prevent abuse
   ```python
   @limiter.limit("100 per hour")
   @app.route('/api/analyze-store', methods=['POST'])
   def analyze_store():
       # Implementation
   ```

## Troubleshooting Deployments

| Issue | Solution |
|-------|----------|
| Port already in use | Change PORT in .env or kill process using port |
| Module not found | Verify all packages in requirements.txt are installed |
| API timeout on cloud | Increase timeout in cloud settings and code |
| CORS failures | Check frontend domain in CORS configuration |
| Out of memory | Reduce worker count or implement caching |

## Scaling Considerations

For high traffic:
1. Use load balancer (nginx, HAProxy)
2. Run multiple API instances
3. Implement request queuing
4. Add database caching layer
5. Use CDN for static files
6. Monitor resource usage

Example load balancer config:
```nginx
upstream store_analyzer {
    server 127.0.0.1:5001;
    server 127.0.0.1:5002;
    server 127.0.0.1:5003;
}

server {
    listen 80;
    location / {
        proxy_pass http://store_analyzer;
    }
}
```

## CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to production
        run: |
          # Your deployment commands here
```

---

Choose the deployment method that best fits your infrastructure and scaling needs.
