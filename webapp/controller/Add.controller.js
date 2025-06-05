sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
  ],
  function (Controller, JSONModel, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("ui5l1.controller.Add", {
      onInit: function () {
        this._oRouter = this.getOwnerComponent().getRouter();
        this._oRouter.getRoute("add").attachPatternMatched(this._onRouteMatched, this);
        this._oRouter.getRoute("edit").attachPatternMatched(this._onEditRouteMatched, this);
        this._initializeFormModel();
      },

      _initializeFormModel: function () {
        var oFormModel = new JSONModel({
          id: "",
          name: "",
          category: "",
          price: "",
          stock: "",
          minStock: "",
          nameState: "None",
          nameStateText: "",
          categoryState: "None",
          categoryStateText: "",
          priceState: "None",
          priceStateText: "",
          stockState: "None",
          stockStateText: "",
          minStockState: "None",
          minStockStateText: "",
        });

        this.getView().setModel(oFormModel, "formModel");
      },

      _onRouteMatched: function () {
        this._sMode = "add";
        this._resetForm();
        this._updatePageTitle();
      },

      _onEditRouteMatched: function (oEvent) {
        this._sMode = "edit";
        var sProductId = oEvent.getParameter("arguments").productId;
        this._loadProductForEdit(sProductId);
        this._updatePageTitle();
      },

      _loadProductForEdit: function (sProductId) {
        var oProductModel = this.getOwnerComponent().getModel("productModel");
        var aProducts = oProductModel.getProperty("/products");

        var oProduct = aProducts.find(function (oItem) {
          return oItem.id === sProductId;
        });

        if (oProduct) {
          var oFormModel = this.getView().getModel("formModel");
          oFormModel.setData({
            id: oProduct.id,
            name: oProduct.name,
            category: oProduct.category,
            price: oProduct.price.toString(),
            stock: oProduct.stock.toString(),
            minStock: oProduct.minStock.toString(),
            nameState: "None",
            nameStateText: "",
            categoryState: "None",
            categoryStateText: "",
            priceState: "None",
            priceStateText: "",
            stockState: "None",
            stockStateText: "",
            minStockState: "None",
            minStockStateText: "",
          });
        } else {
          MessageBox.error("Product not found!", {
            onClose: function () {
              this._navToHome();
            }.bind(this),
          });
        }
      },

      _resetForm: function () {
        var oFormModel = this.getView().getModel("formModel");
        oFormModel.setData({
          id: "",
          name: "",
          category: "",
          price: "",
          stock: "",
          minStock: "",
          nameState: "None",
          nameStateText: "",
          categoryState: "None",
          categoryStateText: "",
          priceState: "None",
          priceStateText: "",
          stockState: "None",
          stockStateText: "",
          minStockState: "None",
          minStockStateText: "",
        });
      },

      _updatePageTitle: function () {
        var oPage = this.byId("addProductPage");
        var sTitle = this._sMode === "add" ? "Add New Product" : "Edit Product";
        oPage.setTitle(sTitle);

        var oSaveButton = this.byId("saveButton");
        var sButtonText = this._sMode === "add" ? "Save" : "Update";
        oSaveButton.setText(sButtonText);
      },

      onInputChange: function () {
        this._validateForm();
      },

      _validateForm: function () {
        var oFormModel = this.getView().getModel("formModel");
        var oData = oFormModel.getData();
        var bValid = true;

        if (!oData.name || oData.name.trim() === "") {
          oFormModel.setProperty("/nameState", "Error");
          oFormModel.setProperty("/nameStateText", "Product name is required");
          bValid = false;
        } else {
          oFormModel.setProperty("/nameState", "Success");
          oFormModel.setProperty("/nameStateText", "");
        }

        if (!oData.category) {
          oFormModel.setProperty("/categoryState", "Error");
          oFormModel.setProperty("/categoryStateText", "Please select a category");
          bValid = false;
        } else {
          oFormModel.setProperty("/categoryState", "Success");
          oFormModel.setProperty("/categoryStateText", "");
        }

        var fPrice = parseFloat(oData.price);
        if (!oData.price || isNaN(fPrice) || fPrice <= 0) {
          oFormModel.setProperty("/priceState", "Error");
          oFormModel.setProperty("/priceStateText", "Please enter a valid price greater than 0");
          bValid = false;
        } else {
          oFormModel.setProperty("/priceState", "Success");
          oFormModel.setProperty("/priceStateText", "");
        }

        var iStock = parseInt(oData.stock);
        if (!oData.stock || isNaN(iStock) || iStock < 0) {
          oFormModel.setProperty("/stockState", "Error");
          oFormModel.setProperty("/stockStateText", "Please enter a valid stock quantity");
          bValid = false;
        } else {
          oFormModel.setProperty("/stockState", "Success");
          oFormModel.setProperty("/stockStateText", "");
        }

        var iMinStock = parseInt(oData.minStock);
        if (!oData.minStock || isNaN(iMinStock) || iMinStock < 0) {
          oFormModel.setProperty("/minStockState", "Error");
          oFormModel.setProperty("/minStockStateText", "Please enter a valid minimum stock level");
          bValid = false;
        } else {
          oFormModel.setProperty("/minStockState", "Success");
          oFormModel.setProperty("/minStockStateText", "");
        }

        return bValid;
      },

      onSave: function () {
        if (!this._validateForm()) {
          MessageToast.show("Please correct the errors before saving");
          return;
        }

        var oFormModel = this.getView().getModel("formModel");
        var oFormData = oFormModel.getData();

        if (this._sMode === "add") {
          this._addProduct(oFormData);
        } else {
          this._updateProduct(oFormData);
        }
      },

      _addProduct: function (oFormData) {
        var oProductModel = this.getOwnerComponent().getModel("productModel");
        var oData = oProductModel.getData();

        var oNewProduct = {
          id: oData.nextId.toString(),
          name: oFormData.name.trim(),
          category: oFormData.category,
          price: parseFloat(oFormData.price),
          stock: parseInt(oFormData.stock),
          minStock: parseInt(oFormData.minStock),
        };

        oData.products.push(oNewProduct);
        oData.nextId++;

        oProductModel.setData(oData);
        this._saveToLocalStorage();

        MessageToast.show("Product added successfully!");
        this._navToHome();
      },

      _updateProduct: function (oFormData) {
        var oProductModel = this.getOwnerComponent().getModel("productModel");
        var aProducts = oProductModel.getProperty("/products");

        var iIndex = aProducts.findIndex(function (oProduct) {
          return oProduct.id === oFormData.id;
        });

        if (iIndex !== -1) {
          aProducts[iIndex] = {
            id: oFormData.id,
            name: oFormData.name.trim(),
            category: oFormData.category,
            price: parseFloat(oFormData.price),
            stock: parseInt(oFormData.stock),
            minStock: parseInt(oFormData.minStock),
          };

          oProductModel.setProperty("/products", aProducts);
          this._saveToLocalStorage();

          MessageToast.show("Product updated successfully!");
          this._navToHome();
        }
      },

      _saveToLocalStorage: function () {
        var oProductModel = this.getOwnerComponent().getModel("productModel");
        var oData = oProductModel.getData();
        this.getOwnerComponent().saveToLocalStorage(oData);
      },

      onCancel: function () {
        this._navToHome();
      },

      onNavBack: function () {
        this._navToHome();
      },

      _navToHome: function () {
        this._oRouter.navTo("home");
      },
    });
  }
);
