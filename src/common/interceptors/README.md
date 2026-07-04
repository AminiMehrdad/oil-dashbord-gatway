# Logging Interceptor

## Overview

The `LoggingInterceptor` captures and logs all incoming requests and outgoing responses for both HTTP and GraphQL endpoints in your NestJS application.

## Features

### 📥 Incoming Request Logging

- **GraphQL Requests**: Logs operation type (query/mutation/subscription), operation name, arguments, user ID, and IP address
- **HTTP Requests**: Logs method, URL, request body, IP address, and user agent

### 📤 Outgoing Response Logging

- Logs response data (truncated to 200 characters for readability)
- Tracks request duration in milliseconds
- Includes HTTP status codes for REST endpoints

### ❌ Error Logging

- Captures and logs errors with full stack traces
- Tracks duration even for failed requests
- Provides detailed error messages

## Log Levels

The interceptor uses different log levels:

- `log`: For successful requests/responses
- `debug`: For detailed information (args, body, response data)
- `error`: For errors and exceptions

## Example Output

### GraphQL Query

```
📥 [INCOMING GraphQL] QUERY Query.getWells
   User: user123 | IP: 192.168.1.1
   Args: {"limit":10,"offset":0}
📤 [OUTGOING GraphQL] QUERY Query.getWells - 45ms
   Response: {"data":[{"id":"1","name":"Well A"}...
```

### HTTP Request

```
📥 [INCOMING HTTP] GET /api/health
   IP: 192.168.1.1 | User-Agent: Mozilla/5.0...
📤 [OUTGOING HTTP] GET /api/health - 200 - 12ms
   Response: {"status":"ok"}
```

### Error

```
📥 [INCOMING GraphQL] MUTATION Mutation.updateWell
   User: user123 | IP: 192.168.1.1
   Args: {"id":"123","data":{...}}
❌ [ERROR GraphQL] MUTATION Mutation.updateWell - 156ms
   Error: Well not found
   Stack: Error: Well not found at ...
```

## Configuration

The interceptor is registered globally in `app.module.ts`:

```typescript
{
  provide: APP_INTERCEPTOR,
  useClass: LoggingInterceptor,
}
```

## Customization

To adjust logging behavior:

1. **Change log level**: Modify the logger calls in the interceptor
2. **Filter sensitive data**: Add logic to redact passwords, tokens, etc.
3. **Adjust response truncation**: Change the `substring(0, 200)` value
4. **Add custom metadata**: Extend the logging methods with additional context

## Performance

The interceptor adds minimal overhead:

- Uses RxJS `tap` operator for non-blocking logging
- Truncates large responses to prevent memory issues
- Logs debug information only when needed

## Security Considerations

⚠️ **Important**: This interceptor logs request arguments and response data. Be careful with:

- Passwords and authentication tokens
- Personal identifiable information (PII)
- Sensitive business data

Consider adding filters for sensitive fields before deploying to production.
