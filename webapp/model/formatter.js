sap.ui.define([], function () {
	"use strict";

	var formatter = {

		/**
		 * Strips a leading "P" prefix from legacy material numbers.
		 * @param {string} value raw material number
		 * @returns {string} material number without the leading "P"
		 * @public
		 */
		removeLeadingP: function (value) {
			if (value && value.indexOf("P") === 0) {
				return value.substring(1);
			}
			return value;
		},

		/**
		 * Removes leading zeros from a numeric string.
		 * @param {string} value raw numeric string
		 * @returns {number} the numeric value
		 * @public
		 */
		removeLeadingZeros: function (value) {
			return Number(value);
		},

		/**
		 * Formats a stock quantity without decimals.
		 * @param {string|number} vValue raw quantity value
		 * @returns {string|number} integer quantity, or "" if no value is provided
		 * @public
		 */
		removeQuantityDecimals: function (vValue) {
			if (vValue === null || vValue === undefined || vValue === "") {
				return "";
			}
			return parseInt(vValue, 10);
		}
	};

	return formatter;
});
