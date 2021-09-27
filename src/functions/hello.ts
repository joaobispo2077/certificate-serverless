export const handle = (event) => {
  return {
    statusCode: 200,
    body: { message: `Hello ${event.pathParameters.name}!`},
    headers: {
      'Content-Type': 'application/json'
    }
  }
};