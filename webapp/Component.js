sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/m/routing/RouteMatchedHandler",
	"PO_STOCK/util/messages"
], function (UIComponent, JSONModel, RouteMatchedHandler, messages) {
	"use strict";

	return UIComponent.extend("PO_STOCK.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * Initializes the component, sets up the stock lookup models and the router.
		 * @public
		 */
		init: function () {
			UIComponent.prototype.init.apply(this, arguments);

			// manifest-created OData model: wire the same error handler used pre-migration
			this.getModel().attachRequestFailed(null, messages.showErrorMessage);

			this.setModel(new JSONModel(), "MRO_LIST");
			this.setModel(new JSONModel({
				admin: true
			}), "userMode");
			this.setModel(new JSONModel({
				technician: "",
				assigned: false,
				notAssigned: false
			}), "assignment");

			this._getDisplaySettings();

			this._routeMatchedHandler = new RouteMatchedHandler(this.getRouter(), this._bRouterCloseDialogs);

			this.getRouter().initialize();
		},

		exit: function () {
			this._routeMatchedHandler.destroy();
		},

		/**
		 * Lets the router decide whether a navigation should close all open dialogs.
		 * @param {boolean} bCloseDialogs whether open dialogs should be closed on navigation
		 * @public
		 */
		setRouterSetCloseDialogs: function (bCloseDialogs) {
			this._bRouterCloseDialogs = bCloseDialogs;
			if (this._routeMatchedHandler) {
				this._routeMatchedHandler.setCloseDialogs(bCloseDialogs);
			}
		},

		/**
		 * Loads the MRO display settings list used to drive storage/stock lookups.
		 * @private
		 */
		_getDisplaySettings: function () {
			var that = this;
			this.getModel().read("/MRO_LISTSet", {
				success: function (oData) {
					that.getModel("MRO_LIST").setData(oData.results);
				},
				error: function (oError) {}
			});
		}
	});
});
