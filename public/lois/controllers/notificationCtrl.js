var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var app;
(function (app) {
    var controllers;
    (function (controllers) {
        var notificationCtrl = (function (_super) {
            __extends(notificationCtrl, _super);
            function notificationCtrl($scope, Notification) {
                var _this = _super.call(this, Notification) || this;
                _this.functions.load = app.api.notification.getAll;
                _this.functions.delete = app.api.notification.delete;
                _this.filter();
                return _this;
            }
            notificationCtrl.prototype.viewFile = function (file) {
                window.open('berita_acara/' + file, '_blank');
            };
            return notificationCtrl;
        }(controllers.baseCtrl));
        notificationCtrl.$inject = ['$scope', 'Notification'];
        app.lois.controller('notificationCtrl', notificationCtrl);
    })(controllers = app.controllers || (app.controllers = {}));
})(app || (app = {}));
//# sourceMappingURL=notificationCtrl.js.map