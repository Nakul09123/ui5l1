sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
  ],
  function (
    Controller,
    Filter,
    FilterOperator,
    Sorter,
    MessageToast,
    MessageBox
  ) {
    "use strict";

    return Controller.extend("ui5l1.controller.home", {
      onInit: function () {
        this._oRouter = this.getOwnerComponent().getRouter();
      },

      onAddProductPress: function () {
        this._oRouter.navTo("add");
      },

      onEditProduct: function (oEvent) {
        var oContext = oEvent.getSource().getBindingContext("productModel");
        var sProductId = oContext.getProperty("id");
        this._oRouter.navTo("edit", {
          productId: sProductId,
        });
      },

      onSearch: function (oEvent) {
        var sQuery =
          oEvent.getParameter("query") || oEvent.getParameter("newValue");
        var oTable = this.byId("productTable");
        var oBinding = oTable.getBinding("items");

        var aFilters = [];
        if (sQuery && sQuery.length > 0) {
          aFilters.push(new Filter("name", FilterOperator.Contains, sQuery));
        }

        oBinding.filter(this._combineFilters(aFilters));
      },

      onFilter: function (oEvent) {
        var sSelectedKey = oEvent.getParameter("selectedItem").getKey();
        var oTable = this.byId("productTable");
        var oBinding = oTable.getBinding("items");

        var aFilters = [];
        if (sSelectedKey !== "All") {
          aFilters.push(
            new Filter("category", FilterOperator.EQ, sSelectedKey)
          );
        }

        var sSearchValue = this.byId("search").getValue();
        if (sSearchValue) {
          aFilters.push(
            new Filter("name", FilterOperator.Contains, sSearchValue)
          );
        }

        oBinding.filter(this._combineFilters(aFilters));
      },

      _combineFilters: function (aFilters) {
        if (aFilters.length === 0) {
          return [];
        } else if (aFilters.length === 1) {
          return aFilters;
        } else {
          return [
            new Filter({
              filters: aFilters,
              and: true,
            }),
          ];
        }
      },

      onSort: function (oEvent) {
        var sButtonText = oEvent.getSource().getText();
        var oTable = this.byId("productTable");
        var oBinding = oTable.getBinding("items");

        var aSorters = [];
        if (sButtonText === "Sort by Name") {
          aSorters.push(new Sorter("name", false));
        } else if (sButtonText === "Sort by Price") {
          aSorters.push(new Sorter("price", false));
        }

        oBinding.sort(aSorters);
        MessageToast.show(
          "Products sorted by " +
            (sButtonText === "Sort by Name" ? "name" : "price")
        );
      },

      onDeleteProduct: function (oEvent) {
        var oContext = oEvent.getSource().getBindingContext("productModel");
        var sProductName = oContext.getProperty("name");
        var sProductId = oContext.getProperty("id");

        MessageBox.confirm(
          "Are you sure you want to delete '" + sProductName + "'?",
          {
            title: "Confirm Delete",
            onClose: function (oAction) {
              if (oAction === MessageBox.Action.OK) {
                this._deleteProduct(sProductId);
              }
            }.bind(this),
          }
        );
      },

      onDeleteSelected: function () {
        var oTable = this.byId("productTable");
        var aSelectedItems = oTable.getSelectedItems();

        if (aSelectedItems.length === 0) {
          MessageToast.show("Please select products to delete");
          return;
        }

        MessageBox.confirm(
          "Are you sure you want to delete " +
            aSelectedItems.length +
            " selected product(s)?",
          {
            title: "Confirm Delete",
            onClose: function (oAction) {
              if (oAction === MessageBox.Action.OK) {
                this._deleteSelectedProducts(aSelectedItems);
              }
            }.bind(this),
          }
        );
      },

      _deleteProduct: function (sProductId) {
        var oModel = this.getView().getModel("productModel");
        var aProducts = oModel.getProperty("/products");

        var iIndex = aProducts.findIndex(function (oProduct) {
          return oProduct.id === sProductId;
        });

        if (iIndex !== -1) {
          aProducts.splice(iIndex, 1);
          oModel.setProperty("/products", aProducts);
          this._saveToLocalStorage();
          MessageToast.show("Product deleted successfully");
        }
      },

      _deleteSelectedProducts: function (aSelectedItems) {
        var oModel = this.getView().getModel("productModel");
        var aProducts = oModel.getProperty("/products");

        var aSelectedIds = aSelectedItems.map(function (oItem) {
          return oItem.getBindingContext("productModel").getProperty("id");
        });

        var aRemainingProducts = aProducts.filter(function (oProduct) {
          return aSelectedIds.indexOf(oProduct.id) === -1;
        });

        oModel.setProperty("/products", aRemainingProducts);
        this._saveToLocalStorage();

        var oTable = this.byId("productTable");
        oTable.removeSelections();

        MessageToast.show(
          aSelectedItems.length + " product(s) deleted successfully"
        );
      },

      _saveToLocalStorage: function () {
        var oModel = this.getView().getModel("productModel");
        var oData = oModel.getData();
        this.getOwnerComponent().saveToLocalStorage(oData);
      },
    });
  }
);
