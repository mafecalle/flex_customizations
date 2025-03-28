const { prepareFlexFunction, extractStandardResponse, twilioExecute } = require(Runtime.getFunctions()[
  'common/helpers/function-helper'
].path);

const requiredParameters = [
  { key: 'conference', purpose: 'unique ID of conference to update' },
  { key: 'participant', purpose: 'unique ID of participant to update' },
];
console.log("init");
exports.handler = prepareFlexFunction(requiredParameters, async (context, event, callback, response, handleError) => {
  const client = context.getTwilioClient();
  try {
    const { conference, participant } = event;

    const result = await twilioExecute(context, (client) =>
      client.conferences(conference).participants(participant).fetch(),
    );

    const { data: participantsResponse, status } = result;

    await client.conferences(conference)
                .participants(participant)
                .update({ hold: false, endConferenceOnExit: true });
                
    response.setStatusCode(status);
    response.setBody({ participantsResponse, ...extractStandardResponse(result) });
    return callback(null, response);
  } catch (error) {
    return handleError(error);
  }
});

