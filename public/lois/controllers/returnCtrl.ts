﻿module app.controllers {
    class returnCtrl extends baseCtrl {
        files: any[];

        static $inject = ['$scope', 'Notification'];

        constructor($scope, Notification) {
            super(Notification);
            this.functions.load = api._return.getAll;
            this.functions.autocomplete = app.api.autocomplete.getAll;
            this.filter();
        }

        upload(file, entity): void {
            var fd = new FormData();
            fd.append('file', file);

            entity.shipping[0].returnInfo.filePath = null;

            var ctrl = this;
            app.api._return.upload(fd).then(result => {
                entity.shipping[0].returnInfo.filePath = result.data['filename'];
            }).catch(error => {
                ctrl.notify('error', error.data);
            });
        }

        process(): void {
            var checkedEntities = this.entities.filter(e => e.checked);

            if (checkedEntities.length === 0) {
                this.notify('warning', 'Tidak ada pengiriman yang dipilih');
                return;
            }

            var ctrl = this;
            var data = checkedEntities.map(e => e.shipping[0]);

            for (var i = 0; i < data.length; i++) {
                if (!data[i]['returnInfo']['limasColor'] || data[i]['returnInfo']['limasColor'] === "") {
                    this.notify('warning', 'Warna limas tidak boleh kosong');
                    return;
                }
                if (!data[i]['returnInfo']['relationColor'] || data[i]['returnInfo']['relationColor'] === "") {
                    this.notify('warning', 'Warna relasi tidak boleh kosong');
                    return;
                }
                if (!data[i]['returnInfo']['relationCode'] || data[i]['returnInfo']['relationCode'] === "") {
                    this.notify('warning', 'Kode relasi tidak boleh kosong');
                    return;
                }
                if (!data[i]['returnInfo']['concernedPerson'] || data[i]['returnInfo']['concernedPerson'] === "") {
                    this.notify('warning', 'Nama penerima tidak boleh kosong');
                    return;
                }
            }

            app.api._return.return(data).then(result => {
                ctrl.notify('success', 'Proses retur berhasil');
                ctrl.filter();
            }).catch(error => {
                ctrl.notify('error', 'Proses retur gagal ' + error.data);
            });
        }
    }

    app.lois.controller('returnCtrl', returnCtrl);
}