const _ = require("lodash");
const { IDEMPOTENCY_KEY } = require("../constant");

// const Symbol = {EMPTY: '', SPACE: ' ', EQUAL_TO: '=', SEMICOLON: ';'};

function contextFromError(errorData) {
  return _.pick(errorData, [
    "clientRequestId",
    "message",
    "webhookUrl"[IDEMPOTENCY_KEY],
  ]);
}

function ErrorBuilder() {
  this.build = (error, request) => {
    const errorContext = contextFromError({
      ...error.errorData,
      ...request.params,
    });

    if (error.statusCode && error.name && error.message) {
      return {
        code: error.statusCode,
        errors: {
          errors: [
            {
              code: error.name,
              error: error.name,
              context: errorContext,
              message: error.message,
            },
          ],
        },
      };
    }
    return {
      code: 500,
      errors: {
        errors: [
          {
            error: "INTERNAL_SERVER_ERROR",
            code: "INTERNAL_SERVER_ERROR",
            context: errorContext,
            message: "Operation failed because of an internal server error",
          },
        ],
      },
    };
  };
}

module.exports = ErrorBuilder;
