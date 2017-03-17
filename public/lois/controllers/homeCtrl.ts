module app.controllers {
    declare var Highcharts: any;

    enum ViewType { summary = 1, detail = 2 };
    enum SummaryType { table = 1, chart = 2 };
    enum ChartType {
        price = 1,
        colli = 2,
        weight = 3,
        shipping = 4
    };

    class homeCtrl extends baseCtrl {
        overall: any;
        type: string;
        summary: string;
        viewType: ViewType;
        summaryType: SummaryType;
        chartType: ChartType;
        currentDate: Date;
        priceData: any[];
        colliData: any[];
        weightData: any[];
        shippingData: any[];
        chartConfig: any;
        belumTerekap: number;
        terekap: number;
        terkirim: number;

        static $inject = ['$scope', 'Notification'];

        constructor($scope, Notification) {
            super(Notification);
            var dates = new Date();
            var dd = dates.getDate();
            var mm = dates.getMonth() + 1;
            var yyyy = dates.getFullYear();

            var ToDate = yyyy + '-' + mm + '-' + dd;
            this.filters.date = ToDate;
            this.terekap = 0;
            this.belumTerekap = 0;
            this.terkirim = 0;
            this.initHighchart();
            this.viewType = ViewType.summary;
            this.summaryType = SummaryType.table;
            this.chartConfig = {};
            this.filter();
        }

        filter(): void {
            this.paging.page = 1;
            this.createQuery();
            this.loadItemStatuses();
            this.loadBarChartData();
            this.loadOverall();
            if (this.summary)
                this.onSummaryChanges(this.summary);
            else
                this.onSummaryChanges('destination');
        }

        loadItemStatuses(): void {
            var ctrl = this;
            var query = { "date": this.filters.date };

            api.home.getTotalBelumTerekap(query).then(res => {
                if (res.data[0])
                    ctrl.belumTerekap = res.data[0]['total'];
                else
                    ctrl.belumTerekap = 0;
            });

            api.home.getTotalTerekap(query).then(res => {
                if (res.data[0])
                    ctrl.terekap = res.data[0]['total'];
                else
                    ctrl.terekap = 0;
            });

            api.home.getTotalTerkirim(query).then(res => {
                if (res.data[0])
                    ctrl.terkirim = res.data[0]['total'];
                else
                    ctrl.terkirim = 0;
            });
        }

        initHighchart(): void {
            Highcharts.setOptions({
                global: {
                    useUTC: false
                },
                lang: {
                    loading: 'Memuat...',
                    months: ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'],
                    weekdays: ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
                    shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
                    exportButtonTitle: "Ekspor",
                    printButtonTitle: "Cetak",
                    rangeSelectorFrom: "Dari",
                    rangeSelectorTo: "Ke",
                    rangeSelectorZoom: "Pembesaran",
                    downloadPNG: 'Unduh PNG',
                    downloadJPEG: 'Unduh JPEG',
                    downloadPDF: 'Unduh PDF',
                    downloadSVG: 'Unduh SVG',
                    printChart: 'Cetak gambar',
                    resetZoom: "Reset pembesaran",
                    resetZoomTitle: "Reset pembesaran",
                    thousandsSep: ".",
                    decimalPoint: ','
                }
            });
        }

        loadBarChartData(): void {
            var now = new Date();
            var first = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
            var second = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2);
            var third = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3);
            var fourth = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 4);
            var fifth = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5);
            var sixth = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
      
            var priceData: any[] = [];
            var colliData: any[] = [];
            var weightData: any[] = [];
            var shippingData: any[] = [];

            var ctrl = this;
            var query = { "date": this.filters.date };

            var loadNowData = () => app.api.home.getOverallbyDate(now).then(res => {
                var data = <Array<any>>res.data;

                if (data[0]) {
                    priceData.push([ctrl.createUTC(now), data[0].price]);
                    colliData.push([ctrl.createUTC(now), data[0].colli]);
                    weightData.push([ctrl.createUTC(now), data[0].weight]);
                    shippingData.push([ctrl.createUTC(now), data[0].shippings]);
                }
                else {
                    priceData.push([ctrl.createUTC(now), 0]);
                    colliData.push([ctrl.createUTC(now), 0]);
                    weightData.push([ctrl.createUTC(now), 0]);
                    shippingData.push([ctrl.createUTC(now), 0]);
                }
            });

            var loadFirstData = () => app.api.home.getOverallbyDate(first).then(res => {
                var data = <Array<any>>res.data;

                if (data[0]) {
                    priceData.push([ctrl.createUTC(first), data[0].price]);
                    colliData.push([ctrl.createUTC(first), data[0].colli]);
                    weightData.push([ctrl.createUTC(first), data[0].weight]);
                    shippingData.push([ctrl.createUTC(first), data[0].shippings]);
                }
                else {
                    priceData.push([ctrl.createUTC(first), 0]);
                    colliData.push([ctrl.createUTC(first), 0]);
                    weightData.push([ctrl.createUTC(first), 0]);
                    shippingData.push([ctrl.createUTC(first), 0]);
                }
            });

            var loadSecondData = () => app.api.home.getOverallbyDate(second).then(res => {
                var data = <Array<any>>res.data;

                if (data[0]) {
                    priceData.push([ctrl.createUTC(second), data[0].price]);
                    colliData.push([ctrl.createUTC(second), data[0].colli]);
                    weightData.push([ctrl.createUTC(second), data[0].weight]);
                    shippingData.push([ctrl.createUTC(second), data[0].shippings]);
                }
                else {
                    priceData.push([ctrl.createUTC(second), 0]);
                    colliData.push([ctrl.createUTC(second), 0]);
                    weightData.push([ctrl.createUTC(second), 0]);
                    shippingData.push([ctrl.createUTC(second), 0]);
                }
            });

            var loadThirdData = () => app.api.home.getOverallbyDate(third).then(res => {
                var data = <Array<any>>res.data;

                if (data[0]) {
                    priceData.push([ctrl.createUTC(third), data[0].price]);
                    colliData.push([ctrl.createUTC(third), data[0].colli]);
                    weightData.push([ctrl.createUTC(third), data[0].weight]);
                    shippingData.push([ctrl.createUTC(third), data[0].shippings]);
                }
                else {
                    priceData.push([ctrl.createUTC(third), 0]);
                    colliData.push([ctrl.createUTC(third), 0]);
                    weightData.push([ctrl.createUTC(third), 0]);
                    shippingData.push([ctrl.createUTC(third), 0]);
                }
            });

            var loadFourtData = () => app.api.home.getOverallbyDate(fourth).then(res => {
                var data = <Array<any>>res.data;

                if (data[0]) {
                    priceData.push([ctrl.createUTC(fourth), data[0].price]);
                    colliData.push([ctrl.createUTC(fourth), data[0].colli]);
                    weightData.push([ctrl.createUTC(fourth), data[0].weight]);
                    shippingData.push([ctrl.createUTC(fourth), data[0].shippings]);
                }
                else {
                    priceData.push([ctrl.createUTC(fourth), 0]);
                    colliData.push([ctrl.createUTC(fourth), 0]);
                    weightData.push([ctrl.createUTC(fourth), 0]);
                    shippingData.push([ctrl.createUTC(fourth), 0]);
                }
            });

            var loadFifthData = () => app.api.home.getOverallbyDate(fifth).then(res => {
                var data = <Array<any>>res.data;

                if (data[0]) {
                    priceData.push([ctrl.createUTC(fifth), data[0].price]);
                    colliData.push([ctrl.createUTC(fifth), data[0].colli]);
                    weightData.push([ctrl.createUTC(fifth), data[0].weight]);
                    shippingData.push([ctrl.createUTC(fifth), data[0].shippings]);
                }
                else {
                    priceData.push([ctrl.createUTC(fifth), 0]);
                    colliData.push([ctrl.createUTC(fifth), 0]);
                    weightData.push([ctrl.createUTC(fifth), 0]);
                    shippingData.push([ctrl.createUTC(fifth), 0]);
                }
            });

            var loadSixthData = () => app.api.home.getOverallbyDate(sixth).then(res => {
                var data = <Array<any>>res.data;

                if (data[0]) {
                    priceData.push([ctrl.createUTC(sixth), data[0].price]);
                    colliData.push([ctrl.createUTC(sixth), data[0].colli]);
                    weightData.push([ctrl.createUTC(sixth), data[0].weight]);
                    shippingData.push([ctrl.createUTC(sixth), data[0].shippings]);
                }
                else {
                    priceData.push([ctrl.createUTC(sixth), 0]);
                    colliData.push([ctrl.createUTC(sixth), 0]);
                    weightData.push([ctrl.createUTC(sixth), 0]);
                    shippingData.push([ctrl.createUTC(sixth), 0]);
                }
            });

            loadNowData()
                .then(() => loadFirstData())
                .then(() => loadSecondData())
                .then(() => loadThirdData())
                .then(() => loadFourtData())
                .then(() => loadFifthData())
                .then(() => loadSixthData())
                .then(() => {
                    priceData = priceData.sort((a, b) => {
                        return a[0] - b[0];
                    });

                    colliData = colliData.sort((a, b) => {
                        return a[0] - b[0];
                    });

                    weightData = weightData.sort((a, b) => {
                        return a[0] - b[0];
                    });

                    shippingData = shippingData.sort((a, b) => {
                        return a[0] - b[0];
                    });

                    var priceConfig = ctrl.getBarChartConfig();
                    priceConfig.title.text = 'Harga Dalam 1 Minggu Terakhir';
                    priceConfig.yAxis.title.text = 'Harga';
                    priceConfig.xAxis.min = ctrl.createUTC(sixth);
                    priceConfig.xAxis.max = ctrl.createUTC(now);
                    priceConfig.series.push({ data: priceData });
                    ctrl.chartConfig[ChartType.price] = priceConfig;

                    var colliConfig = ctrl.getBarChartConfig();
                    colliConfig.title.text = 'Coli Dalam 1 Minggu Terakhir';
                    colliConfig.yAxis.title.text = 'Qty';
                    colliConfig.xAxis.min = ctrl.createUTC(sixth);
                    colliConfig.xAxis.max = ctrl.createUTC(now);
                    colliConfig.series.push({ data: colliData });
                    ctrl.chartConfig[ChartType.colli] = colliConfig;

                    var weightConfig = ctrl.getBarChartConfig();
                    weightConfig.title.text = 'Berat Dalam 1 Minggu Terakhir';
                    weightConfig.yAxis.title.text = 'Kg';
                    weightConfig.xAxis.min = ctrl.createUTC(sixth);
                    weightConfig.xAxis.max = ctrl.createUTC(now);
                    weightConfig.series.push({ data: weightData });
                    ctrl.chartConfig[ChartType.weight] = weightConfig;

                    var shippingConfig = ctrl.getBarChartConfig();
                    shippingConfig.title.text = 'Transaksi Pengiriman Dalam 1 Minggu Terakhir';
                    shippingConfig.yAxis.title.text = 'Transaction';
                    shippingConfig.xAxis.min = ctrl.createUTC(sixth);
                    shippingConfig.xAxis.max = ctrl.createUTC(now);
                    shippingConfig.series.push({ data: shippingData });
                    ctrl.chartConfig[ChartType.shipping] = shippingConfig;
                   
                });
        }

        createUTC(date: Date): any {
            return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
        }

        loadOverall(): void {
            var ctrl = this;
            app.api.home.getOverall(ctrl.query).then(result => {
                ctrl.overall = result.data;
                ctrl.currentDate = new Date();
            }).catch(error => {
                ctrl.notify('error', error.data);
            });
        }

        onSummaryChanges(summary: string): void {
            switch (summary) {
                case 'destination':
                    this.summaryType = SummaryType.table;
                    this.functions.load = app.api.home.getDestinations;
                    this.type = 'destination'; 
                    break;
                case 'sender':
                    this.functions.load = app.api.home.getSenders;
                    this.type = 'sender';
                    this.summaryType = SummaryType.table;
                    break;
                case 'paymentType':
                    this.summaryType = SummaryType.table;
                    this.functions.load = app.api.home.getPaymentTypes;
                    //this.type = 'payment.type';
                    this.type = 'paymentType';
                    break;
                case 'paymentStatus':
                    this.summaryType = SummaryType.table;
                    this.functions.load = app.api.home.getPaymentStatuses;
                    //this.type = 'payment.status';
                    this.type = 'paymentStatus';
                    break;
                case 'region':
                    this.summaryType = SummaryType.table;
                    this.functions.load = app.api.home.getRegions;
                    //this.type = 'regions.destination';
                    this.type = 'regionDest';
                    break;
                case 'priceBar':
                    this.summaryType = SummaryType.chart;
                    this.chartType = ChartType.price;
                    break;
                case 'colliBar':
                    this.summaryType = SummaryType.chart;
                    this.chartType = ChartType.colli;
                    break;
                case 'weightBar':
                    this.summaryType = SummaryType.chart;
                    this.chartType = ChartType.weight;
                    break;
                case 'shippingBar':
                    this.summaryType = SummaryType.chart;
                    this.chartType = ChartType.shipping;
                    break;
            }

            this.summary = summary;
            this.viewType = ViewType.summary;
            this.paging.page = 1;
            
            if (this.summaryType === SummaryType.table)
                this.load();
        }

        viewDetails(id): void {
            this.filters[this.type] = id;
            this.functions.load = api.home.getAll;
            this.viewType = ViewType.detail;
            this.paging.page = 1;
            //this.filter();
            this.createQuery();
            this.load();
        }

        viewSummary(): void {
            delete this.filters[this.type];
            this.viewType = ViewType.summary;
           
            this.onSummaryChanges(this.summary);
        }

        getBarChartConfig(): any {
            var date = new Date();
            return {
                options: {
                    chart: { type: 'column' },
                    tooltip: {
                        style: {
                            padding: 10,
                            fontWeight: 'bold'
                        }
                    }
                },
                title: {
                    text: ''
                },
                subtitle: {
                    type: ''
                },
                xAxis: {
                    type: 'datetime',
                    dateTimeLabelFormats: {
                        month: '%e. %b',
                        year: '%b'
                    }
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: ''
                    },
                    opposite: false
                },
                plotOptions: {
                    column: {
                        pointPadding: 0.2,
                        borderWidth: 0
                    }
                },
                series: [],
                useHighStocks: true,
            }
        }
    }

    app.lois.controller('homeCtrl', homeCtrl);
}