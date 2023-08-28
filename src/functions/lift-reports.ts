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
      body: `Report ${reportName} not found!`,
    };
  }
  const report = await reportFn(contextID, context);

  const pdf = await getCasePDF(report);

  return {
    body: pdf as any,
    headers: {
      'Content-Disposition': `attachment; filename=Report-${report.caseID}.pdf`,
    },
  };
}

app.http('report', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: liftReports,
  route: 'report/{reportName}/{contextID}',
});
