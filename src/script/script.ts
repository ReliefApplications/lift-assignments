import { InvocationContext } from '@azure/functions';
import { assignInspector } from './mutations/assignInspector';
import { getInspectorWorkload } from './queries/getInspectorWorkload';
import { getRelatedInspectors } from './queries/relatedInspectors';
import { getUnassignedComplaints } from './queries/unassignedComplaints';

type InspectorScore = Record<
  string,
  {
    isSameRegion: boolean;
    matchingSpecializations: number;
    workload: number;
  }
>;

const getFittestScore = (scores: InspectorScore) => {
  const inspectorEntries = Object.entries(scores);
  // if no inspectors, return null
  if (!inspectorEntries.length) return null;

  // sort by workload
  const sortedScores = inspectorEntries.sort(
    // lowest workload first
    (a, b) => a[1].workload - b[1].workload
  );

  // sort by matching specializations
  sortedScores.sort(
    // most matching specializations first
    (a, b) => b[1].matchingSpecializations - a[1].matchingSpecializations
  );

  // sort by same region
  sortedScores.sort(
    (a, b) => (a[1].isSameRegion ? -1 : 1) - (b[1].isSameRegion ? -1 : 1)
  );

  // return the fittest inspector
  return sortedScores[0][0];
};

export const runAutoAssignment = async (context: InvocationContext) => {
  context.info(`Starting complaint assignment at ${new Date().toISOString()}`);
  if (!process.env.RESOURCES)
    throw new Error('No resources configured. Check environment variables');

  const resources = JSON.parse(process.env.RESOURCES);

  for (const [queryName, inspectorQueryName, countryName] of resources) {
    context.info(`Checking for unassigned complaints in ${countryName}...`);

    // For each query, get the unassigned complaints
    const unassignedComplaints = await getUnassignedComplaints(
      queryName,
      context
    );
    context.info(
      `\tFound ${unassignedComplaints.length} unassigned complaint(s)`
    );

    if (!unassignedComplaints.length) continue;

    // Get the inspectors for the same country as the complaint
    context.info(`Getting inspectors for ${countryName}...`);
    const relatedInspectors = await getRelatedInspectors(
      inspectorQueryName,
      context
    );

    if (!relatedInspectors.length) {
      context.error(
        `\tNo inspectors found for query ${queryName}, skipping assignments for ${countryName}`
      );
      continue;
    } else
      context.info(
        `\tFound ${relatedInspectors.length} inspector(s), calculating workload(s), this might take a while...`
      );

    const inspectorWorkloads: Record<string, number> = {};
    for (const inspector of relatedInspectors) {
      // Wait one second to avoid rate limiting
      if (!!Object.keys(inspectorWorkloads).length)
        await new Promise((resolve) => setTimeout(resolve, 1000));

      inspectorWorkloads[inspector.id] = await getInspectorWorkload(
        queryName,
        inspector.user,
        context
      );
    }

    context.info(
      'Finished calculating workload(s), calculating the fittest inspector for each request...'
    );

    // For each unassigned complaint, find the fittest inspector
    for (const complaint of unassignedComplaints) {
      const inspectorsScores: InspectorScore = {};
      for (const inspector of relatedInspectors) {
        if (!inspectorsScores[inspector.id]) {
          inspectorsScores[inspector.id] = {
            isSameRegion: inspector.region === complaint.region,
            matchingSpecializations: inspector.specialization.reduce(
              (acc, spec) => {
                if (complaint.complaintType.includes(spec)) acc++;
                return acc;
              },
              0
            ),
            workload: inspectorWorkloads[inspector.id],
          };
        }
      }

      // Get the fittest inspector
      const fittestInspectorID = getFittestScore(inspectorsScores);

      if (!fittestInspectorID) {
        context.error(`No inspectors found for query ${queryName}`);
        continue;
      }

      const fittestInspector = relatedInspectors.find(
        (inspector) => inspector.id === fittestInspectorID
      )!;

      context.info(
        `\tFittest inspector for request ${complaint.incrementalId}: ${fittestInspector.name}, assigning...`
      );

      // Wait one second to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Assign the complaint to the fittest inspector
      // await assignInspector(complaint.id, fittestInspector.user, context);
      inspectorWorkloads[fittestInspectorID]++;

      context.info(
        `\tFinished assigning complaint ${complaint.incrementalId} to ${fittestInspector.name}`
      );
    }
  }

  context.info(`Finished complaint assignment at ${new Date().toISOString()}`);
};
