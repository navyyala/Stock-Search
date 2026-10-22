sap.ui.define([
	"sap/m/MessageBox"
], function (MessageBox) {
	"use strict";

	var messages = {};

	/**
	 * Shows an error dialog with information from the OData response object.
	 * @param {object} oParameter event or error object from the OData model
	 * @public
	 */
	messages.showErrorMessage = function (oParameter) {
		var oErrorDetails = messages._parseError(oParameter);
		MessageBox.error(oErrorDetails.sMessage, {
			details: oErrorDetails.sDetails
		});
	};

	/**
	 * Returns the parsed error message text for the given OData error/event.
	 * @param {object} oParameter event or error object from the OData model
	 * @returns {string} the parsed error message
	 * @public
	 */
	messages.getErrorContent = function (oParameter) {
		return messages._parseError(oParameter).sMessage;
	};

	messages._parseError = function (oParameter) {
		var sMessage = "",
			sDetails = "",
			oEvent = null,
			oResponse = null,
			oError = {};

		if (oParameter.mParameters) {
			oEvent = oParameter;
			sMessage = oEvent.getParameter("message");
			sDetails = oEvent.getParameter("responseText");
		} else {
			oResponse = oParameter;
			sMessage = oResponse.message;
			sDetails = oResponse.response.body;
		}

		if (typeof sDetails === "string" && sDetails.indexOf("{\"error\":") === 0) {
			try {
				sMessage = JSON.parse(sDetails).error.message.value;
			} catch (e) {
				// keep original sMessage if the error body cannot be parsed
			}
		}

		oError.sDetails = sDetails;
		oError.sMessage = sMessage;
		return oError;
	};

	return messages;
});
