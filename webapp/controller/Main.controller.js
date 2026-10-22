sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/Device"
], function (Controller, Device) {
	"use strict";

	return Controller.extend("PO_STOCK.controller.Main", {

		onInit: function () {
			if (!Device.support.touch) {
				this.getView().addStyleClass("sapUiSizeCompact");
			}
		}
	});
});
