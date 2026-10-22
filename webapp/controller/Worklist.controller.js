sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"PO_STOCK/model/formatter"
], function (Controller, JSONModel, History, Filter, FilterOperator, formatter) {
	"use strict";

	return Controller.extend("PO_STOCK.controller.Worklist", {

		formatter: formatter,

		_oCatalog: null,
		_oResourceBundle: null,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function () {
			this._oView = this.getView();
			this._oComponent = this.getOwnerComponent();
			this._oResourceBundle = this._oComponent.getModel("i18n").getResourceBundle();
			this._oRouter = this._oComponent.getRouter();

			var oViewModel,
				iOriginalBusyDelay,
				oTable = this.byId("table");

			// Put down worklist table's original value for busy indicator delay,
			// so it can be restored later on. Busy handling on the table is
			// taken care of by the table itself.
			iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
			// keeps the search state
			this._oTableSearchState = [];

			// Model used to manipulate control states
			oViewModel = new JSONModel({
				worklistTableTitle: this.getResourceBundle().getText("worklistTableTitle"),
				saveAsTileTitle: this.getResourceBundle().getText("worklistViewTitle"),
				shareOnJamTitle: this.getResourceBundle().getText("worklistViewTitle"),
				shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
				shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
				tableNoDataText: this.getResourceBundle().getText("tableNoDataText"),
				tableBusyDelay: 0
			});
			this.setModel(oViewModel, "worklistView");

			// Make sure, busy indication is showing immediately so there is no
			// break after the busy indication for loading the view's meta data is
			// ended (see promise 'oWhenMetadataIsLoaded' in AppController)
			oTable.attachEventOnce("updateFinished", function () {
				// Restore original busy indicator delay for worklist's table
				oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
			});
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Triggered by the table's 'updateFinished' event: after new table
		 * data is available, this handler method updates the table counter.
		 * This should only happen if the update was successful, which is
		 * why this handler is attached to 'updateFinished' and not to the
		 * table's list binding's 'dataReceived' method.
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		onUpdateFinished: function (oEvent) {
			// update the worklist's object counter after the table update
			var sTitle,
				oTable = oEvent.getSource(),
				iTotalItems = oEvent.getParameter("total");
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
				sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
			} else {
				sTitle = this.getResourceBundle().getText("worklistTableTitle");
			}
			this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
		},

		/**
		 * Event handler when a table item gets pressed
		 * @param {sap.ui.base.Event} oEvent the table selectionChange event
		 * @public
		 */
		// onPress : function (oEvent) {
		// 	// The source is the list item that got pressed
		// 	this._showObject(oEvent.getSource());
		// },

		/**
		 * Event handler for navigating back.
		 * It there is a history entry or an previous app-to-app navigation we go one step back in the browser history
		 * If not, it will navigate to the shell home
		 * @public
		 */
		onNavBack: function () {
			var sPreviousHash = History.getInstance().getPreviousHash(),
				oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

			if (sPreviousHash !== undefined || !oCrossAppNavigator.isInitialNavigation()) {
				history.go(-1);
			} else {
				oCrossAppNavigator.toExternal({
					target: {
						shellHash: "#Shell-home"
					}
				});
			}
		},

		/**
		 * Event handler when the share in JAM button has been clicked
		 * @public
		 */
		onShareInJamPress: function () {
			var oViewModel = this.getModel("worklistView"),
				oShareDialog = sap.ui.getCore().createComponent({
					name: "sap.collaboration.components.fiori.sharing.dialog",
					settings: {
						object: {
							id: location.href,
							share: oViewModel.getProperty("/shareOnJamTitle")
						}
					}
				});
			oShareDialog.open();
		},

		onSearch: function (oEvent) {
			if (oEvent.getParameters().refreshButtonPressed) {
				// Search field's 'refresh' button has been pressed.
				// This is visible if you select any master list item.
				// In this case no new search is triggered, we only
				// refresh the list binding.
				this.onRefresh();
			} else {
				var oTableSearchState = [];
				var sQuery = oEvent.getParameter("query");

				if (sQuery && sQuery.length > 0) {
					oTableSearchState = [new Filter("Maktx", FilterOperator.Contains, sQuery)];
				}
				this._applySearch(oTableSearchState);
			}

		},

		onStorageLocationSearch: function (oEvent) {
			oEvent.getSource().getBinding("items").filter([
				new Filter("Lgort", "EQ", oEvent.getParameter("value"))
			]);
		},

		/**
		 * Event handler for refresh event. Keeps filter, sort
		 * and group settings and refreshes the list binding.
		 * @public
		 */
		onRefresh: function () {
			var oTable = this.byId("table");
			oTable.getBinding("items").refresh();
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Shows the selected item on the object page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		// _showObject : function (oItem) {
		// 	this.getRouter().navTo("object", {
		// 		objectId: oItem.getBindingContext().getProperty("Matnr")
		// 	});
		// },

		/**
		 * Internal helper method to apply both filter and search state together on the list binding
		 * @param {object} oTableSearchState an array of filters for the search
		 * @private
		 */
		_applySearch: function (oTableSearchState) {
			var oTable = this.byId("table"),
				oViewModel = this.getModel("worklistView");
			oTable.getBinding("items").filter(oTableSearchState, "Application");
			// changes the noDataText of the list in case there are no filter results
			if (oTableSearchState.length !== 0) {
				oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
			}
		},

		onStorageLocationValueHelpRequest: function (oEvent) {
			if (!this._oStorageLocationeDialog) {
				this._oStorageLocationeDialog = sap.ui.xmlfragment("PO_STOCK.view.fragment.StorageLocationDialog", this);
				this.getView().addDependent(this._oStorageLocationeDialog);
				this._oStorageLocationeDialog.setModel(this.getView().getModel());
				this._oStorageLocationeDialog.setModel(this.getView().getModel("i18n"), "i18n");
			}
			this._oStorageLocationeDialog.open();
		},

		handleStorageLocationClose: function (oEvent) {
			var storageLocation = oEvent.getParameter("selectedItem").getDescription();
			this.getView().byId("storageLocation").setValue(storageLocation);
		},

		resetSearch: function () {
			var filters = [];
			this.getView().byId("table").getBinding("items").filter(filters);
			this.getView().byId("material").setValue("");
			this.getView().byId("materialDesc").setValue("");
			this.getView().byId("manfPart").setValue("");
			this.getView().byId("manf").setValue("");
			this.getView().byId("oldPartNum").setValue("");
			this.getView().byId("storageLocation").setValue("");
			this.getView().byId("condition").setValue("");
		},

		/************************************************************************************************************/
		performSearch: function () {
			// Filter table by user input
			var storLocation = this.getView().byId("storageLocation");
			var codeArticle = this.getView().byId("material");
			var descArticle = this.getView().byId("materialDesc");
			var manfPartN = this.getView().byId("manfPart");
			var manfRef = this.getView().byId("manf");
			var oldPartNum = this.getView().byId("oldPartNum");
			var condition = this.getView().byId("condition");
			var filters = [];
			if (storLocation.getValue() !== "") {
				filters.push(new Filter("Lgort", FilterOperator.EQ, storLocation.getValue()));
			}
			if (codeArticle.getValue() !== "") {
				filters.push(new Filter("Matnr", FilterOperator.EQ, codeArticle.getValue()));
			}
			if (descArticle.getValue() !== "") {
				filters.push(new Filter("Maktx", FilterOperator.EQ, descArticle.getValue()));
			}
			if (manfPartN.getValue() !== "") {
				filters.push(new Filter("ZMfrpn", FilterOperator.EQ, manfPartN.getValue()));
			}
			if (manfRef.getValue() !== "") {
				filters.push(new Filter("ZMfrnr", FilterOperator.EQ, manfRef.getValue()));
			}
			if (oldPartNum.getValue() !== "") {
				filters.push(new Filter("ZzOldMatnr", FilterOperator.EQ, oldPartNum.getValue()));
			}
			if (condition.getValue() !== "") {
				filters.push(new Filter("Bwtar", FilterOperator.EQ, condition.getValue()));
			}
			this.getView().byId("table").getBinding("items").filter(filters);
		},

		//Formatter
		removeLeadingZeros: function (value) {
			return formatter.removeLeadingZeros(value);
		},
		removeLeadingP: function (value) {
			return formatter.removeLeadingP(value);
		},
		/************************************************************************************************************/

		getRouter: function () {
			return this._oRouter;
		},

		/**
		 * Convenience method for getting the view model by name.
		 * @public
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function (sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function () {
			return this._oResourceBundle;
		},

		/**
		 * Event handler when the share by E-Mail button has been clicked
		 * @public
		 */
		onShareEmailPress: function () {
			var oViewModel = (this.getModel("objectView") || this.getModel("worklistView"));
			// sap.m.URLHelper has no standalone module file; sap.m is already an app dependency
			sap.m.URLHelper.triggerEmail(
				null,
				oViewModel.getProperty("/shareSendEmailSubject"),
				oViewModel.getProperty("/shareSendEmailMessage")
			);

		},

		removeQuantityDecimals: function (vValue) {
			return formatter.removeQuantityDecimals(vValue);
		}

	});
});
