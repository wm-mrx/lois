module app.controllers {
    enum ViewType { deliveryOrder = 1, itemInformation = 2 };

    class deliveryOrderCtrl extends baseCtrl {
        viewType: ViewType;
        recapitulationInfo: any[];
        deliveryInfo: any[];

        selectedEntity: any;

        static $inject = ['$scope', 'Notification'];

        constructor($scope, Notification) {
            super(Notification);
            this.viewType = ViewType.deliveryOrder;
            this.functions.load = api.deliveryOrder.getAll;
            this.functions.autocomplete = api.autocomplete.getAll;
            this.filter();
        }

        print(entity: any): void {
            var ctrl = this;

            ctrl.loadingData = true;
            api.deliveryOrder.getDataReport(entity).then(result => {
                api.reportPrint.printDeliveryOrder(result.data).then(buffer => {
                    var blob = new Blob([buffer.data], { type: 'application/pdf' });
                    var url = URL.createObjectURL(blob);
                    window.open(url, '_blank');
                });
            }).finally(() => {
                ctrl.loadingData = false;
            });
        }

        viewDeliveryOrder(): void {
            this.viewType = ViewType.deliveryOrder;
            this.recapitulationInfo = [];
            this.deliveryInfo = [];
        }

        viewItemInfo(shipping, item): void {
            api.deliveryOrder.getRecapData(shipping._id).then(res => {
                var data = <Array<any>>res.data;
                this.recapitulationInfo = data.filter(e => e.items._id.toString() === item._id);
            }).finally(() => {
                this.viewType = ViewType.itemInformation;
            });

            api.deliveryOrder.getDeliveryData(shipping._id).then(res => {
                var data = <Array<any>>res.data;
                this.deliveryInfo = data.filter(e => e.items._id.toString() === item._id);
            }).finally(() => {
                this.viewType = ViewType.itemInformation;
            });

            this.selectedEntity = shipping;
        }
    }

    app.lois.controller('deliveryOrderCtrl', deliveryOrderCtrl);
}