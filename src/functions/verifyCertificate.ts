import { APIGatewayProxyHandler } from "aws-lambda";
import { document } from "src/utils/dynamodbClient";

export const handler: APIGatewayProxyHandler= async (event) => {
  const { id } = event.pathParameters;

  const { CERTIFICATE_BUCKET, CERTIFICATES_TABLE } = process.env;

  const response = await document.query({
    TableName: process.env.CERTIFICATES_TABLE,
    KeyConditionExpression: "id = :id",
    ExpressionAttributeValues: {
      ":id": id
    }
  }).promise();

  const userCertificate = response.Items[0];

  if (userCertificate) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Certificate found",
        name: userCertificate.name,
        url: `https://${CERTIFICATE_BUCKET}.s3.amazonaws.com/certificates/${userCertificate.id}.pdf`,
      })
    };
  }

  return {
    statusCode: 404,
    body: JSON.stringify({
      message: "Certificate not found"
    })
  };
};