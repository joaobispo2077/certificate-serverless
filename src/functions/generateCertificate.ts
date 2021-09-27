import { document } from "src/utils/dynamodbClient";

interface ICreateCertificate {
  id: string;
  name: string;
  grade: string;
};

export const handler = async (event) => {
  const { id, name, grade } = JSON.parse(event.body) as ICreateCertificate;

  console.log(`Creating certificate into ${process.env.CERTIFICATES_TABLE}`);
  await document.put({
    TableName: process.env.CERTIFICATES_TABLE,
    Item: {
      id,
      name,
      grade,
    },
  }).promise();

  return {
    statusCode: 201,
    body: JSON.stringify({
      message: "Certificate created successfully",
    }),
  }
}
// document