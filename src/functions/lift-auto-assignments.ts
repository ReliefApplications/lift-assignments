import { app, InvocationContext, Timer } from '@azure/functions';
import { runAutoAssignment } from '../script/script';

export async function liftAutoAssignments(
  _: Timer,
  context: InvocationContext
): Promise<void> {
  await runAutoAssignment(context);
}

app.timer('lift-auto-assignments', {
  schedule: '0 */1 * * * *',
  handler: liftAutoAssignments,
});
