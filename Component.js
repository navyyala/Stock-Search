// define a root UI component that exposes the main view
jQuery.sap.declare("PO_STOCK.Component");
jQuery.sap.require("sap.ui.core.UIComponent");
jQuery.sap.require("sap.ui.core.routing.History");
jQuery.sap.require("sap.m.routing.RouteMatchedHandler");
sap.ui.core.UIComponent.extend("PO_STOCK.Component", {
	metadata: {
		"name": "PO_STOCK",
		"version": "1.1.0-SNAPSHOT",
		"library": "PO_STOCK",
		"includes": ["css/fullScreenStyles.css"],
		"dependencies": {
			"libs": [
				"sap.m",
				"sap.ui.layout"
			],
			"components": []
		},
		"config": {
			"resourceBundle": "i18n/messageBundle.properties",
			"serviceConfig": {
				"name": "ZGPM_STOCK_SEARCH_SRV",
				"serviceUrl": "/sap/opu/odata/sap/ZGPM_STOCK_SEARCH_SRV/"
			}
		},
		routing: {
			// The default values for routes
			config: {
				"viewType": "XML",
				"viewPath": "PO_STOCK.view",
				"targetControl": "fioriContent",
				// This is the control in which new views are placed
				"targetAggregation": "pages",
				// This is the aggregation in which the new views will be placed
				"clearTarget": false
			},
			routes: [{
				pattern: "",
				name: "main",
				view: "Worklist"
			}]
		}
	},
	/**
	 * Initialize the application
	 *
	 * @returns {sap.ui.core.Control} the content
	 */
	createContent: function () {
		var oViewData = {
			component: this
		};
		return sap.ui.view({
			viewName: "PO_STOCK.view.Main",
			type: sap.ui.core.mvc.ViewType.XML,
			viewData: oViewData
		});
	},
	init: function () {
		// call super init (will call function "create content")
		sap.ui.core.UIComponent.prototype.init.apply(this, arguments);
		// always use absolute paths relative to our own component
		// (relative paths will fail if running in the Fiori Launchpad)
		var sRootPath = jQuery.sap.getModulePath("PO_STOCK");
		// The service URL for the oData model 
		var oServiceConfig = this.getMetadata().getConfig().serviceConfig;
		var sServiceUrl = oServiceConfig.serviceUrl;
		// the metadata is read to get the location of the i18n language files later
		var mConfig = this.getMetadata().getConfig();
		// set i18n model
		var i18nModel = new sap.ui.model.resource.ResourceModel({
			bundleUrl: [
				sRootPath,
				mConfig.resourceBundle
			].join("/")
		});
		this.setModel(i18nModel, "i18n");
		this.setModel(new sap.ui.model.json.JSONModel(), "MRO_LIST");
		// create oData model
		this._initODataModel(sServiceUrl);
		this._getDisplaySettings();
		this.setModel(new sap.ui.model.json.JSONModel({
			"admin": true
		}), "userMode");
		this.setModel(new sap.ui.model.json.JSONModel({
			"technician": "",
			"assigned": false,
			"notAssigned": false
		}), "assignment");
		this._routeMatchedHandler = new sap.m.routing.RouteMatchedHandler(this.getRouter(), this._bRouterCloseDialogs);
		// initialize router and navigate to the first page
		this.getRouter().initialize();
	},
	exit: function () {
		this._routeMatchedHandler.destroy();
	},
	// This method lets the app can decide if a navigation closes all open dialogs
	setRouterSetCloseDialogs: function (bCloseDialogs) {
		this._bRouterCloseDialogs = bCloseDialogs;
		if (this._routeMatchedHandler) {
			this._routeMatchedHandler.setCloseDialogs(bCloseDialogs);
		}
	},
	// creation and setup of the oData model
	_initODataModel: function (sServiceUrl) {
		jQuery.sap.require("PO_STOCK.util.messages");
		var oConfig = {
			metadataUrlParams: {},
			json: true,
			// loadMetadataAsync : true,
			defaultBindingMode: "TwoWay",
			defaultCountMode: "Inline",
			useBatch: true
		};
		var oModel = new sap.ui.model.odata.ODataModel(sServiceUrl, oConfig);
		oModel.attachRequestFailed(null, PO_STOCK.util.messages.showErrorMessage);
		this.setModel(oModel);
	},
	_getDisplaySettings: function () {
		var self = this;
		this.getModel().read("/MRO_LISTSet", {
			success: function (oData) {
				self.getModel("MRO_LIST").setData(oData.results); // for (var i in oData.results) {
				// 	self.getModel("MRO_LIST").setProperty("/" + oData.results[i].Field, oData.results[i]);
				// }
			},
			error: function (oError) {}
		});
	}
});