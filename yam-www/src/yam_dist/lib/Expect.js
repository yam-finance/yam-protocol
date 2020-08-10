"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.expectThrow = expectThrow;
exports.expectAssertFailure = expectAssertFailure;

require("core-js/modules/es6.regexp.search");

const REQUIRE_MSG = 'Returned error: VM Exception while processing transaction: revert';
const ASSERT_MSG = 'Returned error: VM Exception while processing transaction: invalid opcode'; // For solidity function calls that violate require()

async function expectThrow(promise, reason) {
  try {
    await promise;
    throw new Error('Did not throw');
  } catch (e) {
    assertCertainError(e, REQUIRE_MSG);

    if (reason && process.env.COVERAGE !== 'true') {
      assertCertainError(e, "".concat(REQUIRE_MSG, " ").concat(reason));
    }
  }
} // For solidity function calls that violate assert()


async function expectAssertFailure(promise) {
  try {
    await promise;
    throw new Error('Did not throw');
  } catch (e) {
    assertCertainError(e, ASSERT_MSG);
  }
} // Helper function


function assertCertainError(error, expected_error_msg) {
  // This complication is so that the actual error will appear in truffle test output
  const message = error.message;
  const matchedIndex = message.search(expected_error_msg);
  let matchedString = message;

  if (matchedIndex === 0) {
    matchedString = message.substring(matchedIndex, matchedIndex + expected_error_msg.length);
  }

  expect(matchedString).toEqual(expected_error_msg);
}