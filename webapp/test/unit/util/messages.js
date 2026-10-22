sap.ui.define([
	"PO_STOCK/util/messages"
], function (messages) {
	"use strict";

	QUnit.module("util/messages — getErrorContent");

	QUnit.test("parses message/responseText from an OData request-failed event", function (assert) {
		var oFakeEvent = {
			mParameters: {},
			getParameter: function (sName) {
				return sName === "message" ? "Request failed" : "{\"error\":{\"message\":{\"value\":\"Backend error text\"}}}";
			}
		};
		assert.strictEqual(messages.getErrorContent(oFakeEvent), "Backend error text", "Extracts nested OData error message");
	});

	QUnit.test("falls back to the raw message when the response body is not JSON", function (assert) {
		var oFakeEvent = {
			mParameters: {},
			getParameter: function (sName) {
				return sName === "message" ? "Request failed" : "plain text error";
			}
		};
		assert.strictEqual(messages.getErrorContent(oFakeEvent), "Request failed", "Returns original message when body isn't a JSON error");
	});

	QUnit.test("parses a plain error response object (non-event)", function (assert) {
		var oResponse = {
			message: "Read failed",
			response: {
				body: "not-json"
			}
		};
		assert.strictEqual(messages.getErrorContent(oResponse), "Read failed", "Returns response.message when body isn't a JSON error");
	});
});
