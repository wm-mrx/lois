module app.api {
    export class user {
        static login(data: any) {
            return http.post('/lois/api/user/authenticate', JSON.stringify(data));
        }

        static logout() {
            return http.get('/lois/api/user/logout');
        }

        static getSession() {
            return http.get('/lois/api/user/getSession');
        }
    }

    export class shipping {
        static get(id: any) {
            return http.get('/lois/api/shipping/get?id=' + id);
        }

        static getAll(query: any) {
            return http.get('/lois/api/shipping/getAll?query=' + JSON.stringify(query));
        }

        static getDataReport(data) {
            return http.post('/lois/api/shipping/getDataReport', JSON.stringify(data));
        }

        static save(data: any) {
            return http.post('/lois/api/shipping/save', JSON.stringify(data));
        }

        static add() {
            return http.post('/lois/api/shipping/add', null);
        }
    }

    export class deliveryOrder {
        static getAll(query: any) {
            return http.get('/lois/api/deliveryOrder/getAll?query=' + JSON.stringify(query));
        }

        static getRecapData(shippingId: any) {
            return http.get('/lois/api/deliveryOrder/getRecapData?shippingId=' + shippingId);
        }

        static getDeliveryData(shippingId: any) {
            return http.get('/lois/api/deliveryOrder/getDeliveryData?shippingId=' + shippingId);
        }

        static getDataReport(data: any) {
            return http.post('/lois/api/deliveryOrder/getDataReport', JSON.stringify(data));
        }
    }

    export class home {
        static getOverall(query: any) {
            return app.http.get('/lois/api/home/getOverall?query=' + JSON.stringify(query));
        }

        static getOverallbyDate(date: any) {
            return app.http.get('/lois/api/home/getOverallbyDate?date=' + date);
        }

        static getTotalBelumTerekap(query) {
            return app.http.get('/lois/api/home/getTotalBelumTerekap?query=' + JSON.stringify(query));
        }

        static getTotalTerekap(query) {
            return app.http.get('/lois/api/home/getTotalTerekap?query=' + JSON.stringify(query));
        }

        static getTotalTerkirim(query) {
            return app.http.get('/lois/api/home/getTotalTerkirim?query=' + JSON.stringify(query));
        }

        static getDestinations(query: any) {
            return app.http.get('/lois/api/home/getDestinations?query=' + JSON.stringify(query));
        }

        static getSenders(query: any) {
            return app.http.get('/lois/api/home/getSenders?query=' + JSON.stringify(query));
        }

        static getPaymentTypes(query: any) {
            return app.http.get('/lois/api/home/getPaymentTypes?query=' + JSON.stringify(query));
        }

        static getPaymentStatuses(query: any) {
            return app.http.get('/lois/api/home/getPaymentStatuses?query=' + JSON.stringify(query));
        }

        static getRegions(query: any) {
            return app.http.get('/lois/api/home/getRegions?query=' + JSON.stringify(query));
        }

        static getAll(query: any) {
            return app.http.get('/lois/api/home/getAll?query=' + JSON.stringify(query));
        }
    }

    export class recapitulation {
        static getAll(query: any) {
            return http.get('/lois/api/recapitulation/getAll?query=' + JSON.stringify(query));
        }

        static getAllCancel(query: any) {
            return http.get('/lois/api/recapitulation/getAllCancel?query=' + JSON.stringify(query));
        }

        static recap(data: any) {
            return http.post('/lois/api/recapitulation/recap', JSON.stringify(data));
        }

        static updateRecap(data) {
            return http.post('/lois/api/recapitulation/updateRecap', JSON.stringify(data));
        };

        static cancelRecap(data: any) {
            return http.post('/lois/api/recapitulation/cancelRecap', JSON.stringify(data));
        }
    }

    export class delivery {
        static getAll(query: any) {
            return http.get('/lois/api/delivery/getAll?query=' + JSON.stringify(query));
        }

        static getAllCancel(query: any) {
            return http.get('/lois/api/delivery/getAllCancel?query=' + JSON.stringify(query));
        }

        static delivery(data: any) {
            return http.post('/lois/api/delivery/delivery', JSON.stringify(data));
        }

        static cancelDelivery(data: any) {
            return http.post('/lois/api/delivery/cancelDelivery', JSON.stringify(data));
        }
    }

    export class _return {
        static getAll(query: any) {
            return http.get('/lois/api/return/getAll?query=' + JSON.stringify(query));
        }

        static getAllConfirm(query: any) {
            return http.get('/lois/api/return/getAllConfirm?query=' + JSON.stringify(query));
        }

        static return(data: any) {
            return http.post('/lois/api/return/return', JSON.stringify(data));
        }

        static confirm(data: any) {
            return http.post('/lois/api/return/confirm', JSON.stringify(data));
        }

        static upload(data: any) {
            return http.post('/lois/api/return/uploads', data, { headers: { 'Content-Type': undefined } });
        }
    }

    export class payment {
        static getAll(query: any) {
            return http.get('/lois/api/payment/getAll?query=' + JSON.stringify(query));
        }

        static pay(data: any) {
            return http.post('/lois/api/payment/pay', JSON.stringify(data));
        }

        static deletePay (data) {
            return http.post('/lois/api/payment/deletePay', JSON.stringify(data));
        };

        static updatePay(data) {
            return http.post('/lois/api/payment/updatePay', JSON.stringify(data));
        };
    }

    export class invoice {
        static getAll(query: any) {
            return http.get('/lois/api/invoice/getAll?query=' + JSON.stringify(query));
        }

        static getList(query: any) {
            return http.get('/lois/api/invoice/getList?query=' + JSON.stringify(query));
        }

        static create(data: any) {
            return http.post('/lois/api/invoice/create', JSON.stringify(data));
        }

        static change(data: any) {
            return http.post('/lois/api/invoice/change', JSON.stringify(data));
        }

        static getInvoiceReport(data: any) {
            return http.post('/lois/api/invoice/getInvoiceReport', JSON.stringify(data));
        }

        static updateInvoice(data) {
            return app.http.post('/lois/api/invoice/updateInvoice', JSON.stringify(data));
        }
    }

    export class configuration {
        static get(config: string, id: any) {
            return http.get('/lois/api/' + config + '/get?id=' + id);
        }

        static getAll(config: string, query: any) {
            return http.get('/lois/api/' + config + '/getAll?query=' + JSON.stringify(query));
        }

        static save(config: string, data: any) {
            return http.post('/lois/api/' + config + '/save', JSON.stringify(data));
        }

        static delete(config: string, id: any) {
            return http.delete('/lois/api/' + config + '/delete?id=' + id);
        }
    }

    export class notification {
        static getAll(query: any) {
            return http.get('/lois/api/notification/getAll?query=' + JSON.stringify(query));
        }

        static delete(id: any) {
            return http.delete('/lois/api/notification/delete?id=' + id);
        }
    }

    export class audit {
        static getAll(query: any) {
            return http.get('/lois/api/audit/getAll?query=' + JSON.stringify(query));
        }

        static process(data: any) {
            return http.post('/lois/api/audit/process', JSON.stringify(data));
        }
    }

    export class autocomplete {
        static getAll(name: string, keyword: string) {
            return http.get('/lois/api/' + name + '/getAll?query=' + JSON.stringify({ "name": keyword }));
        }
    }

    export class report {
        static getRecapitulations(query: any) {
            return http.get('/lois/api/reportData/getRecapitulations?query=' + JSON.stringify(query));
        }

        static getRecapitulationsReport(data: any, query: any) {
            return http.post('/lois/api/reportData/getRecapitulationsReport?query= ' + JSON.stringify(query), JSON.stringify(data));
        }

        static getDeliveries(query: any) {
            return http.get('/lois/api/reportData/getDeliveries?query=' + JSON.stringify(query));
        }

        static getDeliveriesReport(data: any, query: any) {
            return http.post('/lois/api/reportData/getDeliveriesReport?query= ' + JSON.stringify(query), JSON.stringify(data));
        }

        static getReturns(query: any) {
            return http.get('/lois/api/reportData/getReturns?query=' + JSON.stringify(query));
        }

        static getReturnsReport(data: any, query: any) {
            return http.post('/lois/api/reportData/getReturnsReport?query= ' + JSON.stringify(query), JSON.stringify(data));
        }

        static getUnconfirmed(query: any) {
            return http.get('/lois/api/reportData/getUnconfirmed?query=' + JSON.stringify(query));
        }

        static getUnconfirmedReport(data: any, query: any) {
            return http.post('/lois/api/reportData/getUnconfirmedReport?query= ' + JSON.stringify(query), JSON.stringify(data));
        }

        static getPaid(query: any) {
            return http.get('/lois/api/reportData/getPaid?query=' + JSON.stringify(query));
        }

        static getPaidReport(data: any, query: any) {
            return http.post('/lois/api/reportData/getPaidReport?query= ' + JSON.stringify(query), JSON.stringify(data));
        }

        static getUnpaid(query: any) {
            return http.get('/lois/api/reportData/getUnpaid?query=' + JSON.stringify(query));
        }

        static getUnpaidReport(data: any, query: any) {
            return http.post('/lois/api/reportData/getUnpaidReport?query= ' + JSON.stringify(query), JSON.stringify(data));
        }

        static getDeliveryList(query: any) {
            return http.get('/lois/api/reportData/getDeliveryList?query=' + JSON.stringify(query));
        }

        static getDeliveryListReport(data: any, query: any) {
            return http.post('/lois/api/reportData/getDeliveryListReport?query= ' + JSON.stringify(query), JSON.stringify(data));
        }

        static getCommisions(query: any) {
            return http.get('/lois/api/reportData/getCommisions?query=' + JSON.stringify(query));
        }

        static getCommisionsReport(data: any, query: any) {
            return http.post('/lois/api/reportData/getCommisionsReport?query=' + JSON.stringify(query), JSON.stringify(data));
        }

        static getPayOff (query) {
            return http.get('/lois/api/reportData/getPayOff?query=' + JSON.stringify(query));
        }

        static getPayOffReport (data, query) {
            return app.http.post('/lois/api/reportData/getPayOffReport?query=' + JSON.stringify(query), JSON.stringify(data));
        }

        static getPartner(query) {
            return app.http.get('/lois/api/reportData/getPartner?query=' + JSON.stringify(query));
        }

        static getPartnerReport (data, query) {
            return app.http.post('/lois/api/reportData/getPartnerReport?query=' + JSON.stringify(query), JSON.stringify(data));
        }
    }

    export class reportPrint {
        static printDeliveryOrder(data: any) {
            var config = {
                "headers": { "content-type": "application/x-www-form-urlencoded; charset=UTF-8" },
                "responseType": "arraybuffer"
            };

            return app.http.post('https://lois.limassentosa.co.id/index.php/deliveryOrder', JSON.stringify(data), config);
        }

        static printPaid(data: any) {
            var config = {
                "headers": { "content-type": "application/x-www-form-urlencoded; charset=UTF-8" },
                "responseType": "arraybuffer"
            };

            return app.http.post('https://lois.limassentosa.co.id/index.php/paid', JSON.stringify(data), config);
        }

        static printUnpaid(data: any) {
            var config = {
                "headers": { "content-type": "application/x-www-form-urlencoded; charset=UTF-8" },
                "responseType": "arraybuffer"
            };

            return app.http.post('https://lois.limassentosa.co.id/index.php/unpaid', JSON.stringify(data), config);
        }

        static printRecapitulation(data: any) {
            var config = {
                "headers": { "content-type": "application/x-www-form-urlencoded; charset=UTF-8" },
                "responseType": "arraybuffer"
            };

            return app.http.post('https://lois.limassentosa.co.id/index.php/recapitulation', JSON.stringify(data), config);
        }

        static printDelivery(data: any) {
            var config = {
                "headers": { "content-type": "application/x-www-form-urlencoded; charset=UTF-8" },
                "responseType": "arraybuffer"
            };

            return app.http.post('https://lois.limassentosa.co.id/index.php/delivery', JSON.stringify(data), config);
        }

        static printReturn(data: any) {
            var config = {
                "headers": { "content-type": "application/x-www-form-urlencoded; charset=UTF-8" },
                "responseType": "arraybuffer"
            };

            return app.http.post('https://lois.limassentosa.co.id/index.php/retur', JSON.stringify(data), config);
        }

        static printUnconfirmed(data: any) {
            var config = {
                "headers": { "content-type": "application/x-www-form-urlencoded; charset=UTF-8" },
                "responseType": "arraybuffer"
            };

            return app.http.post('https://lois.limassentosa.co.id/index.php/sj-balik', JSON.stringify(data), config);
        }

        static printDeliveryList(data: any) {
            var config = {
                "headers": { "content-type": "application/x-www-form-urlencoded; charset=UTF-8" },
                "responseType": "arraybuffer"
            };

            return app.http.post('https://lois.limassentosa.co.id/index.php/deliveryList', JSON.stringify(data), config);
        }

        static printCommision(data: any) {
            var config = {
                "headers": { "content-type": "application/x-www-form-urlencoded; charset=UTF-8" },
                "responseType": "arraybuffer"
            };

            return app.http.post('https://lois.limassentosa.co.id/index.php/commision', JSON.stringify(data), config);
        }

        static printGetPayOff(data: any) {
            var config = {
                "headers": { "content-type": "application/x-www-form-urlencoded; charset=UTF-8" },
                "responseType": "arraybuffer"
            };

            return app.http.post('https://lois.limassentosa.co.id/index.php/pay-off', JSON.stringify(data), config);
        }

        static printPartner(data: any) {
            var config = {
                "headers": { "content-type": "application/x-www-form-urlencoded; charset=UTF-8" },
                "responseType": "arraybuffer"
            };

            return app.http.post('https://lois.limassentosa.co.id/index.php/partner', JSON.stringify(data), config);
        }

        static printInvoice(data: any) {
            var config = {
                "headers": { "content-type": "application/x-www-form-urlencoded; charset=UTF-8" },
                "responseType": "arraybuffer"
            };

            return app.http.post('https://lois.limassentosa.co.id/index.php/invoice', JSON.stringify(data), config);
        }
    }
}