import { app, InvocationContext, Timer } from '@azure/functions';
import { runAutoAssignment } from '../assignment/script';

export async function liftAutoAssignments(
  _: Timer,
  context: InvocationContext
): Promise<void> {
  await runAutoAssignment(context);
}

app.timer('lift-auto-assignments', {
  // Running every 10 minutes
  schedule: '0 */10 * * * *',
  handler: liftAutoAssignments,
});
