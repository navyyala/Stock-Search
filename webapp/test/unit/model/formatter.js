sap.ui.define([
	"PO_STOCK/model/formatter"
], function (formatter) {
	"use strict";

	QUnit.module("formatter — removeLeadingP");

	QUnit.test("strips a leading 'P' prefix", function (assert) {
		assert.strictEqual(formatter.removeLeadingP("P000123"), "000123", "Leading P removed");
	});

	QUnit.test("leaves values without a leading 'P' unchanged", function (assert) {
		assert.strictEqual(formatter.removeLeadingP("000123"), "000123", "Unchanged when no leading P");
	});

	QUnit.test("returns falsy values unchanged", function (assert) {
		assert.strictEqual(formatter.removeLeadingP(""), "", "Empty string returned as-is");
		assert.strictEqual(formatter.removeLeadingP(null), null, "null returned as-is");
	});

	QUnit.module("formatter — removeLeadingZeros");

	QUnit.test("converts a numeric string to a Number", function (assert) {
		assert.strictEqual(formatter.removeLeadingZeros("00123"), 123, "Leading zeros stripped via Number conversion");
	});

	QUnit.module("formatter — removeQuantityDecimals");

	QUnit.test("parses a decimal quantity to an integer", function (assert) {
		assert.strictEqual(formatter.removeQuantityDecimals("12.750"), 12, "Decimal quantity truncated to integer");
	});

	QUnit.test("returns an empty string for null, undefined or empty input", function (assert) {
		assert.strictEqual(formatter.removeQuantityDecimals(null), "", "null returns empty string");
		assert.strictEqual(formatter.removeQuantityDecimals(undefined), "", "undefined returns empty string");
		assert.strictEqual(formatter.removeQuantityDecimals(""), "", "empty string returns empty string");
	});
});
