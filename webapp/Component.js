sap.ui.define(
  [
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/resource/ResourceModel"
  ],
  function (UIComponent, JSONModel, ResourceModel) {
    "use strict";

    return UIComponent.extend("ui5l1.Component", {
      metadata: {
        manifest: "json"
      },

      init: function () {
        UIComponent.prototype.init.apply(this, arguments);
        this.getRouter().initialize();
        this._initializeDataModel();
      },

      _initializeDataModel: function () {
        var oData = this._loadFromLocalStorage();
        var oModel = new JSONModel(oData);
        this.setModel(oModel, "productModel");
      },

      _loadFromLocalStorage: function () {
        var sStorageData = localStorage.getItem("ui5l1_products");
        if (sStorageData) {
          try {
            return JSON.parse(sStorageData);
          } catch (e) {
            console.log("Error parsing stored data", e);
          }
        }
        return {
          products: [
            {
              id: "1",
              name: "Laptop Dell XPS",
              category: "Electronics",
              price: 1200,
              stock: 15,
              minStock: 5
            },
            {
              id: "2",
              name: "Cotton T-Shirt",
              category: "Cloths",
              price: 25,
              stock: 3,
              minStock: 10
            },
            {
              id: "3",
              name: "JavaScript Book",
              category: "Books",
              price: 45,
              stock: 8,
              minStock: 5
            }
          ],
          nextId: 4
        };
      },

      saveToLocalStorage: function (oData) {
        try {
          localStorage.setItem("ui5l1_products", JSON.stringify(oData));
        } catch (e) {
          console.log("error saving to local storage", e);
        }
      }
    });
  }
);
