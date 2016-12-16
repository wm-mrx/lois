module app.controllers {
    enum ViewType { shipping = 1, item = 2 };

    class shippingCtrl extends baseCtrl {
        viewType: ViewType;
        selectedEntity: any;
        selectedItem: any;
        printNoPrice: boolean;
        orientation: string;
        paper: string;

        static $inject = ['$scope', 'Notification'];

        constructor($scope, Notification) {
            super(Notification);
            this.printNoPrice = false;
            this.orientation = 'L';
            this.paper = 'A4';
            this.viewType = ViewType.shipping;
            this.functions.load = api.shipping.getAll;
            this.functions.get = api.shipping.get;
            this.functions.save = api.shipping.save;
            this.functions.autocomplete = api.autocomplete.getAll;
            this.filter();
        }

        load(): void {
            var ctrl = this;
            ctrl.createQuery();
            ctrl.loadingData = true;
            ctrl.checkedAll = false;

            ctrl.functions.load(ctrl.query).then(result => {
                ctrl.entities = result.data;
                if (ctrl.viewType == ViewType.item) {
                    var entity = ctrl.entities.filter(e => e['_id'] === ctrl.selectedEntity['_id'])[0];
                    ctrl.viewItems(entity);
                }
            }).catch(exception => {
                ctrl.notify('error', exception);
            }).finally(() => {
                ctrl.loadingData = false;
            });
        }

        save(): void {
            if (!this.entity.sender || !this.entity.sender._id) {
                this.notify('warning', 'Pengirim tidak boleh kosong');
                return;
            }

            if (!this.entity.destination || !this.entity.destination._id) {
                this.notify('warning', 'Tujuan tidak boleh kosong');
                return;
            }

            if (!this.entity.payment.type || !this.entity.payment.type._id) {
                this.notify('warning', 'Cara pembayaran tidak boleh kosong');
                return;
            }

            var ctrl = this;
            ctrl.processing = true;

            ctrl.functions.save(ctrl.entity).then(result => {
                ctrl.notify('success', 'Data berhasil disimpan');
                ctrl.load();
                ctrl.showForm = false;
            }).catch(error => {
                ctrl.notify('error', error.data);
            }).finally(() => {
                ctrl.processing = false;
            });
        }

        add(): void {
            var ctrl = this;
            api.shipping.add().then(result => {
                ctrl.notify('success', 'Spb berhasil ditambah');
                ctrl.load();
            }).catch(error => {
                ctrl.notify('error', error.data);
            });
        }

        edit(entity: any): void {
            if (entity.audited) {
                this.notify('warning', 'Pengiriman ini sedang diaudit oleh manager');
                return;
            }

            var ctrl = this;
            ctrl.processing = true;
            ctrl.showForm = true;

            ctrl.functions.get(entity._id).then(result => {
                ctrl.entity = result.data;
            }).catch(exception => {
                ctrl.notify('error', exception.data);
            }).finally(() => {
                ctrl.processing = false;
            });
        }

        addItem(): void {
            this.selectedItem = this.constructItem();
            this.showForm = true;
        }

        saveItem() {
            if (this.selectedItem.itemType == null) {
                this.notify('warning', 'Jenis barang harus diisi');
                return;
            }

            if (this.selectedItem.packingType == null) {
                this.notify('warning', 'Packing barang harus diisi');
                return;
            }

            if (this.selectedItem.colli.quantity === 0) {
                this.notify('warning', 'Koli harus lebih besar dari nol');
                return;
            }

            var index = this.selectedEntity['items'].indexOf(this.selectedItem);

            if (index < 0)
                this.selectedEntity['items'].push(this.selectedItem);

            this.entity = this.selectedEntity;
            this.save();
        }

        editItem(item) {
            if (item.status === 'Retur' || item.status === 'Surat Jalan Balik') {
                this.notify('warning', 'Item dengan status Retur atau Surat Jalan Balik tidak dapat diedit');
                return;
            }

            if (item.audited) {
                this.notify('warning', 'Item ini sedang dalam audit manager');
                return;
            }

            this.selectedItem = item;
            this.showForm = true;
        }

        deleteItem(item) {
            var confirmed = confirm('Item akan dihapus, anda yakin?');

            if (!confirmed)
                return;

            var index = this.selectedEntity['items'].indexOf(item);

            if (index < 0) {
                this.notify('warning', 'Item tidak ditemukan');
                return;
            }

            this.selectedEntity['items'].splice(index, 1);
            this.entity = this.selectedEntity;
            this.save();
        }

        viewItems(entity: any): void {
            this.viewType = ViewType.item;
            this.selectedEntity = entity;
            this.showToolbar = false;
        }

        viewShipping(): void {
            this.viewType = ViewType.shipping;
            this.selectedEntity = null;
            this.selectedItem = null;
        }

        constructItem() {
            return {
                itemType: null,
                packingType: null,
                content: null,
                dimensions: { length: 0, width: 0, height: 0, weight: 0 },
                colli: { quantity: 0, available: 0, delivered: 0 },
                cost: { colli: 0, shipping: 0, additional: 0, discount: 0 },
                recapitulations: [],
                deliveries: [],
                status: 'Belum Terekap',
                audited: false
            }
        }

        toggleShowItemForm(show: boolean): void {
            this.showForm = show;
            this.selectedItem = null;
            this.load();
        }

        print(): void {
            var ctrl = this;

            var checkedEntities = this.entities.filter(e => e.checked);

            if (checkedEntities.length === 0) {
                this.notify('warning', 'Tidak ada item yang dipilih');
                return;
            }

            var viewModels = [];
            checkedEntities.forEach(function (entity) {
                var viewModel = {
                    shipping: entity._id,
                    sender: entity.sender.name,
                    sender_contact: entity.sender.contact,
                    sender_driver: entity.driver.sender,
                    pickup_driver: entity.driver.pickup,
                    destination_city: entity.destination.name,
                    receiver: entity.receiver.name,
                    receiver_phone: entity.receiver.contact,
                    receiver_address: entity.receiver.address,
                    sum_total_coli: entity.colli,
                    sum_price: entity.cost.total,
                    payment_method: entity.payment.type.name,
                    spb_no: entity.spbNumber,
                    po_no: entity.notes.po,
                    transaction_date: entity.date,
                    note: entity.notes.shipping,
                    noPrice: ctrl.printNoPrice
                };
                viewModels.push(viewModel);
            });

            var ctrl = this;

            app.api.shipping.getDataReport(viewModels).then(function (result) {

                angular.extend(result.data, { "orientation": ctrl.orientation, "unit": 'mm', "paper": ctrl.paper });

                app.api.reportPrint.printDeliveryOrder(result.data).then(function (buffer) {
                    var blob = new Blob([buffer.data], { type: 'application/pdf' });
                    var url = URL.createObjectURL(blob);
                    window.open(url, '_blank');
                });
            }).finally(function () {
                ctrl.loadingData = false;
            });
        }
    }

    app.lois.controller('shippingCtrl', shippingCtrl);
}