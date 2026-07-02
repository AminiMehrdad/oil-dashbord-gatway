# Oil Project Gateway

NestJS GraphQL gateway for the Oil Project Dashboard. This service exposes GraphQL queries, mutations, and subscriptions for the frontend, then communicates with backend workers through RabbitMQ request/reply routing keys.

## Features

- GraphQL API using NestJS Apollo driver
- Authentication mutations for user creation, login, and logout
- Dashboard, well, and production data queries
- Realtime `latestDataUpdated` GraphQL subscription
- RabbitMQ request/reply integration for worker communication
- Unit and e2e test coverage with mocked service dependencies

## Tech Stack

- Node.js and TypeScript
- NestJS 11
- GraphQL / Apollo
- RabbitMQ / AMQP
- Jest and Supertest
- Bruno for API documentation and manual testing

## Requirements

- Node.js LTS is recommended. Avoid Node.js 23 for production unless your full stack is tested against it.
- npm
- RabbitMQ for running the real application
- Bruno desktop app or CLI for manual API testing

## Environment

Create or update `.env` in the project root:

```env
PORT=5000
RABBITMQ_URL=amqp://admin:admin123@localhost:5672
```

## Install

```bash
npm install
```

## Run

```bash
# Development
npm run start:dev

# Production build
npm run build
npm run start:prod
```

The GraphQL endpoint is available at:

```text
http://localhost:5000/graphql
```

## API Overview

### Public Mutations

- `createUser(createUserInput: CreateUserInput!): CreatedUser!`
- `login(loginInput: LoginInput!): AuthPayload!`

### Authenticated Mutation

- `logout(refresh: String!): LogOutUser!`

### Dashboard Queries

- `getLatestData: LatestData!`
- `getDate: LastTime!`
- `getLatest30day: Latest30Day!`
- `getLast30dayName: last30DayName!`
- `getWellsData: [WellProduction!]!`
- `getWellData(id: Int!): [WellData!]`
- `getWellPage: [WellPage!]`

### Production Queries

- `getSummeryGrid(history: String!): [SummeryGrid!]!`
- `getProductionChart(history: String!): ProductionChart!`
- `getFildCompare(history: String!): [FildCompear!]!`

### Subscription

- `latestDataUpdated: RealtimePayload!`

## RabbitMQ Routing Keys

The gateway sends requests to backend workers with these routing keys:

| Feature | Routing key | Payload |
| --- | --- | --- |
| Create user | `auth.createUser` | `CreateUserInput` |
| Login | `auth.login` | `{ username, password }` |
| Logout | `auth.logout` | `{ refresh }` |
| Well data by id | `data.id` | `{ id }` |
| Last data time | `data.time` | `{}` |
| Latest data | `data.latest` | `{}` |
| Latest 30 days | `data.30latest` | `{}` |
| Last 30 days by name | `data.30lastbyname` | `{}` |
| All wells | `data.allwells` | `{}` |
| Well page | `data.wellpage` | `{}` |
| Summary grid | `data.summrygrid` | `{ history }` |
| Production chart | `data.productionchart` | `{ history }` |
| Field comparison | `data.comparion` | `{ history }` |

Realtime worker events are consumed from `gateway.*` and published to the GraphQL subscription `latestDataUpdated`.

## Testing

The test suite does not require RabbitMQ. Unit tests mock resolver/service dependencies, and e2e tests start an in-memory Nest GraphQL application with mocked services.

### Unit Tests

Run all unit tests:

```bash
npm test
```

Run one test file:

```bash
npm test -- auth.resolver.spec.ts
```

Run coverage:

```bash
npm run test:cov
```

### E2E Tests

Run e2e tests:

```bash
npm run test:e2e
```

The e2e tests call `/graphql` with real GraphQL operations, but mocked service providers return fixed responses. This verifies the GraphQL schema, resolver wiring, argument names, and response shape without requiring RabbitMQ.

### Lint and Format

```bash
npm run lint
npm run format
```

## Bruno Manual Testing

A Bruno collection is available in:

```text
bruno/Oil Gateway API
```

Open this folder in Bruno and set the environment variables:

| Variable | Example |
| --- | --- |
| `baseUrl` | `http://localhost:5000` |
| `accessToken` | Access token returned by `login` |
| `refreshToken` | Refresh token returned by `login` |

Recommended frontend workflow:

1. Run `Create User` if you need a test account.
2. Run `Login` and copy `accessToken` and `refreshToken` into the Bruno environment.
3. Run dashboard and production queries with `Authorization: Bearer {{accessToken}}`.
4. Run `Logout` with `refreshToken` when the user signs out.

## Frontend Integration Notes

- Send all GraphQL requests to `POST /graphql`.
- Use `Authorization: Bearer <accessToken>` for protected queries and mutations.
- Store `refreshToken` securely and use it only for auth refresh/logout flows.
- The current public operations are `createUser` and `login`.
- The frontend should treat GraphQL `errors` as failed operations even when HTTP status is `200`.

## Project Structure

```text
src/resolvers   GraphQL resolvers
src/services    RabbitMQ-backed application services
src/models      GraphQL object and input models
src/auth        Guards, decorators, and auth interceptors
test            E2E tests
bruno           Bruno API collection for frontend/manual testing
```
