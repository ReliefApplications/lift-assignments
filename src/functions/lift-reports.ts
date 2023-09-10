import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { getReport } from '../reports';
import { getCasePDF } from '../reports/case/template';

export async function liftReports(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const { reportName, contextID } = request.params;
  const reportFn = getReport(reportName);
  if (!reportFn) {
    return {
      status: 404,
      body: `Report ${reportName} not found.`,
    };
  }
  // Get bearer token
  const token = request.headers.get('authorization')?.split(' ')[1];
  if (!token) {
    return {
      status: 401,
      body: 'Authorization missing.',
    };
  }

  const { pdf, fileName } = await reportFn(contextID, context, token);

  return {
    body: pdf as any,
    headers: {
      'Content-Disposition': `attachment; filename=${fileName}`,
    },
  };
}

app.http('report', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: liftReports,
  route: 'report/{reportName}/{contextID}',
});
