module app.controllers {
    enum InvoiceType { Semua = 1, Klien = 2, Partner = 3 };

    class invoiceCtrl extends baseCtrl {
        tab: string;
        invoiceType: InvoiceType;
        to: string;
        location: string;
        toInvoice: string;
        activeEntity: any;
        orientation: string;
        paper: string;
        selectedEntity: any;
        type: any;

        static $inject = ['$scope', 'Notification'];

        constructor($scope, Notification) {
            super(Notification);
            this.tab = 'create';
            this.orientation = 'P';
            this.paper = 'A4';
            this.functions.load = api.invoice.getAll;
            this.functions.autocomplete = api.autocomplete.getAll;
            this.invoiceType = InvoiceType.Semua;
            this.filter();
        }

        onTabChange(tab: string): void {
            this.tab = tab;

            if (this.tab === 'create' || this.tab === 'change')
                this.functions.load = api.invoice.getAll;

            else if (this.tab === 'list')
                this.functions.load = api.invoice.getList;

            this.paging.page = 1;
            this.filters = {};
            this.filter();
        }

        create(): void {
            if (!this.to || this.to === '') {
                this.notify('warning', 'Tertagih harus diisi');
                return;
            }

            if (!this.location || this.location === '') {
                this.notify('warning', 'Lokasi tertagih harus diisi');
                return;
            }

            var checkedEntities = this.entities.filter(e => e.checked);

            if (checkedEntities.length === 0) {
                this.notify('warning', 'Tidak ada pengiriman yang dipilih');
                return;
            }

            var viewModels = [];
            checkedEntities.forEach(e => {
                viewModels.push({shippingId: e._id, to: this.to, location: this.location, type: InvoiceType[this.invoiceType]});
            });

            var ctrl = this;
            api.invoice.create(viewModels).then(result => {
                ctrl.notify('success', 'Tagihan berhasil dibuat');
                ctrl.filter();
            }).catch(error => {
                ctrl.notify('error', 'Tagihan gagal dibuat ' + error.data);
            });
        }

        change(): void {
            if (!this.toInvoice || this.toInvoice === '') {
                this.notify('warning', 'Tujuan invoice harus diisi');
                return;
            }

            var checkedEntities = this.entities.filter(e => e.checked);

            if (checkedEntities.length === 0) {
                this.notify('warning', 'Tidak ada pengiriman yang dipilih');
                return;
            }

            var viewModels = [];
            checkedEntities.forEach(e => {
                viewModels.push({ shippingId: e._id, fromInvoice: e.invoice.all, toInvoice: this.toInvoice });
            });

            var ctrl = this;
            api.invoice.change(viewModels).then(result => {
                ctrl.notify('success', 'Tagihan berhasil dipindahkan');
                ctrl.filter();
            }).catch(error => {
                ctrl.notify('error', 'Tagihan gagal dipindahkan ' + error.data);
            });
        }

        print(): void {
            var ctrl = this;
            angular.extend(this.selectedEntity, { "typeNum": this.type });

            app.api.invoice.getInvoiceReport(this.selectedEntity).then((result) => {
                angular.extend(result.data, { "orientation": ctrl.orientation, "unit": 'mm', "paper": ctrl.paper, "typeNum": ctrl.type });

                app.api.reportPrint.printInvoice(result.data).then(function (buffer) {
                    var blob = new Blob([buffer.data], { type: 'application/pdf' });
                    var url = URL.createObjectURL(blob);
                    window.open(url, '_blank');
                });
            });
        };

        editInvoice(e): void {
            this.activeEntity = e;
        }

        cancelInvoice(e): void {
            this.activeEntity = null;
        }

        updateInvoice(e): void {
            if (!e.to || e.to == '') {
                this.notify('warning', 'Tertagih harus diisi');
                return;
            }

            if (!e.location || e.location == '') {
                this.notify('warning', 'Lokasi harus diisi');
                return;
            }

            var viewModel = {
                invoiceId: e._id,
                to: e.to,
                location: e.location
            };

            var ctrl = this;

            app.api.invoice.updateInvoice(viewModel).then(function (result) {
                ctrl.notify('success', 'Proses update berhasil');
                ctrl.filter();
            }).catch(function (error) {
                ctrl.notify('error', 'Proses update gagal ' + error.data);
            });
        }

        openPrintOption(entity, type): void {
            this.selectedEntity = entity;
            this.type = type;
            $('#print-option-modal')['modal']('show');
        }
    }

    app.lois.controller('invoiceCtrl', invoiceCtrl);
}