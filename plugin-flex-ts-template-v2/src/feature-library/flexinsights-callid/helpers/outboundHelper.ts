import { ConferenceParticipant, ITask, Manager, TaskHelper } from '@twilio/flex-ui';

const manager = Manager.getInstance();



const isTaskActive = (task: ITask) => {
  const { sid: reservationSid, taskStatus } = task;
  if (taskStatus === 'canceled') {
    return false;
  }
  return manager.workerClient?.reservations.has(reservationSid);
};


const waitForActiveCall = async (task: ITask): Promise<string> =>
  new Promise((resolve) => {
    const waitTimeMs = 100;
    // For internal calls, there is no conference, so we only have the active call to work with.
    // Wait here for the call to establish.
    const maxWaitTimeMs = 60000;
    let waitForCallInterval: null | NodeJS.Timeout = setInterval(async () => {
      if (!isTaskActive(task)) {
        if (waitForCallInterval) {
          clearInterval(waitForCallInterval);
          waitForCallInterval = null;
        }
        return;
      }

      const { activeCall } = manager.store.getState().flex.phone;

      if (!activeCall) {
        return;
      }

      if (waitForCallInterval) {
        clearInterval(waitForCallInterval);
        waitForCallInterval = null;
      }

      resolve(activeCall.parameters.CallSid);
    }, waitTimeMs);

    setTimeout(() => {
      if (waitForCallInterval) {
        if (waitForCallInterval) {
          clearInterval(waitForCallInterval);
          waitForCallInterval = null;
        }

        resolve('');
      }
    }, maxWaitTimeMs);
  });

export const validateInternalCall = async (task: ITask) => {
  // internal call - always record based on call SID, as conference state is unknown by Flex
  // Record only the outbound leg to prevent duplicate recordings
  const callSid = await waitForActiveCall(task);

  return callSid;

};