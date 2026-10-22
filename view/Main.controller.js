sap.ui.controller("PO_STOCK.view.Main", {

	onInit: function() {
		if (sap.ui.Device.support.touch === false) {
			this.getView().addStyleClass("sapUiSizeCompact");
		}
	}
});