# Event Seating API - Backend

High-performance Express.js API with advanced caching and rate limiting.

## Architecture

- **LRU Cache** with 60s TTL and automatic cleanup
- **Rate Limiting** with burst handling (10/min, 5/10s burst)
- **Request Queue** for managing concurrent DB operations
- **TypeScript strict mode** for type safety

## Features

- LRU cache with statistics tracking
- Sophisticated rate limiting (per-minute + burst)
- Asynchronous request queue
- Duplicate request deduplication
- Manual cache management
- Performance metrics tracking

## Setup
```bash
pnpm install
pnpm dev
```

## API Endpoints

- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user
- `GET /users/cache/status` - Cache statistics
- `DELETE /users/cache` - Clear cache

## Caching Strategy

- LRU eviction when max size reached
- 60-second TTL per entry
- Background cleanup every 30s
- Concurrent request deduplication

## Rate Limiting

- 10 requests/minute per IP
- 5 requests/10 seconds burst capacity
- Returns 429 with retry-after header

## Testing

If you'd like to include a Postman collection, export it from Postman and add it to this repo (for example `docs/postman_collection.json`). Meanwhile, here are working `curl` commands you can run locally. Make sure the server is running (default: `http://localhost:3000`).

```bash
# Get user by ID
curl http://localhost:3000/users/1

# Create new user
curl -X POST http://localhost:3000/users \
	-H "Content-Type: application/json" \
	-d '{"name":"Bob Wilson","email":"bob@example.com"}'

# Check cache status
curl http://localhost:3000/users/cache/status

# Clear cache
curl -X DELETE http://localhost:3000/users/cache
```