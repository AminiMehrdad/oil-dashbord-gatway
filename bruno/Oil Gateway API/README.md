# Bruno Collection - Oil Gateway API

This collection is prepared for frontend developers to manually test the GraphQL gateway.

## Setup

1. Open Bruno.
2. Select **Open Collection**.
3. Choose `bruno/Oil Gateway API`.
4. Select the `Local` environment.
5. Set `baseUrl`, `accessToken`, and `refreshToken`.

## Recommended Flow

1. Run `Auth/Create User` if a test user does not exist.
2. Run `Auth/Login`.
3. Copy `accessToken` and `refreshToken` from the login response into the `Local` environment.
4. Run Dashboard, Wells, and Production requests.
5. Run `Auth/Logout` when testing sign out.

## Frontend Contract

- Endpoint: `POST {{baseUrl}}/graphql`
- Auth header: `Authorization: Bearer {{accessToken}}`
- Public operations: `createUser`, `login`
- Protected operations: dashboard, wells, production, `logout`
- If `errors` exists in the GraphQL response, treat the request as failed even when HTTP status is `200`.

## Notes for Workers

The gateway does not own business data. It forwards GraphQL operations to RabbitMQ routing keys documented in the main `README.md`. If Bruno returns a GraphQL error from a protected endpoint, check the token first, then check that RabbitMQ and the backend worker are running.
