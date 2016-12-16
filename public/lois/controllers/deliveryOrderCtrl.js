var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var app;
(function (app) {
    var controllers;
    (function (controllers) {
        var ViewType;
        (function (ViewType) {
            ViewType[ViewType["deliveryOrder"] = 1] = "deliveryOrder";
            ViewType[ViewType["itemInformation"] = 2] = "itemInformation";
        })(ViewType || (ViewType = {}));
        ;
        var deliveryOrderCtrl = (function (_super) {
            __extends(deliveryOrderCtrl, _super);
            function deliveryOrderCtrl($scope, Notification) {
                var _this = _super.call(this, Notification) || this;
                _this.viewType = ViewType.deliveryOrder;
                _this.functions.load = app.api.deliveryOrder.getAll;
                _this.functions.autocomplete = app.api.autocomplete.getAll;
                _this.filter();
                return _this;
            }
            deliveryOrderCtrl.prototype.print = function (entity) {
                var ctrl = this;
                ctrl.loadingData = true;
                app.api.deliveryOrder.getDataReport(entity).then(function (result) {
                    app.api.reportPrint.printDeliveryOrder(result.data).then(function (buffer) {
                        var blob = new Blob([buffer.data], { type: 'application/pdf' });
                        var url = URL.createObjectURL(blob);
                        window.open(url, '_blank');
                    });
                }).finally(function () {
                    ctrl.loadingData = false;
                });
            };
            deliveryOrderCtrl.prototype.viewDeliveryOrder = function () {
                this.viewType = ViewType.deliveryOrder;
                this.recapitulationInfo = [];
                this.deliveryInfo = [];
            };
            deliveryOrderCtrl.prototype.viewItemInfo = function (shipping, item) {
                var _this = this;
                app.api.deliveryOrder.getRecapData(shipping._id).then(function (res) {
                    var data = res.data;
                    _this.recapitulationInfo = data.filter(function (e) { return e.items._id.toString() === item._id; });
                }).finally(function () {
                    _this.viewType = ViewType.itemInformation;
                });
                app.api.deliveryOrder.getDeliveryData(shipping._id).then(function (res) {
                    var data = res.data;
                    _this.deliveryInfo = data.filter(function (e) { return e.items._id.toString() === item._id; });
                }).finally(function () {
                    _this.viewType = ViewType.itemInformation;
                });
                this.selectedEntity = shipping;
            };
            return deliveryOrderCtrl;
        }(controllers.baseCtrl));
        deliveryOrderCtrl.$inject = ['$scope', 'Notification'];
        app.lois.controller('deliveryOrderCtrl', deliveryOrderCtrl);
    })(controllers = app.controllers || (app.controllers = {}));
})(app || (app = {}));
//# sourceMappingURL=deliveryOrderCtrl.js.map