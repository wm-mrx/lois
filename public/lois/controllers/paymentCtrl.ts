module app.controllers {
    enum ViewType { payment = 0, phases = 1 };

    class paymentCtrl extends baseCtrl {
        paymentType: any;
        date: any;
        viewType: ViewType;
        selectedEntity: any;
        dataTransferDate: any;
        activeEntity: any;

        static $inject = ['$scope', 'Notification'];

        constructor($scope, Notification) {
            super(Notification);
            this.viewType = ViewType.payment;
            this.functions.load = api.payment.getAll;
            this.functions.autocomplete = api.autocomplete.getAll;
            this.filter();
        }

        pay(): void {
           if(!this.date || this.date == ''){
              this.notify('warning', 'Tanggal transfer harus diisi')
              return;
           }

           var checkedEntities = this.entities.filter(e => e.checked);

           if(checkedEntities.length === 0){
              this.notify('warning', 'Tidak ada pengiriman yang dipilih');
              return;
           }

           var viewModels = [];

           checkedEntities.forEach(entity => {
                viewModels.push({
                  shippingId: entity._id,
                  bank: entity.viewModel.bank,
                  notes: entity.viewModel.notes,
                  amount: entity.viewModel.amount || 0,
                  transferDate: this.date,
                  paymentTypeId: this.paymentType ? this.paymentType._id : entity.payment.type._id
                });
            });

            var ctrl = this;
            app.api.payment.pay(viewModels).then(result => {
                ctrl.notify('success', 'Proses pembayaran berhasil');
                ctrl.filter();
            }).catch(error => {
                ctrl.notify('error', 'Proses pembayaran gagal ' + error.data);
            });
        }

        viewPhases(entity: any): void {
            this.viewType = ViewType.phases;
            this.selectedEntity = entity;
        }

        viewPayments(): void {
            this.viewType = ViewType.payment;
            this.selectedEntity = null;
        }

        editPay(entity): void {
            if (this.selectedEntity.audited) {
                this.notify('warning', 'Pengiriman ini sedang diaudit oleh manager');
                return;
            }

            var dates = new Date(entity.transferDate);
            var dd = dates.getDate();
            var mm = dates.getMonth() + 1;
            var yyyy = dates.getFullYear();

            var ToDate = yyyy + '-' + mm + '-' + dd;
            this.dataTransferDate = ToDate;

            this.activeEntity = entity;
        }

        deletePay(entity): void {
            if (this.selectedEntity.audited) {
                this.notify('warning', 'Pengiriman ini sedang diaudit oleh manager');
                return;
            }

            var confirmed = confirm('Item akan dihapus, anda yakin?');
            if (!confirmed)
                return;

            var viewModel = {
                shippingId: this.selectedEntity._id,
                phasesId: entity._id,
                spbNumber: this.selectedEntity.spbNumber,
                amount: entity.amount
            };

            var ctrl = this;
            app.api.payment.deletePay(viewModel).then(function (result) {
                ctrl.notify('success', 'Hapus pembayaran berhasil');
                ctrl.filter();
            }).catch(function (error) {
                ctrl.notify('error', 'Hapus pembayaran gagal ' + error.data);
            });
        }

        updatePay(entity): void {
            if (this.selectedEntity.audited) {
                this.notify('warning', 'Pengiriman ini sedang diaudit oleh manager');
                return;
            }

            if (!this.dataTransferDate || this.dataTransferDate == '') {
                this.notify('warning', 'Tanggal transfer harus diisi');
                return;
            }

            if (!entity.amount || entity.amount == '' || entity.amount == 0) {
                this.notify('warning', 'Jumlah bayar harus diisi');
                return;
            }

            var viewModel = {
                shippingId: this.selectedEntity._id,
                spbNumber: this.selectedEntity.spbNumber,
                phasesId: entity._id,
                bank: entity.bank,
                notes: entity.notes,
                amount: entity.amount,
                transferDate: this.dataTransferDate,
                date: entity.date
            };

            var ctrl = this;
            app.api.payment.updatePay(viewModel).then(function (result) {
                ctrl.notify('success', 'Proses pembayaran berhasil');
                ctrl.filter();
            }).catch(function (error) {
                ctrl.notify('error', 'Proses pembayaran gagal ' + error.data);
            });
        }

        cancelPay(): void {
            this.activeEntity = null;
        }

        load(): void {
            var ctrl = this;
            ctrl.createQuery();
            ctrl.loadingData = true;
            ctrl.functions.load(ctrl.query).then(result => {
                ctrl.entities = result.data;

                if (ctrl.viewType == ViewType.phases) {
                    var entity = ctrl.entities.filter(function (e) { return e['_id'] === ctrl.selectedEntity['_id']; })[0];
                    ctrl.viewPhases(entity);
                }
            }).catch(function (error) {
                ctrl.notify('error', error.data);
            }).finally(function () {
                ctrl.loadingData = false;
            });
        }
    }

    app.lois.controller('paymentCtrl', paymentCtrl);
}