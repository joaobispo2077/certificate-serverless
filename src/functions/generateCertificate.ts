import { document } from "src/utils/dynamodbClient";
import chromium from 'chrome-aws-lambda';

import path from 'path';
import fs from 'fs';
import handlebars from 'handlebars';
import { s3bucketClient } from "src/utils/s3bucketClient";

interface ICreateCertificate {
  id: string;
  name: string;
  grade: string;
};

interface ITemplate {
  id: string;
  name: string;
  grade: string;
  date: string;
  medal: string;
}

const compileTemplate = async (template: ITemplate) => {
  const templatePath = path.join(process.cwd(), 'src', 'templates', 'certificate.hbs');

  const html = fs.readFileSync(templatePath, 'utf8');
  const compiledTemplate = handlebars.compile(html)(template);

  return compiledTemplate;
}

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

  const medalPath = path.join(process.cwd(), 'src', 'templates', 'selo.png');
  const medal = fs.readFileSync(medalPath, 'base64');

  const templatePayload: ITemplate = {
    id,
    name,
    grade,
    date:   new Date().toLocaleDateString('pt-BR'),
    medal,
  };

  const certificateHTML = await compileTemplate(templatePayload);

  const browser = await chromium.puppeteer.launch({
    headless: true,
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
  });

  const page = await browser.newPage();

  await page.setContent(certificateHTML);

  const { IS_OFFLINE, CERTIFICATE_BUCKET } = process.env;

  const pdf = await page.pdf({
    format: 'a4',
    landscape: true,
    path: IS_OFFLINE ?  'certificates.pdf' : null,
    printBackground: true,
    preferCSSPageSize: true,
  });

  await browser.close();

  const certificateBucketPath = `certificates/${id}.pdf`;
  await s3bucketClient.putObject({
    Bucket: CERTIFICATE_BUCKET,
    Key: certificateBucketPath,
    Body: pdf,
    ACL: 'public-read',
    ContentType: 'application/pdf',
  }).promise();

  return {
    statusCode: 201,
    body: JSON.stringify({
      message: "Certificate created successfully",
      url: `https://${CERTIFICATE_BUCKET}.s3.amazonaws.com/${certificateBucketPath}`,
    }),
  }
}
// document